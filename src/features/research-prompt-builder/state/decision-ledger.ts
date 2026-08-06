import type {
  ConfirmedCompanyProfile,
  InterviewAnswer,
  InterviewQuestion,
} from "@/features/research-prompt-builder/schemas";

export type DecisionOrigin =
  | "observed"
  | "owner_confirmed"
  | "owner_corrected"
  | "interview_answer"
  | "working_hypothesis"
  | "restriction";

export type DecisionRecord = {
  decisionId: string;
  category: string;
  value: string;
  origin: DecisionOrigin;
  evidenceRefs: string[];
  sourceQuestionId?: string;
  confidence: "high" | "medium" | "low" | "n/a";
  recordedAt: string;
};

export type DecisionLedger = {
  profileVersion: string;
  records: DecisionRecord[];
  builtAt: string;
};

function fieldOrigin(
  status: ConfirmedCompanyProfile["fields"][string]["status"],
  classification: ConfirmedCompanyProfile["fields"][string]["originalClassification"],
): DecisionOrigin {
  if (status === "corrected") return "owner_corrected";
  if (status === "confirmed") return "owner_confirmed";
  if (classification === "observed_fact") return "observed";
  if (classification === "working_assumption") return "working_hypothesis";
  return "working_hypothesis";
}

export function buildDecisionLedger(input: {
  confirmedProfile: ConfirmedCompanyProfile;
  questions?: InterviewQuestion[];
  answers?: InterviewAnswer[];
}): DecisionLedger {
  const recordedAt = new Date().toISOString();
  const records: DecisionRecord[] = [];

  for (const [key, field] of Object.entries(input.confirmedProfile.fields)) {
    if (field.status === "rejected") continue;
    const isRestriction =
      /restrict|claim|regulat|compliance|disclaimer|cannot|must not/i.test(key) ||
      /restrict|cannot|must not|prohibited|disclaimer/i.test(field.value);

    records.push({
      decisionId: `profile:${key}`,
      category: key,
      value: field.value,
      origin: isRestriction ? "restriction" : fieldOrigin(field.status, field.originalClassification),
      evidenceRefs: field.evidenceRefs,
      confidence: field.confidence,
      recordedAt,
    });
  }

  const answers = input.answers ?? [];
  const questions = input.questions ?? [];
  const questionById = new Map(questions.map((q) => [q.questionId, q]));

  for (const answer of answers) {
    const question = questionById.get(answer.questionId);
    records.push({
      decisionId: `answer:${answer.questionId}`,
      category: question?.decisionCategory ?? "interview_answer",
      value: answer.answerText,
      origin: "interview_answer",
      evidenceRefs: question?.evidenceRefs ?? [],
      sourceQuestionId: answer.questionId,
      confidence: "n/a",
      recordedAt: answer.answeredAt || recordedAt,
    });
  }

  return {
    profileVersion: input.confirmedProfile.profileVersion,
    records,
    builtAt: recordedAt,
  };
}

export function decisionsByOrigin(
  ledger: DecisionLedger,
  origin: DecisionOrigin,
): DecisionRecord[] {
  return ledger.records.filter((r) => r.origin === origin);
}

export function summarizeDecisionLedger(ledger: DecisionLedger): {
  total: number;
  byOrigin: Record<DecisionOrigin, number>;
} {
  const byOrigin: Record<DecisionOrigin, number> = {
    observed: 0,
    owner_confirmed: 0,
    owner_corrected: 0,
    interview_answer: 0,
    working_hypothesis: 0,
    restriction: 0,
  };
  for (const record of ledger.records) {
    byOrigin[record.origin] += 1;
  }
  return { total: ledger.records.length, byOrigin };
}
