import { describe, expect, it } from "vitest";
import {
  buildPublishedLibraryDto,
  syncLibraryReadyState,
} from "@/features/content-intelligence/library/services/publish-library";
import type { ContentIntelligenceLibrary } from "@/features/content-intelligence/library/schemas/library";
import type { LibraryItem } from "@/features/content-intelligence/library/schemas/library-item";

function item(partial: Partial<LibraryItem> & Pick<LibraryItem, "itemId" | "reviewStatus">): LibraryItem {
  return {
    artifactId: "art_1",
    extractionRunId: "run_1",
    kind: "fact",
    statement: "A statement",
    provenance: "Section",
    origin: "extracted",
    confidence: "high",
    evidenceQuote: "A statement",
    quoteCleared: false,
    sourceRefs: [],
    tags: [],
    isHypothesis: false,
    capturedAt: "2026-08-11T12:00:00.000Z",
    ...partial,
  };
}

function baseLibrary(items: LibraryItem[]): ContentIntelligenceLibrary {
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
        item({ itemId: "item_a", reviewStatus: "accepted", statement: "Accepted fact" }),
        item({ itemId: "item_r", reviewStatus: "rejected", statement: "Rejected", kind: "demand" }),
      ]),
      "2026-08-11T13:00:00.000Z",
    );

    expect(dto.items).toHaveLength(1);
    expect(dto.items[0].itemId).toBe("item_a");
  });

  it("blocks DTO with zero accepted items", () => {
    expect(() =>
      buildPublishedLibraryDto(
        baseLibrary([item({ itemId: "item_n", reviewStatus: "needs_review" })]),
      ),
    ).toThrow(/at least one accepted/i);
  });

  it("scopes published items to the active artifact", () => {
    const dto = buildPublishedLibraryDto(
      baseLibrary([
        item({
          itemId: "item_keep",
          artifactId: "art_1",
          reviewStatus: "accepted",
          statement: "Keep",
        }),
        item({
          itemId: "item_leak",
          artifactId: "art_2",
          reviewStatus: "accepted",
          statement: "Leak from another paste",
        }),
      ]),
      "2026-08-12T17:00:00.000Z",
      "art_1",
    );
    expect(dto.items).toHaveLength(1);
    expect(dto.items[0]?.itemId).toBe("item_keep");
    expect(dto.items[0]?.artifactId).toBe("art_1");
  });

  it("omits raw research, rejected items, and extraction internals", () => {
    const dto = buildPublishedLibraryDto(
      {
        ...baseLibrary([
          item({
            itemId: "item_a",
            reviewStatus: "accepted",
            statement: "Accepted fact",
            extractionRunId: "run_secret",
            quoteCleared: false,
          }),
          item({
            itemId: "item_r",
            reviewStatus: "rejected",
            statement: "Rejected claim",
          }),
        ]),
        artifacts: [
          {
            artifactId: "art_1",
            rawText: "FULL RAW RESEARCH BODY",
            contentHash: "abc12345",
            capturedAt: "2026-08-12T17:00:00.000Z",
          },
        ],
      },
      "2026-08-12T17:00:00.000Z",
      "art_1",
    );

    expect(dto.items).toHaveLength(1);
    expect(JSON.stringify(dto)).not.toMatch(/FULL RAW RESEARCH BODY/);
    expect(JSON.stringify(dto)).not.toMatch(/Rejected claim/);
    expect(JSON.stringify(dto)).not.toMatch(/run_secret/);
    expect(dto.items[0]).not.toHaveProperty("extractionRunId");
    expect(dto.items[0]).not.toHaveProperty("quoteCleared");
    expect(dto.items[0]).not.toHaveProperty("reviewStatus");
    expect(dto.items[0]).not.toHaveProperty("rawText");
  });
});

describe("syncLibraryReadyState", () => {
  it("auto-publishes when no needs_review remain", () => {
    const next = syncLibraryReadyState(
      baseLibrary([
        item({ itemId: "a", reviewStatus: "accepted" }),
        item({ itemId: "r", reviewStatus: "rejected" }),
      ]),
    );
    expect(next.stage).toBe("published");
    expect(next.publishedDto?.items).toHaveLength(1);
  });

  it("publishes only the active artifact when other pastes still have exceptions", () => {
    const next = syncLibraryReadyState(
      baseLibrary([
        item({ itemId: "a1", artifactId: "art_1", reviewStatus: "accepted" }),
        item({ itemId: "a2", artifactId: "art_2", reviewStatus: "accepted" }),
        item({ itemId: "n2", artifactId: "art_2", reviewStatus: "needs_review" }),
      ]),
      "art_1",
    );
    expect(next.stage).toBe("published");
    expect(next.publishedDto?.items.map((i) => i.itemId)).toEqual(["a1"]);
  });

  it("clears published state when exceptions remain", () => {
    const published = syncLibraryReadyState(
      baseLibrary([item({ itemId: "a", reviewStatus: "accepted" })]),
    );
    const withException = syncLibraryReadyState({
      ...published,
      items: [
        ...published.items,
        item({ itemId: "e", reviewStatus: "needs_review" }),
      ],
    });
    expect(withException.stage).toBe("in_review");
    expect(withException.publishedDto).toBeNull();
  });
});
