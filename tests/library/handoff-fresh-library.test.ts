import { afterEach, describe, expect, it, vi } from "vitest";
import { CI_STORAGE_KEY } from "@/features/content-intelligence/library/config/constants";
import { TE_STORAGE_KEY } from "@/features/content-intelligence/topics/config/constants";
import { acceptResearchHandoff } from "@/features/content-intelligence/library/state/handoff";
import { saveLibrary } from "@/features/content-intelligence/library/state/library-storage";
import type { ContentIntelligenceLibrary } from "@/features/content-intelligence/library/schemas/library";

function stubBrowserStorage() {
  const store = new Map<string, string>();
  const session = new Map<string, string>();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    },
    sessionStorage: {
      getItem: (k: string) => session.get(k) ?? null,
      setItem: (k: string, v: string) => {
        session.set(k, v);
      },
      removeItem: (k: string) => {
        session.delete(k);
      },
    },
  });
  let n = 0;
  vi.stubGlobal("crypto", {
    randomUUID: () => {
      n += 1;
      return `00000000-0000-0000-0000-${String(n).padStart(12, "0")}`;
    },
    subtle: globalThis.crypto.subtle,
  });
  return { store, session };
}

function readLibrary(store: Map<string, string>): ContentIntelligenceLibrary {
  return JSON.parse(store.get(CI_STORAGE_KEY)!).library as ContentIntelligenceLibrary;
}

describe("acceptResearchHandoff fresh Library lifecycle", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("first send creates a fresh library with one artifact and empty items", async () => {
    const { store } = stubBrowserStorage();
    const result = await acceptResearchHandoff({
      researchText: "Completed research A about demand.",
      projectId: "proj_a",
    });

    const library = readLibrary(store);
    expect(result.libraryId).toBe(library.libraryId);
    expect(library.libraryId).toMatch(/^lib_/);
    expect(library.artifacts).toHaveLength(1);
    expect(library.artifacts[0].artifactId).toBe(result.artifactId);
    expect(library.items).toEqual([]);
    expect(library.extractionRuns).toEqual([]);
    expect(library.publishedDto).toBeNull();
    expect(library.publishedAt).toBeNull();
    expect(library.stage).toBe("pending_extract");
  });

  it("second send mints a new libraryId and drops prior items", async () => {
    const { store } = stubBrowserStorage();
    const first = await acceptResearchHandoff({
      researchText: "Completed research A.",
      projectId: "proj_a",
    });

    const libA = readLibrary(store);
    libA.items = [
      {
        itemId: "item_old",
        artifactId: first.artifactId,
        extractionRunId: "run_old",
        kind: "fact",
        statement: "Prior intelligence",
        provenance: "§1",
        origin: "extracted",
        reviewStatus: "accepted",
        confidence: "high",
        evidenceQuote: "Prior intelligence",
        quoteCleared: false,
        sourceRefs: [],
        tags: [],
        isHypothesis: false,
        capturedAt: "2026-08-12T12:00:00.000Z",
      },
    ];
    libA.extractionRuns = [
      {
        runId: "run_old",
        artifactId: first.artifactId,
        operationId: "extract-content-intelligence",
        model: "test",
        promptVersion: "ci-librarian-1.1.1",
        extractedAt: "2026-08-12T12:00:00.000Z",
        validationResult: {
          ok: true,
          issues: [],
          itemCount: 1,
          quoteMismatchCount: 0,
        },
      },
    ];
    libA.stage = "in_review";
    saveLibrary(libA);

    const second = await acceptResearchHandoff({
      researchText: "Completed research B — completely new paste.",
      projectId: "proj_a",
    });

    const libB = readLibrary(store);
    expect(second.libraryId).not.toBe(first.libraryId);
    expect(libB.libraryId).toBe(second.libraryId);
    expect(libB.libraryId).not.toBe(libA.libraryId);
    expect(libB.items).toHaveLength(0);
    expect(libB.extractionRuns).toHaveLength(0);
    expect(libB.artifacts).toHaveLength(1);
    expect(libB.artifacts[0].artifactId).toBe(second.artifactId);
    expect(libB.artifacts[0].artifactId).not.toBe(first.artifactId);
    expect(libB.publishedDto).toBeNull();
  });

  it("published Library A then Send B yields fresh B with no inherited DTO and clears TE session", async () => {
    const { store } = stubBrowserStorage();
    const first = await acceptResearchHandoff({
      researchText: "Research A published path.",
      projectId: "proj_a",
    });

    const libA = readLibrary(store);
    libA.stage = "published";
    libA.publishedAt = "2026-08-12T15:00:00.000Z";
    libA.publishedDto = {
      libraryId: libA.libraryId,
      projectId: "proj_a",
      publishedAt: "2026-08-12T15:00:00.000Z",
      items: [
        {
          itemId: "item_pub",
          artifactId: first.artifactId,
          kind: "fact",
          statement: "Published fact A",
          provenance: "§2",
          origin: "extracted",
          confidence: "high",
          evidenceQuote: "Published fact A",
          sourceRefs: [],
          tags: [],
          isHypothesis: false,
        },
      ],
    };
    libA.items = [
      {
        itemId: "item_pub",
        artifactId: first.artifactId,
        extractionRunId: "run_a",
        kind: "fact",
        statement: "Published fact A",
        provenance: "§2",
        origin: "extracted",
        reviewStatus: "accepted",
        confidence: "high",
        evidenceQuote: "Published fact A",
        quoteCleared: false,
        sourceRefs: [],
        tags: [],
        isHypothesis: false,
        capturedAt: "2026-08-12T14:00:00.000Z",
      },
    ];
    saveLibrary(libA);

    store.set(
      TE_STORAGE_KEY,
      JSON.stringify({
        storageVersion: 1,
        savedAt: "2026-08-12T15:05:00.000Z",
        session: {
          artifactId: first.artifactId,
          libraryId: libA.libraryId,
          projectId: "proj_a",
          stage: "directions",
          promptVersion: "ci-topics-1.1.8",
          directions: [],
          selectedTerritoryId: null,
          topics: [],
          selectedTopicId: null,
          packet: null,
          directionDiagnostics: null,
        },
      }),
    );

    const second = await acceptResearchHandoff({
      researchText: "Research B after publish.",
      projectId: "proj_a",
    });

    const libB = readLibrary(store);
    expect(libB.libraryId).not.toBe(libA.libraryId);
    expect(libB.libraryId).toBe(second.libraryId);
    expect(libB.publishedDto).toBeNull();
    expect(libB.publishedAt).toBeNull();
    expect(libB.items).toHaveLength(0);
    expect(libB.artifacts[0].artifactId).toBe(second.artifactId);
    // New TE/DTO workspace must key to B — stale A session must not remain active.
    expect(store.has(TE_STORAGE_KEY)).toBe(false);
  });
});
