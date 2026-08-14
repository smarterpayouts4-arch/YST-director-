import { afterEach, describe, expect, it, vi } from "vitest";
import type { TopicPacket } from "@/features/content-intelligence/contracts/topic-packet";
import { TE_STORAGE_KEY } from "@/features/content-intelligence/topics/config/constants";
import { YouTubeShortsSessionSchema } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-session";
import { loadTeSeedPacket } from "@/features/social-media/youtube-shorts/state/resume-shorts-session";

function stubBrowserStorage() {
  const store = new Map<string, string>();
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
  });
  return { store };
}

function makePacket(overrides: Partial<TopicPacket> = {}): TopicPacket {
  return {
    topicPacketId: "tp_expected",
    topicId: "topic_1",
    territoryId: "terr_1",
    libraryId: "lib_1",
    artifactId: "art_1",
    projectId: "proj_1",
    version: 1,
    status: "selected",
    createdAt: "2026-08-13T00:00:00.000Z",
    confidence: "high",
    title: "Title",
    premise: "p",
    audience: "a",
    customerMoment: "m",
    decisionQuestion: "q",
    tension: "t",
    opportunity: "o",
    whyItMatters: "w",
    supportingInsights: ["i"],
    evidenceQuotes: [],
    sourceRefs: [],
    provenanceNotes: [],
    supportingItemIds: ["i1"],
    desiredTakeaway: "d",
    hypothesisDependencies: [],
    unresolvedAssumptions: [],
    restrictions: [],
    limitations: [],
    doNotClaim: [],
    ...overrides,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("TE seed topicPacketId match + session schema", () => {
  it("returns null when TE packet topicPacketId mismatches expected", () => {
    const { store } = stubBrowserStorage();
    const packet = makePacket({ topicPacketId: "tp_other" });
    store.set(
      TE_STORAGE_KEY,
      JSON.stringify({
        storageVersion: 1,
        savedAt: "2026-08-13T00:00:00.000Z",
        session: {
          libraryId: "lib_1",
          projectId: "proj_1",
          artifactId: "art_1",
          basedOnLabel: "label",
          promptVersion: "ci-topics-1.1.9",
          stage: "ready",
          directions: [],
          selectedTerritoryId: "terr_1",
          topics: [],
          selectedTopicId: "topic_1",
          packet,
        },
      }),
    );

    expect(
      loadTeSeedPacket({
        expectedTopicPacketId: "tp_expected",
        artifactId: "art_1",
      }),
    ).toBeNull();
  });

  it("returns packet when TE topicPacketId matches expected", () => {
    const { store } = stubBrowserStorage();
    const packet = makePacket({ topicPacketId: "tp_expected" });
    store.set(
      TE_STORAGE_KEY,
      JSON.stringify({
        storageVersion: 1,
        savedAt: "2026-08-13T00:00:00.000Z",
        session: {
          libraryId: "lib_1",
          projectId: "proj_1",
          artifactId: "art_1",
          basedOnLabel: "label",
          promptVersion: "ci-topics-1.1.9",
          stage: "ready",
          directions: [],
          selectedTerritoryId: "terr_1",
          topics: [],
          selectedTopicId: "topic_1",
          packet,
        },
      }),
    );

    const seeded = loadTeSeedPacket({
      expectedTopicPacketId: "tp_expected",
      artifactId: "art_1",
    });
    expect(seeded?.topicPacketId).toBe("tp_expected");
  });

  it("session schema rejects reference-library fields", () => {
    const packet = makePacket();
    const result = YouTubeShortsSessionSchema.safeParse({
      topicPacketId: packet.topicPacketId,
      projectId: "proj_1",
      artifactId: "art_1",
      ingestedAtom: packet,
      stage: "ready_for_storyboard",
      createdAt: "2026-08-13T00:00:00.000Z",
      updatedAt: "2026-08-13T00:00:00.000Z",
      referencePaths: ["channels/youtube-shorts/sources/x.md"],
      doctrineText: "nope",
    });
    // Zod strips unknown keys by default — ensure parsed object has no ref fields
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).not.toHaveProperty("referencePaths");
    expect(result.data).not.toHaveProperty("doctrineText");
    expect(Object.keys(result.data).sort()).toEqual(
      [
        "artifactId",
        "createdAt",
        "ingestedAtom",
        "projectId",
        "stage",
        "topicPacketId",
        "updatedAt",
      ].sort(),
    );
  });
});
