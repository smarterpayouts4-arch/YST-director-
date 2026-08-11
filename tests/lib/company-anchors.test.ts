import { describe, expect, it } from "vitest";
import {
  anchorPhraseMatches,
  buildCompanyAnchors,
  flattenAnchors,
  normalizeAnchorText,
  stripAnchors,
} from "@/features/research-prompt-builder/lib/company-anchors";
import { makeConfirmedProfile } from "../fixtures/api/confirmed-profile";
import { makeResearchBrief } from "../fixtures/api/research-brief";

describe("company anchors", () => {
  it("builds bucketed distinctive anchors and rejects generic business terms", () => {
    const anchors = buildCompanyAnchors(
      makeConfirmedProfile(),
      makeResearchBrief(),
    );

    expect(anchors.company).toContain("zynava");
    expect(flattenAnchors(anchors).some((t) => t.includes("supplement"))).toBe(
      true,
    );
    expect(anchors.geography.some((t) => t.includes("tampa"))).toBe(true);

    const flat = flattenAnchors(anchors);
    expect(flat).not.toContain("online");
    expect(flat).not.toContain("customers");
    expect(flat).not.toContain("business");
    expect(flat).not.toContain("united states");
  });

  it("ignores rejected profile fields", () => {
    const anchors = buildCompanyAnchors(
      makeConfirmedProfile({
        fields: {
          ...makeConfirmedProfile().fields,
          companyName: {
            value: "SECRETCO",
            status: "rejected",
            originalClassification: "observed_fact",
            confidence: "high",
            evidenceRefs: [],
          },
        },
      }),
      makeResearchBrief(),
    );
    expect(anchors.company).not.toContain("secretco");
  });

  it("matches phrases with word boundaries and flexible whitespace", () => {
    expect(anchorPhraseMatches("Visit Tampa for research", "tampa")).toBe(true);
    expect(anchorPhraseMatches("The stampable kit", "tampa")).toBe(false);
    expect(
      anchorPhraseMatches(
        "Need supplement   comparison tools now",
        "supplement comparison",
      ),
    ).toBe(true);
    expect(normalizeAnchorText("AI-powered Search!")).toBe("ai powered search");
  });

  it("stripAnchors removes company-specific language", () => {
    const anchors = buildCompanyAnchors(
      makeConfirmedProfile(),
      makeResearchBrief(),
    );
    const original =
      "ZYNAVA should scan dietary supplements demand in Tampa before evaluating hypotheses.";
    const stripped = stripAnchors(original, anchors);
    expect(stripped.toLowerCase()).not.toContain("zynava");
    expect(stripped.toLowerCase()).not.toContain("tampa");
  });
});
