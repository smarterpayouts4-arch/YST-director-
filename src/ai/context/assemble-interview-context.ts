import type {
  ConfirmedCompanyProfile,
  InterviewAnswer,
  InterviewQuestion,
} from "@/features/research-prompt-builder/schemas";
import { getContractSchemaVersion } from "@/ai/contracts/registry";
import {
  CONTEXT_BUDGETS,
  measureJsonChars,
  truncateString,
} from "@/ai/context/budgets";
import {
  buildEvidenceAllowlist,
  type EvidenceAllowlistEntry,
} from "@/ai/context/evidence-allowlist";
import { redactDeep } from "@/ai/context/redact";

export type InterviewContextPacket = {
  operationId: "generate-next-question";
  contractIds: Array<"confirmed-profile" | "interview-question" | "interview-answer">;
  schemaVersions: Record<string, string>;
  packet: {
    profileSummary: Array<{
      key: string;
      value: string;
      status: string;
      classification: string;
      confidence: string;
    }>;
    /** Non-rejected profile field keys — the only legal evidenceRefs for strategy cards. */
    evidenceAllowlist: EvidenceAllowlistEntry[];
    priorQa: Array<{
      questionId: string;
      decisionCategory: string;
      question: string;
      answerText: string;
      usedSuggestion: boolean;
      documentSummaries: string[];
    }>;
    unresolvedUnknowns: string[];
    remainingSlots: number;
    /** True when this call should produce the strategic_direction first question. */
    requireStrategicDirection: boolean;
    /** CORE items already satisfied by answers, selected hypotheses, or profile. */
    coreResolutions: Array<{
      category: string;
      source: string;
      sourceKey: string;
    }>;
    unresolvedCoreCategories: string[];
  };
  provenanceNotes: string[];
  truncationWarnings: string[];
  charCount: number;
};

export function assembleInterviewContext(input: {
  confirmedProfile: ConfirmedCompanyProfile;
  previousQuestions: InterviewQuestion[];
  previousAnswers: InterviewAnswer[];
  unresolvedUnknowns: string[];
  remainingSlots: number;
  coreResolutions?: Array<{
    category: string;
    source: string;
    sourceKey: string;
  }>;
  unresolvedCoreCategories?: string[];
}): InterviewContextPacket {
  const truncationWarnings: string[] = [];
  const provenanceNotes = [
    "Source: owner-confirmed profile + prior Q/A only.",
    `profileVersion=${input.confirmedProfile.profileVersion}`,
  ];

  const fieldEntries = Object.entries(input.confirmedProfile.fields).slice(
    0,
    CONTEXT_BUDGETS.profileFieldsMax,
  );
  if (Object.keys(input.confirmedProfile.fields).length > fieldEntries.length) {
    truncationWarnings.push("Truncated confirmed profile fields for interview budget.");
  }

  const answersById = new Map(input.previousAnswers.map((a) => [a.questionId, a]));
  const priorQa = input.previousQuestions
    .slice(-CONTEXT_BUDGETS.priorQaPairsMax)
    .map((q) => {
      const answer = answersById.get(q.questionId);
      const answerCut = truncateString(
        answer?.answerText ?? "",
        CONTEXT_BUDGETS.answerExcerptChars,
      );
      if (answerCut.truncated) truncationWarnings.push(`Truncated answer ${q.questionId}.`);
      const docs = (answer?.supportingDocuments ?? []).map((doc) => {
        const cut = truncateString(doc.extractedSummary, CONTEXT_BUDGETS.documentSummaryChars);
        if (cut.truncated) {
          truncationWarnings.push(`Truncated document summary ${doc.documentId}.`);
        }
        return `${doc.fileName}: ${cut.value}`;
      });
      return {
        questionId: q.questionId,
        decisionCategory: q.decisionCategory,
        question: q.question,
        answerText: answerCut.value,
        usedSuggestion: answer?.usedSuggestion ?? false,
        documentSummaries: docs,
      };
    });

  const unresolvedUnknowns = input.unresolvedUnknowns
    .slice(0, CONTEXT_BUDGETS.unresolvedUnknownsMax)
    .map((item) => truncateString(item, 240).value);
  if (input.unresolvedUnknowns.length > unresolvedUnknowns.length) {
    truncationWarnings.push("Truncated unresolved unknowns list.");
  }

  const evidenceAllowlist = buildEvidenceAllowlist(input.confirmedProfile).map(
    (entry) => ({
      ...entry,
      value: truncateString(entry.value, 400).value,
    }),
  );

  const packet = {
    profileSummary: fieldEntries.map(([key, field]) => ({
      key,
      value: truncateString(field.value, 400).value,
      status: field.status,
      classification: field.originalClassification,
      confidence: field.confidence,
    })),
    evidenceAllowlist,
    priorQa,
    unresolvedUnknowns,
    remainingSlots: input.remainingSlots,
    // Strategy cards at most once while strategic research priorities remain
    // unresolved — gated on material orientation gap, not a bare "Q1" rule.
    requireStrategicDirection:
      input.previousQuestions.length === 0 &&
      !input.previousQuestions.some((q) => q.questionKind === "strategic_direction"),
    coreResolutions: input.coreResolutions ?? [],
    unresolvedCoreCategories: input.unresolvedCoreCategories ?? [],
  };

  if (measureJsonChars(packet) > CONTEXT_BUDGETS.interviewChars) {
    truncationWarnings.push("Interview context exceeded soft budget; dropping older Q/A first.");
    while (
      packet.priorQa.length > 1 &&
      measureJsonChars(packet) > CONTEXT_BUDGETS.interviewChars
    ) {
      packet.priorQa.shift();
    }
  }

  const redacted = redactDeep(packet);
  return {
    operationId: "generate-next-question",
    contractIds: ["confirmed-profile", "interview-question", "interview-answer"],
    schemaVersions: {
      "confirmed-profile": getContractSchemaVersion("confirmed-profile"),
      "interview-question": getContractSchemaVersion("interview-question"),
      "interview-answer": getContractSchemaVersion("interview-answer"),
    },
    packet: redacted.value,
    provenanceNotes: [
      ...provenanceNotes,
      ...redacted.redactions.map((r) => `redacted:${r}`),
    ],
    truncationWarnings: [...new Set(truncationWarnings)],
    charCount: measureJsonChars(redacted.value),
  };
}
