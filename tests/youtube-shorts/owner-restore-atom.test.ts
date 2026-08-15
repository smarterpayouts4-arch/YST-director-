import { afterEach, describe, expect, it, vi } from "vitest";
import { YOUTUBE_SHORTS_STORAGE_KEY } from "@/features/social-media/youtube-shorts/config/constants";
import {
  extractOwnerRestoreSession,
  fetchAndPersistOwnerRestore,
  OWNER_RESTORE_ARTIFACT_ID,
  OWNER_RESTORE_ENVELOPE_PATH,
  OWNER_RESTORE_TOPIC_PACKET_ID,
  ownerRestoreIdsMatch,
} from "@/features/social-media/youtube-shorts/state/owner-restore-atom";
import { loadShortsSession } from "@/features/social-media/youtube-shorts/state/shorts-storage";

const FIXTURE_ENVELOPE = {
  storageVersion: 1,
  savedAt: "2026-08-15T00:04:54.814Z",
  sessionsByTopicPacketId: {
    [OWNER_RESTORE_TOPIC_PACKET_ID]: {
      topicPacketId: OWNER_RESTORE_TOPIC_PACKET_ID,
      projectId: "proj_mspaim68",
      artifactId: OWNER_RESTORE_ARTIFACT_ID,
      ingestedAtom: {
        topicPacketId: OWNER_RESTORE_TOPIC_PACKET_ID,
        projectId: "proj_mspaim68",
        artifactId: OWNER_RESTORE_ARTIFACT_ID,
        libraryId: "lib_msp77sbx",
        territoryId: "terr_8fc8ae8f-a3a6-45a6-b711-8900dacd0aed",
        topicId: "topic_24cd8825-df5c-4fa5-9e08-7e42b43d5e99",
        version: 1,
        status: "selected",
        createdAt: "2026-08-13T03:18:42.100Z",
        title: "Why price per serving can still compare the wrong things",
        premise: "Two bottles can have a similar serving count.",
        audience: "Online supplement shoppers.",
        customerMoment: "The shopper has found a cheaper cost per serving.",
        tension: "A serving is a label-defined unit.",
        opportunity: "Show shoppers how to pair price per serving.",
        decisionQuestion: "Which product dimensions must be equivalent?",
        desiredTakeaway: "Match serving definition and declared amount.",
        whyItMatters: "Prevents mismatched ingredient basis.",
        supportingInsights: ["Elemental magnesium is declared."],
        supportingItemIds: ["item_1"],
        sourceRefs: ["NIH ODS — Magnesium"],
        evidenceQuotes: ["Shortlist exists"],
        provenanceNotes: ["Neutral market discovery"],
        confidence: "high",
        hypothesisDependencies: [],
        unresolvedAssumptions: ["Listings display consistent serving info."],
        restrictions: ["Non-medical education only."],
        limitations: ["No auditable keyword-volume data."],
        doNotClaim: ["No diagnosis or dosage recommendations."],
      },
      stage: "ready_for_storyboard",
      createdAt: "2026-08-15T00:04:54.814Z",
      updatedAt: "2026-08-15T00:04:54.814Z",
    },
  },
};

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

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("ownerRestoreIdsMatch", () => {
  it("matches only the frozen fixture pair", () => {
    expect(
      ownerRestoreIdsMatch(
        OWNER_RESTORE_TOPIC_PACKET_ID,
        OWNER_RESTORE_ARTIFACT_ID,
      ),
    ).toBe(true);
    expect(
      ownerRestoreIdsMatch(
        "tp_10794592-remint",
        "art_0e0dd414-remint",
      ),
    ).toBe(false);
    expect(
      ownerRestoreIdsMatch(OWNER_RESTORE_TOPIC_PACKET_ID, "art_wrong"),
    ).toBe(false);
  });
});

describe("extractOwnerRestoreSession", () => {
  it("returns session when IDs match the envelope", () => {
    const session = extractOwnerRestoreSession(
      FIXTURE_ENVELOPE,
      OWNER_RESTORE_TOPIC_PACKET_ID,
      OWNER_RESTORE_ARTIFACT_ID,
    );
    expect(session).not.toBeNull();
    expect(session?.ingestedAtom.title).toBe(
      "Why price per serving can still compare the wrong things",
    );
    expect(session?.stage).toBe("ready_for_storyboard");
  });

  it("returns null for mismatched URL IDs without reading a wrong session", () => {
    const session = extractOwnerRestoreSession(
      FIXTURE_ENVELOPE,
      "tp_10794592-remint",
      "art_0e0dd414-remint",
    );
    expect(session).toBeNull();
  });
});

describe("fetchAndPersistOwnerRestore", () => {
  it("matching IDs fetch envelope, persist, and load back", async () => {
    stubBrowserStorage();
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => FIXTURE_ENVELOPE,
    })) as unknown as typeof fetch;

    const result = await fetchAndPersistOwnerRestore({
      topicPacketId: OWNER_RESTORE_TOPIC_PACKET_ID,
      artifactId: OWNER_RESTORE_ARTIFACT_ID,
      fetchImpl,
    });

    expect(result.ok).toBe(true);
    expect(fetchImpl).toHaveBeenCalledWith(
      OWNER_RESTORE_ENVELOPE_PATH,
      expect.objectContaining({ method: "GET" }),
    );

    const loaded = loadShortsSession(OWNER_RESTORE_TOPIC_PACKET_ID);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    expect(loaded.session.artifactId).toBe(OWNER_RESTORE_ARTIFACT_ID);
    expect(loaded.session.ingestedAtom.title).toContain("price per serving");
    expect(typeof window.localStorage.getItem(YOUTUBE_SHORTS_STORAGE_KEY)).toBe(
      "string",
    );
  });

  it("mismatched IDs do not fetch or persist", async () => {
    const { store } = stubBrowserStorage();
    const fetchImpl = vi.fn() as unknown as typeof fetch;

    const result = await fetchAndPersistOwnerRestore({
      topicPacketId: "tp_10794592-remint",
      artifactId: "art_0e0dd414-remint",
      fetchImpl,
    });

    expect(result).toEqual({ ok: false, reason: "ids_mismatch" });
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(store.size).toBe(0);
  });
});
