import { describe, expect, it } from "vitest";
import {
  applyBriefEditProvenance,
  defaultBriefFieldProvenance,
} from "@/features/research-prompt-builder/lib/brief-provenance";
import { makeResearchBrief } from "../fixtures/api/research-brief";

describe("brief field provenance", () => {
  it("marks edited fields as owner_brief_edit", () => {
    const previous = makeResearchBrief({
      fieldProvenance: defaultBriefFieldProvenance({
        customerMoment: { origin: "owner_answer", sourceRefs: [] },
      }),
    });
    const next = {
      ...previous,
      customerMoment: `${previous.customerMoment} (owner tweak)`,
    };
    const applied = applyBriefEditProvenance(previous, next);
    expect(applied.fieldProvenance.customerMoment.origin).toBe("owner_brief_edit");
    expect(applied.fieldProvenance.companyTruth.origin).toBe(
      previous.fieldProvenance.companyTruth.origin,
    );
  });
});
