import { describe, expect, it } from "vitest";
import {
  buildEvidenceAllowlist,
  evidenceAllowlistKeySet,
  labelForEvidenceRef,
} from "@/ai/context/evidence-allowlist";
import type { ConfirmedCompanyProfile } from "@/features/research-prompt-builder/schemas";

function makeProfile(
  fields: ConfirmedCompanyProfile["fields"],
): ConfirmedCompanyProfile {
  return {
    profileVersion: "profile_test",
    fields,
    ownerNotes: "",
  };
}

describe("evidence allowlist", () => {
  it("excludes rejected fields and labels keys", () => {
    const profile = makeProfile({
      offer: {
        value: "Supplement education",
        status: "confirmed",
        originalClassification: "observed_fact",
        confidence: "high",
        evidenceRefs: ["row:1"],
      },
      claim_0: {
        value: "No disease claims",
        status: "rejected",
        originalClassification: "observed_fact",
        confidence: "high",
        evidenceRefs: ["row:2"],
      },
      differentiator_0: {
        value: "Clear dosing guidance",
        status: "corrected",
        originalClassification: "working_assumption",
        confidence: "medium",
        evidenceRefs: ["row:3"],
      },
    });

    const allowlist = buildEvidenceAllowlist(profile);
    expect(allowlist.map((e) => e.key).sort()).toEqual([
      "differentiator_0",
      "offer",
    ]);
    expect(labelForEvidenceRef("differentiator_0", allowlist)).toBe(
      "Differentiator 1",
    );
    expect(evidenceAllowlistKeySet(profile).has("claim_0")).toBe(false);
  });
});
