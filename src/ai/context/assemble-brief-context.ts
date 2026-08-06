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
import { redactDeep } from "@/ai/context/redact";

export type BriefContextPacket = {
  operationId: "build-research-brief";
  contractIds: Array<"confirmed-profile" | "interview-question" | "interview-answer">;
  schemaVersions: Record<string, string>;
  packet: {
    confirmedProfile: {
      profileVersion: string;
      ownerNotes: string;
      fields: Array<{
        key: string;
        value: string;
        status: string;
        classification: string;
        confidence: string;
        evidenceRefs: string[];
      }>;
    };
    acceptedAnswers: Array<{
      questionId: string;
      decisionCategory: string;
      question: string;
      whyThisMatters: string;
      answerText: string;
      usedSuggestion: boolean;
      supportingDocumentSummaries: string[];
    }>;
  };
  provenanceNotes: string[];
  truncationWarnings: string[];
  charCount: number;
};

export function assembleBriefContext(input: {
  confirmedProfile: ConfirmedCompanyProfile;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
}): BriefContextPacket {
  const truncationWarnings: string[] = [];
  const provenanceNotes = [
    "Source: confirmed profile + accepted interview answers.",
    `profileVersion=${input.confirmedProfile.profileVersion}`,
  ];

  const fields = Object.entries(input.confirmedProfile.fields)
    .filter(([, field]) => field.status === "confirmed" || field.status === "corrected")
    .slice(0, CONTEXT_BUDGETS.profileFieldsMax)
    .map(([key, field]) => ({
      key,
      value: truncateString(field.value, 500).value,
      status: field.status,
      classification: field.originalClassification,
      confidence: field.confidence,
      evidenceRefs: field.evidenceRefs.slice(0, 8),
    }));

  const answersById = new Map(input.answers.map((a) => [a.questionId, a]));
  const acceptedAnswers = input.questions.map((q) => {
    const answer = answersById.get(q.questionId);
    const answerCut = truncateString(
      answer?.answerText ?? "",
      CONTEXT_BUDGETS.answerExcerptChars,
    );
    if (answerCut.truncated) truncationWarnings.push(`Truncated answer ${q.questionId}.`);
    return {
      questionId: q.questionId,
      decisionCategory: q.decisionCategory,
      question: q.question,
      whyThisMatters: truncateString(q.whyThisMatters, 320).value,
      answerText: answerCut.value,
      usedSuggestion: answer?.usedSuggestion ?? false,
      supportingDocumentSummaries: (answer?.supportingDocuments ?? []).map((doc) => {
        const cut = truncateString(doc.extractedSummary, CONTEXT_BUDGETS.documentSummaryChars);
        if (cut.truncated) {
          truncationWarnings.push(`Truncated document summary ${doc.documentId}.`);
        }
        return `${doc.fileName}: ${cut.value}`;
      }),
    };
  });

  const packet = {
    confirmedProfile: {
      profileVersion: input.confirmedProfile.profileVersion,
      ownerNotes: truncateString(input.confirmedProfile.ownerNotes ?? "", 800).value,
      fields,
    },
    acceptedAnswers,
  };

  while (
    measureJsonChars(packet) > CONTEXT_BUDGETS.briefChars &&
    packet.acceptedAnswers.length > 2
  ) {
    const dropped = packet.acceptedAnswers.shift();
    if (dropped) {
      truncationWarnings.push(`Dropped earlier Q/A ${dropped.questionId} for brief budget.`);
    }
  }

  const redacted = redactDeep(packet);
  return {
    operationId: "build-research-brief",
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
