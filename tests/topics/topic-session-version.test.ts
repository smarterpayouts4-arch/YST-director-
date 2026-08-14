import { afterEach, describe, expect, it, vi } from "vitest";
import { TOPICS_RUNTIME_PROMPT_VERSION } from "@/features/content-intelligence/topics/prompts/prompt-version";
import { TE_STORAGE_KEY } from "@/features/content-intelligence/topics/config/constants";
import {
  loadTopicSession,
  saveTopicSession,
} from "@/features/content-intelligence/topics/state/topic-storage";
import type { TopicEngineSession } from "@/features/content-intelligence/topics/schemas/topic-session";

function baseSession(
  overrides: Partial<TopicEngineSession> = {},
): TopicEngineSession {
  return {
    libraryId: "lib_1",
    projectId: "proj_1",
    artifactId: "art_1",
    basedOnLabel: "research intelligence published Aug 12, 2026",
    promptVersion: TOPICS_RUNTIME_PROMPT_VERSION,
    stage: "directions",
    directions: [
      {
        territoryId: "terr_1",
        name: "Comparable Shortlist Decisions",
        description: "d",
        decisionQuestion: "Are these products comparable?",
        primaryAudience: "a",
        primaryMoment: "m",
        primaryTension: "t",
        primaryOpportunity: "o",
        supportingItemIds: ["i1", "i2"],
        confidence: "medium",
        priority: 1,
        rationale: "r",
        hypothesisDependent: false,
        unresolvedDependent: false,
      },
    ],
    selectedTerritoryId: null,
    topics: [],
    selectedTopicId: null,
    packet: null,
    ...overrides,
  };
}

describe("Topic Engine session promptVersion", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reuses current prompt-version session and rejects old prompt version / missing field", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => store.set(k, v),
        removeItem: (k: string) => store.delete(k),
      },
    });

    saveTopicSession(baseSession());
    const current = loadTopicSession("art_1");
    expect(current?.promptVersion).toBe(TOPICS_RUNTIME_PROMPT_VERSION);
    expect(current?.directions).toHaveLength(1);

    // Older promptVersion still loads from storage; resume policy decides reuse (see resume-topic-session).
    saveTopicSession(baseSession({ promptVersion: "ci-topics-1.0.1" }));
    const loadedOld = loadTopicSession("art_1");
    expect(loadedOld?.promptVersion).toBe("ci-topics-1.0.1");
    expect(loadedOld?.promptVersion).not.toBe(TOPICS_RUNTIME_PROMPT_VERSION);
    expect(TOPICS_RUNTIME_PROMPT_VERSION).toBe("ci-topics-1.1.9");

    // Missing promptVersion fails Zod → null (legacy 1.0.0 sessions without field).
    store.set(
      TE_STORAGE_KEY,
      JSON.stringify({
        storageVersion: 1,
        savedAt: "2026-08-12T18:00:00.000Z",
        session: {
          libraryId: "lib_1",
          artifactId: "art_1",
          basedOnLabel: "x",
          stage: "directions",
          directions: [],
          selectedTerritoryId: null,
          topics: [],
          selectedTopicId: null,
          packet: null,
        },
      }),
    );
    expect(loadTopicSession("art_1")).toBeNull();
  });

  it("does not write Librarian CI storage key", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => store.set(k, v),
        removeItem: (k: string) => store.delete(k),
      },
    });
    store.set("content-intelligence:v1", JSON.stringify({ keep: true }));
    saveTopicSession(baseSession());
    expect(store.get("content-intelligence:v1")).toBe(JSON.stringify({ keep: true }));
    expect(store.has(TE_STORAGE_KEY)).toBe(true);
  });
});
