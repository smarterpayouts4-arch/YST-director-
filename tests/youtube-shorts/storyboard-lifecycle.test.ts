import { afterEach, describe, expect, it, vi } from "vitest";
import type { TopicPacket } from "@/features/content-intelligence/contracts/topic-packet";
import { ingestTopicPacket } from "@/features/social-media/youtube-shorts/contracts/ingest-topic-packet";
import {
  applyGeneratedProduction,
  applyGeneratedStoryboard,
  applyWorkingStoryboard,
  approveWorkingStoryboard,
  orderedStoryboardScenes,
  reopenApprovedStoryboard,
  updateWorkingScene,
} from "@/features/social-media/youtube-shorts/contracts/storyboard-lifecycle";
import { loadShortsSessionForPage } from "@/features/social-media/youtube-shorts/state/resume-shorts-session";
import { persistSession } from "@/features/social-media/youtube-shorts/state/shorts-storage";
import type { YouTubeShortsProduction } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-production";
import type { YouTubeShortsStoryboard } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-storyboard";

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

function makePacket(): TopicPacket {
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
  };
}

function makeBoard(title = "open"): YouTubeShortsStoryboard {
  return {
    estimatedTotalSeconds: 49,
    scenes: [1, 2, 3, 4, 5, 6, 7].map((n) => ({
      sceneNumber: n,
      storyRole: n === 1 ? title : `role-${n}`,
      purpose: "p",
      narration: "n",
      sceneDescription: "d",
      onScreenText: "t",
      durationTargetSeconds: 7,
    })),
  };
}

function makeProduction(): YouTubeShortsProduction {
  return {
    projectVisualContinuity: "Shared look",
    scenes: [1, 2, 3, 4, 5, 6, 7].map((n) => ({
      sceneNumber: n,
      visualPrompt: `visual-${n}`,
      voiceDirection: "steady",
      assetType: "video" as const,
      motionPrompt: `motion-${n}`,
      continuityDelta: `delta-${n}`,
    })),
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("storyboard persistence and approval", () => {
  it("persists generated and owner-edited boards; refresh does not clear them", () => {
    stubBrowserStorage();
    const packet = makePacket();
    const created = ingestTopicPacket({
      packet,
      projectId: "proj_1",
      artifactId: "art_1",
    });
    expect(persistSession(created).ok).toBe(true);

    const drafted = applyGeneratedStoryboard(
      created,
      makeBoard("generated"),
      "ci-shorts-1.0.0",
    );
    expect(drafted.ingestedAtom.title).toBe("Title A");
    expect(persistSession(drafted).ok).toBe(true);

    const edited = applyWorkingStoryboard(drafted, makeBoard("edited"));
    expect(persistSession(edited).ok).toBe(true);

    const resumed = loadShortsSessionForPage("tp_a");
    expect(resumed.ok).toBe(true);
    if (!resumed.ok) return;
    expect(resumed.session.ingestedAtom.title).toBe("Title A");
    expect(resumed.session.workingStoryboard?.scenes[0]?.storyRole).toBe(
      "edited",
    );
    expect(resumed.session.generatedStoryboard?.scenes[0]?.storyRole).toBe(
      "generated",
    );
    expect(resumed.session.stage).toBe("storyboard_draft");
  });

  it("approval freezes a snapshot that later working edits cannot rewrite without reopen", () => {
    stubBrowserStorage();
    const packet = makePacket();
    let session = ingestTopicPacket({
      packet,
      projectId: "proj_1",
      artifactId: "art_1",
    });
    session = applyGeneratedStoryboard(session, makeBoard("generated"), "v");
    session = applyWorkingStoryboard(session, makeBoard("owner"));
    session = approveWorkingStoryboard(session);
    expect(session.stage).toBe("storyboard_approved");
    expect(session.approvedStoryboard?.scenes[0]?.storyRole).toBe("owner");
    const frozen = JSON.stringify(session.approvedStoryboard);

    expect(() =>
      applyWorkingStoryboard(session, makeBoard("sneak")),
    ).toThrow(/Reopen/);

    const reopened = reopenApprovedStoryboard(session);
    expect(reopened.stage).toBe("storyboard_draft");
    expect(reopened.approvedStoryboard).toBeNull();
    expect(JSON.stringify(session.approvedStoryboard)).toBe(frozen);
  });

  it("updateWorkingScene patches only the targeted scene", () => {
    const board = makeBoard("generated");
    const before = JSON.parse(JSON.stringify(board)) as typeof board;
    const next = updateWorkingScene(board, 4, {
      narration: "scene-4-only",
      purpose: "purpose-4-only",
    });

    expect(next.scenes.find((scene) => scene.sceneNumber === 4)?.narration).toBe(
      "scene-4-only",
    );
    expect(next.scenes.find((scene) => scene.sceneNumber === 4)?.purpose).toBe(
      "purpose-4-only",
    );
    for (const scene of next.scenes) {
      if (scene.sceneNumber === 4) continue;
      expect(scene).toEqual(
        before.scenes.find((item) => item.sceneNumber === scene.sceneNumber),
      );
    }
    expect(board.scenes.find((scene) => scene.sceneNumber === 4)?.narration).toBe(
      "n",
    );
    expect(orderedStoryboardScenes(next).map((scene) => scene.sceneNumber)).toEqual(
      [1, 2, 3, 4, 5, 6, 7],
    );
  });

  it("working scene edits do not mutate generated or approved snapshots", () => {
    stubBrowserStorage();
    const packet = makePacket();
    let session = ingestTopicPacket({
      packet,
      projectId: "proj_1",
      artifactId: "art_1",
    });
    session = applyGeneratedStoryboard(session, makeBoard("generated"), "v");
    const generatedFrozen = JSON.stringify(session.generatedStoryboard);

    const patched = updateWorkingScene(session.workingStoryboard!, 4, {
      narration: "owner-4",
    });
    session = applyWorkingStoryboard(session, patched);
    expect(JSON.stringify(session.generatedStoryboard)).toBe(generatedFrozen);
    expect(
      session.workingStoryboard?.scenes.find((scene) => scene.sceneNumber === 4)
        ?.narration,
    ).toBe("owner-4");
    expect(
      session.generatedStoryboard?.scenes.find((scene) => scene.sceneNumber === 4)
        ?.narration,
    ).toBe("n");

    session = approveWorkingStoryboard(session);
    expect(
      session.approvedStoryboard?.scenes.find((scene) => scene.sceneNumber === 4)
        ?.narration,
    ).toBe("owner-4");
    const approvedFrozen = JSON.stringify(session.approvedStoryboard);
    const reopened = reopenApprovedStoryboard(session);
    const afterReopen = applyWorkingStoryboard(
      reopened,
      updateWorkingScene(reopened.workingStoryboard!, 2, {
        storyRole: "changed-2",
      }),
    );
    expect(JSON.stringify(session.approvedStoryboard)).toBe(approvedFrozen);
    expect(
      afterReopen.workingStoryboard?.scenes.find(
        (scene) => scene.sceneNumber === 2,
      )?.storyRole,
    ).toBe("changed-2");
    expect(
      afterReopen.workingStoryboard?.scenes.find(
        (scene) => scene.sceneNumber === 4,
      )?.narration,
    ).toBe("owner-4");
  });

  it("clears production on reopen and on storyboard regenerate", () => {
    let session = ingestTopicPacket({
      packet: makePacket(),
      projectId: "proj_1",
      artifactId: "art_1",
    });
    session = applyGeneratedStoryboard(session, makeBoard("generated"), "v");
    session = approveWorkingStoryboard(session);
    session = applyGeneratedProduction(
      session,
      makeProduction(),
      "ci-shorts-production-1.0.0",
      "2026-08-14T00:00:00.000Z",
    );
    expect(session.workingProduction).toBeTruthy();
    expect(session.productionPromptVersion).toBe("ci-shorts-production-1.0.0");

    const approvedFrozen = JSON.stringify(session.approvedStoryboard);
    const reopened = reopenApprovedStoryboard(session);
    expect(reopened.generatedProduction ?? null).toBeNull();
    expect(reopened.workingProduction ?? null).toBeNull();
    expect(reopened.productionPromptVersion).toBeUndefined();
    expect(reopened.productionGeneratedAt).toBeUndefined();
    expect(reopened.approvedStoryboard).toBeNull();
    expect(JSON.stringify(reopened.workingStoryboard)).toBe(approvedFrozen);
    expect(reopened.workingStoryboard).not.toBe(session.approvedStoryboard);

    let again = applyGeneratedStoryboard(reopened, makeBoard("again"), "v2");
    again = approveWorkingStoryboard(again);
    again = applyGeneratedProduction(
      again,
      makeProduction(),
      "ci-shorts-production-1.0.0",
      "2026-08-14T01:00:00.000Z",
    );
    const regenerated = applyGeneratedStoryboard(
      again,
      makeBoard("regen"),
      "v3",
    );
    expect(regenerated.stage).toBe("storyboard_draft");
    expect(regenerated.generatedProduction ?? null).toBeNull();
    expect(regenerated.workingProduction ?? null).toBeNull();
    expect(regenerated.generatedStoryboard?.scenes[0]?.storyRole).toBe("regen");
    expect(regenerated.workingStoryboard?.scenes[0]?.storyRole).toBe("regen");
    expect(regenerated.generatedStoryboard).not.toBe(regenerated.workingStoryboard);
  });

  it("fresh generate stores independent clones of the same content", () => {
    let session = ingestTopicPacket({
      packet: makePacket(),
      projectId: "proj_1",
      artifactId: "art_1",
    });
    session = applyGeneratedStoryboard(session, makeBoard("generated"), "v");
    expect(session.generatedStoryboard).not.toBe(session.workingStoryboard);
    expect(JSON.stringify(session.generatedStoryboard)).toBe(
      JSON.stringify(session.workingStoryboard),
    );
    session.workingStoryboard!.scenes[0]!.storyRole = "mutated-in-place";
    expect(session.generatedStoryboard?.scenes[0]?.storyRole).toBe("generated");
  });

  it("approve rejects a working board that fails shape checks", () => {
    let session = ingestTopicPacket({
      packet: makePacket(),
      projectId: "proj_1",
      artifactId: "art_1",
    });
    session = applyGeneratedStoryboard(session, makeBoard("generated"), "v");
    session = applyWorkingStoryboard(
      session,
      updateWorkingScene(session.workingStoryboard!, 4, { narration: "" }),
    );
    expect(() => approveWorkingStoryboard(session)).toThrow(/Cannot approve/);
  });
});
