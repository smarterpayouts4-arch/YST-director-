import { describe, expect, it } from "vitest";
import { curateLibraryItems } from "@/features/content-intelligence/library/services/curate-library";

describe("curateLibraryItems", () => {
  it("auto-accepts clean medium/high items with verified quote and provenance", () => {
    const { items, validationResult } = curateLibraryItems({
      draft: {
        items: [
          {
            kind: "fact",
            statement: "Brand positions as clean-label.",
            provenance: "Company overview",
            confidence: "high",
            evidenceQuote: "clean-label positioning",
            sourceRefs: ["report"],
            tags: [],
            isHypothesis: false,
          },
        ],
      },
      artifactId: "art_1",
      extractionRunId: "run_1",
      rawText: "The brand leans into clean-label positioning in the US.",
    });

    expect(items).toHaveLength(1);
    expect(items[0].origin).toBe("extracted");
    expect(items[0].reviewStatus).toBe("accepted");
    expect(items[0].quoteCleared).toBe(false);
    expect(items[0].evidenceQuote).toBe("clean-label positioning");
    expect(validationResult.quoteMismatchCount).toBe(0);
  });

  it("keeps quote-cleared items as needs_review exceptions", () => {
    const { items, validationResult } = curateLibraryItems({
      draft: {
        items: [
          {
            kind: "opportunity",
            statement: "Short-form education may work.",
            provenance: "Opportunities",
            confidence: "high",
            evidenceQuote: "this quote is not in the research at all",
            sourceRefs: [],
            tags: [],
            isHypothesis: true,
          },
        ],
      },
      artifactId: "art_1",
      extractionRunId: "run_1",
      rawText: "Shoppers compare labels in aisle.",
    });

    expect(items[0].evidenceQuote).toBeNull();
    expect(items[0].quoteCleared).toBe(true);
    expect(items[0].reviewStatus).toBe("needs_review");
    expect(validationResult.quoteMismatchCount).toBe(1);
  });

  it("does not auto-accept unresolved or low confidence or null quote", () => {
    const { items } = curateLibraryItems({
      draft: {
        items: [
          {
            kind: "unresolved",
            statement: "Open question remains.",
            provenance: "Gaps",
            confidence: "high",
            evidenceQuote: "Open question remains",
            sourceRefs: [],
            tags: [],
            isHypothesis: false,
          },
          {
            kind: "fact",
            statement: "Weak claim.",
            provenance: "Body",
            confidence: "low",
            evidenceQuote: "Weak claim",
            sourceRefs: [],
            tags: [],
            isHypothesis: false,
          },
          {
            kind: "fact",
            statement: "No quote provided.",
            provenance: "Body",
            confidence: "high",
            evidenceQuote: null,
            sourceRefs: [],
            tags: [],
            isHypothesis: false,
          },
        ],
      },
      artifactId: "art_1",
      extractionRunId: "run_1",
      rawText: "Open question remains. Weak claim. No quote provided.",
    });

    expect(items.every((i) => i.reviewStatus === "needs_review")).toBe(true);
  });

  it("auto-accepts explicitly marked hypotheses that are otherwise clean", () => {
    const { items } = curateLibraryItems({
      draft: {
        items: [
          {
            kind: "opportunity",
            statement: "Form education may reduce confusion.",
            provenance: "Hypothesis section",
            confidence: "medium",
            evidenceQuote: "may reduce confusion",
            sourceRefs: [],
            tags: [],
            isHypothesis: true,
          },
        ],
      },
      artifactId: "art_1",
      extractionRunId: "run_1",
      rawText: "Researchers note education may reduce confusion among shoppers.",
    });

    expect(items[0].reviewStatus).toBe("accepted");
    expect(items[0].isHypothesis).toBe(true);
  });
});
