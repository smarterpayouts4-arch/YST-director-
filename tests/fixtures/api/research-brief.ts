import { defaultBriefFieldProvenance } from "@/features/research-prompt-builder/lib/brief-provenance";
import type { ResearchBrief } from "@/features/research-prompt-builder/schemas";

export function makeResearchBrief(
  overrides: Partial<ResearchBrief> = {},
): ResearchBrief {
  return {
    companyTruth:
      "ZYNAVA is a United States online AI-powered supplement search and price-comparison platform that helps shoppers explore options, build plans, and ask educational questions without selling supplements.",
    customerMoment:
      "An adult shopper has already chosen a supplement category and is overwhelmed by conflicting claims and multiple forms before deciding what to buy.",
    viewerReward:
      "Viewers understand what can be compared on labels and across forms in plain English, without being told which product is medically right for them.",
    businessBridge:
      "Clear form and label education earns trust that leads appropriate shoppers into ZYNAVA’s guided comparison, plan builder, or advisor tools.",
    primaryPlatform: {
      value: "YouTube",
      rationale:
        "Supplement form and label questions are heavily searched with evergreen educational intent; video can demonstrate comparison logic without medical claims.",
    },
    contentHypothesis:
      "Form-decoding education (“compare the form, not the cure”) will out-perform generic wellness tips because it meets shoppers at the confusion moment before purchase.",
    challengeHypothesis:
      "It is possible shoppers prefer clinician, pharmacist, or brand-led sources and never use an independent comparison tool; research must test whether form education drives guided-comparison intent.",
    trustBoundaries: [
      "Educational guidance only — not medical advice.",
      "Do not diagnose, treat, cure, prevent disease, or recommend dosages.",
    ],
    executionContext: [
      "Content must stay compliance-safe and evidence-informed.",
      "No paid rankings or sponsored placements in product results.",
    ],
    unresolvedUnknowns: [
      "Which supplement categories produce the highest guided-comparison intent.",
    ],
    evidenceSummary: [
      {
        statement: "Does not sell supplements; routes to third-party retailers.",
        classification: "observed_fact",
        evidenceRefs: ["row:3"],
      },
      {
        statement: "Shoppers stop for confusion and trust, not feature lists.",
        classification: "working_hypothesis",
        evidenceRefs: ["row:5"],
      },
    ],
    fieldProvenance: defaultBriefFieldProvenance({
      companyTruth: {
        origin: "confirmed_profile",
        sourceRefs: ["offer", "companyName"],
      },
      trustBoundaries: {
        origin: "confirmed_profile",
        sourceRefs: ["claim_0"],
      },
      customerMoment: {
        origin: "owner_answer",
        sourceRefs: [],
      },
      contentHypothesis: {
        origin: "owner_selected_hypothesis",
        sourceRefs: ["sg-form-decode"],
      },
      challengeHypothesis: {
        origin: "model_hypothesis",
        sourceRefs: [],
      },
    }),
    ...overrides,
  };
}
