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
import {
  buildDecisionLedger,
  summarizeDecisionLedger,
  type DecisionOrigin,
} from "@/features/research-prompt-builder/state/decision-ledger";

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
      questionKind: string;
      question: string;
      whyThisMatters: string;
      answerText: string;
      usedSuggestion: boolean;
      /** Owner-selected research priorities (ids only; card bodies live in answerText). */
      selectedSuggestionIds: string[];
      customDirection: string | null;
      supportingDocumentSummaries: string[];
    }>;
    /** Derived provenance (rebuild-on-read; never persisted separately). */
    decisionLedger: {
      profileVersion: string;
      counts: Record<DecisionOrigin, number>;
      records: Array<{
        decisionId: string;
        category: string;
        origin: DecisionOrigin;
        confidence: string;
        sourceQuestionId?: string;
      }>;
    };
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
  // Never pass full strategicSuggestions arrays into the brief — only the
  // owner-composed answerText (selected + custom). Unselected cards stay out.
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
      questionKind: q.questionKind,
      question: q.question,
      whyThisMatters: truncateString(q.whyThisMatters, 320).value,
      answerText: answerCut.value,
      usedSuggestion: answer?.usedSuggestion ?? false,
      selectedSuggestionIds: answer?.selectedSuggestionIds ?? [],
      customDirection: answer?.customDirection ?? null,
      supportingDocumentSummaries: (answer?.supportingDocuments ?? []).map((doc) => {
        const cut = truncateString(doc.extractedSummary, CONTEXT_BUDGETS.documentSummaryChars);
        if (cut.truncated) {
          truncationWarnings.push(`Truncated document summary ${doc.documentId}.`);
        }
        return `${doc.fileName}: ${cut.value}`;
      }),
    };
  });

  const ledger = buildDecisionLedger({
    confirmedProfile: input.confirmedProfile,
    questions: input.questions,
    answers: input.answers,
  });
  const ledgerSummary = summarizeDecisionLedger(ledger);
  provenanceNotes.push(
    `decisionLedger: ${ledgerSummary.total} records (owner_confirmed=${ledgerSummary.byOrigin.owner_confirmed}, owner_corrected=${ledgerSummary.byOrigin.owner_corrected}, owner_authored_answer=${ledgerSummary.byOrigin.owner_authored_answer}, suggestion_accepted=${ledgerSummary.byOrigin.suggestion_accepted}, owner_selected_suggestion=${ledgerSummary.byOrigin.owner_selected_suggestion}, restriction=${ledgerSummary.byOrigin.restriction})`,
  );

  const packet = {
    confirmedProfile: {
      profileVersion: input.confirmedProfile.profileVersion,
      ownerNotes: truncateString(input.confirmedProfile.ownerNotes ?? "", 800).value,
      fields,
    },
    acceptedAnswers,
    decisionLedger: {
      profileVersion: ledger.profileVersion,
      counts: ledgerSummary.byOrigin,
      records: ledger.records.slice(0, 40).map((record) => ({
        decisionId: record.decisionId,
        category: record.category,
        origin: record.origin,
        confidence: record.confidence,
        ...(record.sourceQuestionId
          ? { sourceQuestionId: record.sourceQuestionId }
          : {}),
      })),
    },
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
