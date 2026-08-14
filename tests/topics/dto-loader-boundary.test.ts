import { afterEach, describe, expect, it, vi } from "vitest";
import { loadPublishedLibraryForArtifact } from "@/features/content-intelligence/contracts/load-published-library";
import { CI_STORAGE_KEY } from "@/features/content-intelligence/library/config/constants";

describe("loadPublishedLibraryForArtifact", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns null when missing or mismatched artifact", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => store.set(k, v),
        removeItem: (k: string) => store.delete(k),
      },
    });

    expect(loadPublishedLibraryForArtifact("art_1")).toBeNull();

    store.set(
      CI_STORAGE_KEY,
      JSON.stringify({
        storageVersion: 1,
        savedAt: "2026-08-12T12:00:00.000Z",
        library: {
          publishedDto: {
            libraryId: "lib_1",
            publishedAt: "2026-08-12T12:00:00.000Z",
            items: [
              {
                itemId: "item_1",
                artifactId: "art_other",
                kind: "fact",
                statement: "x",
                provenance: "p",
                origin: "extracted",
                confidence: "high",
                evidenceQuote: null,
                sourceRefs: [],
                tags: [],
                isHypothesis: false,
              },
            ],
          },
        },
      }),
    );

    expect(loadPublishedLibraryForArtifact("art_1")).toBeNull();
  });

  it("loads DTO only when artifact matches (no raw fields required)", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => store.set(k, v),
        removeItem: (k: string) => store.delete(k),
      },
    });

    store.set(
      CI_STORAGE_KEY,
      JSON.stringify({
        storageVersion: 1,
        savedAt: "2026-08-12T12:00:00.000Z",
        library: {
          artifacts: [{ artifactId: "art_1", rawText: "SECRET RAW", contentHash: "h", capturedAt: "2026-08-12T11:00:00.000Z" }],
          publishedDto: {
            libraryId: "lib_1",
            publishedAt: "2026-08-12T12:00:00.000Z",
            items: [
              {
                itemId: "item_1",
                artifactId: "art_1",
                kind: "opportunity",
                statement: "Transparent compare",
                provenance: "p",
                origin: "extracted",
                confidence: "high",
                evidenceQuote: null,
                sourceRefs: [],
                tags: [],
                isHypothesis: false,
              },
            ],
          },
        },
      }),
    );

    const loaded = loadPublishedLibraryForArtifact("art_1");
    expect(loaded).not.toBeNull();
    expect(loaded!.dto.items).toHaveLength(1);
    expect(JSON.stringify(loaded)).not.toContain("SECRET RAW");
  });
});
