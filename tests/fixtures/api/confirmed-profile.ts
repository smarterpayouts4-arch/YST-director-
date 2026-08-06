import type { ConfirmedCompanyProfile } from "@/features/research-prompt-builder/schemas";

export function makeConfirmedProfile(
  overrides: Partial<ConfirmedCompanyProfile> = {},
): ConfirmedCompanyProfile {
  return {
    profileVersion: "profile-v1",
    ownerNotes: "Focus on emergency response reputation.",
    fields: {
      company_name: {
        value: "Bluebird Plumbing Co.",
        status: "confirmed",
        originalClassification: "observed_fact",
        confidence: "high",
        evidenceRefs: ["row:2"],
      },
      geography: {
        value: "Austin, Texas metro area",
        status: "confirmed",
        originalClassification: "observed_fact",
        confidence: "high",
        evidenceRefs: ["row:3"],
      },
      target_customer: {
        value: "Homeowners aged 30-65 needing urgent plumbing repair",
        status: "corrected",
        originalClassification: "working_assumption",
        confidence: "medium",
        evidenceRefs: ["row:5"],
      },
      claims_restrictions: {
        value: "Cannot claim to be the cheapest provider in the market.",
        status: "confirmed",
        originalClassification: "observed_fact",
        confidence: "high",
        evidenceRefs: ["row:9"],
      },
    },
    ...overrides,
  };
}
