import type {
  InterviewAnswer,
  InterviewQuestion,
} from "@/features/research-prompt-builder/schemas";

export function makeInterviewQuestion(
  overrides: Partial<InterviewQuestion> = {},
): InterviewQuestion {
  return {
    questionId: "q1",
    sequenceNumber: 1,
    decisionCategory: "customer_moment",
    whatWeNoticed:
      "The CSV suggests most revenue comes from emergency calls, but this was labeled a working assumption rather than a confirmed fact.",
    question:
      "When a customer calls you for the first time, what is usually happening in their home at that exact moment?",
    suggestedAnswer:
      "Usually a burst pipe or an active leak they cannot stop themselves, discovered within the last hour.",
    whyThisMatters:
      "The first customer moment decides which research questions about demand actually matter.",
    evidenceRefs: ["row:5"],
    isConditional: false,
    resolvesUnknownIds: [],
    qualityScores: {
      evidenceBased: 5,
      material: 5,
      genuinelyUnknown: 4,
      singular: 5,
      easyToAnswer: 5,
      strategicallyUseful: 5,
    },
    ...overrides,
  };
}

export function makeInterviewAnswer(
  overrides: Partial<InterviewAnswer> = {},
): InterviewAnswer {
  return {
    questionId: "q1",
    answerText:
      "Almost always an active emergency — a burst pipe or a water heater failure they found that morning.",
    usedSuggestion: false,
    supportingDocuments: [],
    answeredAt: "2026-08-05T12:00:00.000Z",
    ...overrides,
  };
}
