import { afterEach, describe, expect, it, vi } from "vitest";
import type { TopicPacket } from "@/features/content-intelligence/contracts/topic-packet";
import { TE_STORAGE_KEY } from "@/features/content-intelligence/topics/config/constants";
import { ingestTopicPacket } from "@/features/social-media/youtube-shorts/contracts/ingest-topic-packet";
import { resolveShortsIdentity } from "@/features/social-media/youtube-shorts/contracts/resolve-shorts-identity";
import { YOUTUBE_SHORTS_STORAGE_KEY } from "@/features/social-media/youtube-shorts/config/constants";
import {
  loadShortsSession,
  persistSession,
} from "@/features/social-media/youtube-shorts/state/shorts-storage";

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
    topicPacketId: "tp_a",
    topicId: "topic_a",
    territoryId: "terr_1",
    libraryId: "lib_1",
    artifactId: "art_1",
    projectId: "proj_1",
    version: 1,
    status: "selected",
    createdAt: "2026-08-13T00:00:00.000Z",
    confidence: "high",
    title: "Title A",
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

describe("YouTube Shorts ingest + resume", () => {
  it("fresh A creates session; re-ingest keeps timestamps immutable", () => {
    stubBrowserStorage();
    const packet = makePacket();
    const identity = resolveShortsIdentity({ packet });
    expect(identity.ok).toBe(true);
    if (!identity.ok) return;

    const first = ingestTopicPacket({
      packet,
      projectId: identity.projectId,
      artifactId: identity.artifactId,
    });
    const saved = persistSession(first);
    expect(saved.ok).toBe(true);
    if (!saved.ok) return;

    const mutated = makePacket({ title: "MUTATED TE TITLE" });
    const second = ingestTopicPacket({
      packet: mutated,
      projectId: identity.projectId,
      artifactId: identity.artifactId,
    });

    expect(second.createdAt).toBe(saved.session.createdAt);
    expect(second.updatedAt).toBe(saved.session.updatedAt);
    expect(second.ingestedAtom.title).toBe("Title A");
    expect(second).toEqual(saved.session);
  });

  it("Atom B is preserved alongside A; TE clear does not wipe Shorts", () => {
    const { store } = stubBrowserStorage();
    const packetA = makePacket({ topicPacketId: "tp_a", title: "A" });
    const packetB = makePacket({
      topicPacketId: "tp_b",
      topicId: "topic_b",
      title: "B",
    });

    for (const packet of [packetA, packetB]) {
      const identity = resolveShortsIdentity({ packet });
      expect(identity.ok).toBe(true);
      if (!identity.ok) return;
      const session = ingestTopicPacket({
        packet,
        projectId: identity.projectId,
        artifactId: identity.artifactId,
      });
      expect(persistSession(session).ok).toBe(true);
    }

    store.set(TE_STORAGE_KEY, JSON.stringify({ wiped: true }));
    store.delete(TE_STORAGE_KEY);

    const resumeA = loadShortsSession("tp_a");
    const resumeB = loadShortsSession("tp_b");
    expect(resumeA.ok && resumeA.session.ingestedAtom.title).toBe("A");
    expect(resumeB.ok && resumeB.session.ingestedAtom.title).toBe("B");
  });

  it("corrupt A + valid B → B still resumes; A is corrupt_session", () => {
    const { store } = stubBrowserStorage();
    const packetB = makePacket({ topicPacketId: "tp_b", title: "B" });
    const identity = resolveShortsIdentity({ packet: packetB });
    expect(identity.ok).toBe(true);
    if (!identity.ok) return;

    const sessionB = ingestTopicPacket({
      packet: packetB,
      projectId: identity.projectId,
      artifactId: identity.artifactId,
    });
    expect(persistSession(sessionB).ok).toBe(true);

    const raw = JSON.parse(store.get(YOUTUBE_SHORTS_STORAGE_KEY)!);
    raw.sessionsByTopicPacketId.tp_a = { broken: true };
    store.set(YOUTUBE_SHORTS_STORAGE_KEY, JSON.stringify(raw));

    expect(loadShortsSession("tp_a")).toEqual({
      ok: false,
      reason: "corrupt_session",
    });
    const b = loadShortsSession("tp_b");
    expect(b.ok && b.session.ingestedAtom.title).toBe("B");
  });

  it("save fails when envelope unparseable and leaves B untouched", () => {
    const { store } = stubBrowserStorage();
    const packetB = makePacket({ topicPacketId: "tp_b", title: "B" });
    const identityB = resolveShortsIdentity({ packet: packetB });
    expect(identityB.ok).toBe(true);
    if (!identityB.ok) return;
    expect(
      persistSession(
        ingestTopicPacket({
          packet: packetB,
          projectId: identityB.projectId,
          artifactId: identityB.artifactId,
        }),
      ).ok,
    ).toBe(true);

    const prior = store.get(YOUTUBE_SHORTS_STORAGE_KEY)!;
    store.set(YOUTUBE_SHORTS_STORAGE_KEY, "{not-json");

    const packetA = makePacket({ topicPacketId: "tp_a", title: "A" });
    const identityA = resolveShortsIdentity({ packet: packetA });
    expect(identityA.ok).toBe(true);
    if (!identityA.ok) return;
    const attempt = persistSession(
      ingestTopicPacket({
        packet: packetA,
        projectId: identityA.projectId,
        artifactId: identityA.artifactId,
      }),
    );
    expect(attempt).toEqual({ ok: false, reason: "save_failed" });
    expect(store.get(YOUTUBE_SHORTS_STORAGE_KEY)).toBe("{not-json");

    store.set(YOUTUBE_SHORTS_STORAGE_KEY, prior);
    const b = loadShortsSession("tp_b");
    expect(b.ok && b.session.ingestedAtom.title).toBe("B");
  });

  it("projectId disagreement → no write", () => {
    const { store } = stubBrowserStorage();
    const packet = makePacket({ projectId: "proj_packet" });
    const identity = resolveShortsIdentity({
      packet,
      sessionProjectId: "proj_other",
    });
    expect(identity).toEqual({ ok: false, reason: "identity_disagreement" });
    expect(store.has(YOUTUBE_SHORTS_STORAGE_KEY)).toBe(false);
  });

  it("deep-copies packet so later TE mutation does not alter ingestedAtom", () => {
    stubBrowserStorage();
    const packet = makePacket();
    const identity = resolveShortsIdentity({ packet });
    expect(identity.ok).toBe(true);
    if (!identity.ok) return;

    const session = ingestTopicPacket({
      packet,
      projectId: identity.projectId,
      artifactId: identity.artifactId,
    });
    expect(persistSession(session).ok).toBe(true);

    packet.title = "changed after ingest";
    const loaded = loadShortsSession("tp_a");
    expect(loaded.ok && loaded.session.ingestedAtom.title).toBe("Title A");
  });
});
