import type { ConfirmedCompanyProfile } from "@/features/research-prompt-builder/schemas";

export function makeConfirmedProfile(
  overrides: Partial<ConfirmedCompanyProfile> = {},
): ConfirmedCompanyProfile {
  return {
    profileVersion: "profile-v1",
    ownerNotes: "Focus on form-aware educational comparison without medical claims.",
    fields: {
      companyName: {
        value: "ZYNAVA",
        status: "confirmed",
        originalClassification: "observed_fact",
        confidence: "high",
        evidenceRefs: ["row:2"],
      },
      industry: {
        value: "Dietary supplements / AI-powered search and price comparison",
        status: "confirmed",
        originalClassification: "observed_fact",
        confidence: "high",
        evidenceRefs: ["row:3"],
      },
      offer: {
        value:
          "AI-powered supplement search and price-comparison with form-aware education, guided comparison, plan builder, and Supplement Advisor",
        status: "confirmed",
        originalClassification: "observed_fact",
        confidence: "high",
        evidenceRefs: ["row:4"],
      },
      geography: {
        value: "United States online (Tampa, FL business address)",
        status: "confirmed",
        originalClassification: "observed_fact",
        confidence: "high",
        evidenceRefs: ["row:9"],
      },
      likelyAudience: {
        value:
          "US adult shoppers researching supplements who want clearer form and label comparisons before buying",
        status: "corrected",
        originalClassification: "working_assumption",
        confidence: "medium",
        evidenceRefs: ["row:7"],
      },
      differentiator_0: {
        value: "Independent ranking that is never paid; form-aware education such as glycinate vs oxide",
        status: "confirmed",
        originalClassification: "observed_fact",
        confidence: "high",
        evidenceRefs: ["row:8"],
      },
      claimsAndRestrictions: {
        value:
          "Educational guidance only — not medical advice; do not diagnose, treat, cure, prevent disease, or recommend dosages.",
        status: "confirmed",
        originalClassification: "observed_fact",
        confidence: "high",
        evidenceRefs: ["row:12"],
      },
    },
    ...overrides,
  };
}
