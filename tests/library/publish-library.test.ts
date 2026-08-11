import { describe, expect, it } from "vitest";
import { buildPublishedLibraryDto } from "@/features/content-intelligence/library/services/publish-library";
import type { ContentIntelligenceLibrary } from "@/features/content-intelligence/library/schemas/library";

function baseLibrary(
  items: ContentIntelligenceLibrary["items"],
): ContentIntelligenceLibrary {
  return {
    libraryId: "lib_1",
    stage: "in_review",
    projectId: "proj_1",
    artifacts: [],
    extractionRuns: [],
    items,
    publishedAt: null,
    publishedDto: null,
  };
}

describe("buildPublishedLibraryDto", () => {
  it("includes only accepted items", () => {
    const dto = buildPublishedLibraryDto(
      baseLibrary([
        {
          itemId: "item_a",
          artifactId: "art_1",
          extractionRunId: "run_1",
          kind: "fact",
          statement: "Accepted fact",
          provenance: "A",
          origin: "extracted",
          reviewStatus: "accepted",
          confidence: "high",
          evidenceQuote: null,
          sourceRefs: [],
          tags: [],
          isHypothesis: false,
          capturedAt: "2026-08-11T12:00:00.000Z",
        },
        {
          itemId: "item_r",
          artifactId: "art_1",
          extractionRunId: "run_1",
          kind: "demand",
          statement: "Rejected demand",
          provenance: "B",
          origin: "extracted",
          reviewStatus: "rejected",
          confidence: "low",
          evidenceQuote: null,
          sourceRefs: [],
          tags: [],
          isHypothesis: false,
          capturedAt: "2026-08-11T12:00:00.000Z",
        },
      ]),
      "2026-08-11T13:00:00.000Z",
    );

    expect(dto.items).toHaveLength(1);
    expect(dto.items[0].itemId).toBe("item_a");
    expect(dto.publishedAt).toBe("2026-08-11T13:00:00.000Z");
  });

  it("blocks publish with zero accepted items", () => {
    expect(() =>
      buildPublishedLibraryDto(
        baseLibrary([
          {
            itemId: "item_n",
            artifactId: "art_1",
            extractionRunId: "run_1",
            kind: "unresolved",
            statement: "Needs review",
            provenance: "C",
            origin: "extracted",
            reviewStatus: "needs_review",
            confidence: "medium",
            evidenceQuote: null,
            sourceRefs: [],
            tags: [],
            isHypothesis: false,
            capturedAt: "2026-08-11T12:00:00.000Z",
          },
        ]),
      ),
    ).toThrow(/at least one accepted/i);
  });
});
