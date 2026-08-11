import { describe, expect, it } from "vitest";
import { curateLibraryItems } from "@/features/content-intelligence/library/services/curate-library";

describe("curateLibraryItems", () => {
  it("defaults origin extracted and reviewStatus needs_review", () => {
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
    expect(items[0].reviewStatus).toBe("needs_review");
    expect(items[0].evidenceQuote).toBe("clean-label positioning");
    expect(validationResult.quoteMismatchCount).toBe(0);
  });

  it("clears evidenceQuote when not present in raw research", () => {
    const { items, validationResult } = curateLibraryItems({
      draft: {
        items: [
          {
            kind: "opportunity",
            statement: "Short-form education may work.",
            provenance: "Opportunities",
            confidence: "low",
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
    expect(items[0].reviewStatus).toBe("needs_review");
    expect(validationResult.quoteMismatchCount).toBe(1);
  });
});
