import type { ResearchBrief } from "@/features/research-prompt-builder/schemas";

export function makeResearchBrief(
  overrides: Partial<ResearchBrief> = {},
): ResearchBrief {
  return {
    companyTruth:
      "Bluebird Plumbing Co. is a licensed residential plumbing company serving the Austin metro area, known for fast emergency response and flat-rate pricing published upfront.",
    customerMoment:
      "A homeowner discovers an active leak or burst pipe and urgently searches for a trustworthy local plumber.",
    viewerReward:
      "Viewers learn how to stop damage in the first ten minutes and how to judge whether a plumber is quoting fairly.",
    businessBridge:
      "Helpful emergency guidance builds trust that converts panicked searchers into booked service calls.",
    primaryPlatform: {
      value: "YouTube",
      rationale:
        "Emergency plumbing questions are heavily searched on YouTube and answers demonstrate expertise visually.",
      status: "working_hypothesis",
    },
    contentHypothesis:
      "Short, calm, step-by-step emergency triage videos will out-perform generic company promos because they meet the customer at the moment of crisis.",
    challengeHypothesis:
      "It is possible emergency searchers convert on speed alone and never watch videos; research must test whether content influences the emergency call decision at all.",
    trustBoundaries: [
      "Cannot claim to be the cheapest provider in the market.",
      "No advice that encourages unlicensed gas line work.",
    ],
    executionContext: [
      "Owner can film one video per week with a phone.",
      "No dedicated marketing staff.",
    ],
    unresolvedUnknowns: [
      "Which customer segment produces the highest lifetime value.",
    ],
    evidenceSummary: [
      {
        statement: "Serves the Austin metro area only.",
        classification: "observed_fact",
        evidenceRefs: ["row:3"],
      },
      {
        statement: "Most demand comes from emergency calls.",
        classification: "working_hypothesis",
        evidenceRefs: ["row:5"],
      },
    ],
    ...overrides,
  };
}
