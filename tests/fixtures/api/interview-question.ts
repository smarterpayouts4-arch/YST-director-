import type {
  InterviewAnswer,
  InterviewQuestion,
  StrategicSuggestion,
} from "@/features/research-prompt-builder/schemas";

export function makeStrategicSuggestion(
  overrides: Partial<StrategicSuggestion> = {},
): StrategicSuggestion {
  return {
    suggestionId: "sg-trust-guide",
    title: "Trusted guide in a confusing market",
    description:
      "Position the brand as the clear, evidence-aware guide when shoppers compare forms and claims.",
    rationale:
      "Your offer and off-limits claims show credibility and comparison clarity already matter.",
    researchFocus:
      "Test whether uncertainty, misinformation, and proof requirements create demand for authority-led education.",
    classification: "working_hypothesis",
    evidenceRefs: ["offer", "claim_0"],
    ...overrides,
  };
}

export function makeInterviewQuestion(
  overrides: Partial<InterviewQuestion> = {},
): InterviewQuestion {
  return {
    questionId: "q1",
    sequenceNumber: 1,
    questionKind: "standard",
    decisionCategory: "customer_moment",
    whatWeNoticed:
      "Shoppers are confused by supplement forms and conflicting claims, but the first decision to intercept is still open.",
    question:
      "Which shopper decision should ZYNAVA intercept first: choosing between forms of the same supplement before purchase?",
    suggestedAnswer:
      "Yes. Intercept when a shopper already chose a category and is stuck comparing forms, labels, and conflicting claims.",
    whyThisMatters:
      "The first customer moment decides which demand and content research questions matter.",
    evidenceRefs: ["row:5"],
    strategicSuggestions: [],
    isConditional: false,
    resolvesBriefFields: ["customerMoment"],
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

export function makeStrategicDirectionQuestion(
  overrides: Partial<InterviewQuestion> = {},
): InterviewQuestion {
  return makeInterviewQuestion({
    questionId: "q-strategy-1",
    sequenceNumber: 1,
    questionKind: "strategic_direction",
    decisionCategory: "strategic_direction",
    whatWeNoticed:
      "Your file shows a credibility-sensitive offer in a confusing category, but which research angles to prioritize is still open.",
    question:
      "Which strategic directions should the research investigate for this business?",
    suggestedAnswer: null,
    whyThisMatters:
      "Selected directions decide which demand, proof, and competitor questions the prompt must run.",
    evidenceRefs: ["offer", "claim_0", "customerProblem"],
    strategicSuggestions: [
      makeStrategicSuggestion(),
      makeStrategicSuggestion({
        suggestionId: "sg-outcome-first",
        title: "Lead with the outcome, not the product",
        description:
          "Frame education around the job customers are trying to finish rather than ingredient attributes.",
        rationale:
          "Your stated customer need centers on choosing confidently, not on product specs alone.",
        researchFocus:
          "Identify high-intent outcomes, the language customers use, and evidence behind those claims.",
        evidenceRefs: ["customerProblem", "likelyAudience"],
      }),
      makeStrategicSuggestion({
        suggestionId: "sg-clarity-diff",
        title: "Make clarity itself the differentiator",
        description:
          "If rivals look interchangeable, helping customers understand how to choose may create the stronger position.",
        rationale:
          "Differentiator language already points at clarity and comparison rather than novelty alone.",
        researchFocus:
          "Examine comparison criteria, category conventions, and where competitors create confusion.",
        evidenceRefs: ["differentiator_0", "offer"],
      }),
    ],
    resolvesBriefFields: ["contentHypothesis", "challengeHypothesis"],
    ...overrides,
  });
}

export function makeInterviewAnswer(
  overrides: Partial<InterviewAnswer> = {},
): InterviewAnswer {
  return {
    questionId: "q1",
    answerText:
      "Intercept the pre-purchase form-comparison moment: the shopper already chose a category and needs plain-English help comparing forms and label details without medical advice.",
    usedSuggestion: false,
    selectedSuggestionIds: [],
    customDirection: null,
    supportingDocuments: [],
    answeredAt: "2026-08-05T12:00:00.000Z",
    ...overrides,
  };
}
