import { describe, expect, it } from "vitest";
import { buildExpandProductionPrompt } from "@/features/social-media/youtube-shorts/prompts/expand-production";
import { YouTubeShortsProductionModelSchema } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-production";
import type { YouTubeShortsStoryboard } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-storyboard";
import { formatFullScenePaste } from "@/features/social-media/youtube-shorts/export/format-scene-paste";
import {
  applyGeneratedProduction,
  applyWorkingProduction,
  approveWorkingStoryboard,
  applyGeneratedStoryboard,
  updateWorkingProductionScene,
} from "@/features/social-media/youtube-shorts/contracts/storyboard-lifecycle";
import type { TopicPacket } from "@/features/content-intelligence/contracts/topic-packet";
import { ingestTopicPacket } from "@/features/social-media/youtube-shorts/contracts/ingest-topic-packet";
import type { YouTubeShortsProduction } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-production";

const projection = {
  audience: "a",
  confidence: "high" as const,
  customerMoment: "m",
  decisionQuestion: "q",
  desiredTakeaway: "d",
  evidenceQuotes: [],
  hypothesisDependencies: [],
  limitations: [],
  opportunity: "o",
  premise: "p",
  restrictions: [],
  supportingInsights: ["i"],
  tension: "t",
  title: "Compare equivalent products",
  unresolvedAssumptions: [],
  whyItMatters: "w",
};

function makeBoard(): YouTubeShortsStoryboard {
  return {
    estimatedTotalSeconds: 49,
    scenes: [1, 2, 3, 4, 5, 6, 7].map((n) => ({
      sceneNumber: n,
      storyRole: `role-${n}`,
      purpose: `purpose-${n}`,
      narration: `LOCKED-NARRATION-${n}`,
      sceneDescription: `desc-${n}`,
      onScreenText: `LOCKED-OST-${n}`,
      durationTargetSeconds: 7,
    })),
  };
}

function makeProduction(): YouTubeShortsProduction {
  return {
    projectVisualContinuity: "Shared look.",
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

describe("narration immutability (omit-only; no dual storage)", () => {
  it("I1: production model schema has no narration or onScreenText keys", () => {
    const shape = YouTubeShortsProductionModelSchema.shape;
    expect("narration" in shape).toBe(false);
    expect("onScreenText" in shape).toBe(false);
    const sceneShape = shape.scenes._def.type.shape;
    expect("narration" in sceneShape).toBe(false);
    expect("onScreenText" in sceneShape).toBe(false);
  });

  it("I2: expand prompt omits narration and onScreenText from model input", () => {
    const { instructions, input } = buildExpandProductionPrompt({
      projection,
      approvedStoryboard: makeBoard(),
    });
    expect(instructions).toMatch(/Do NOT output narration or onScreenText/i);
    expect(input).not.toContain("LOCKED-NARRATION");
    expect(input).not.toContain("LOCKED-OST");
    expect(input).not.toContain('"narration"');
    expect(input).not.toContain('"onScreenText"');
  });

  it("I3: export merges approved storyboard narration/OST only", () => {
    const board = makeBoard();
    const production = makeProduction();
    const paste = formatFullScenePaste({
      storyboardScene: board.scenes[0]!,
      productionScene: production.scenes[0]!,
      production,
    });
    expect(paste).toContain("LOCKED-NARRATION-1");
    expect(paste).toContain("LOCKED-OST-1");
    expect(paste).not.toContain("visual-1\nLOCKED");
  });

  it("I4–I6: production edits never mutate approved storyboard narration/OST", () => {
    let session = ingestTopicPacket({
      packet: makePacket(),
      projectId: "proj_1",
      artifactId: "art_1",
    });
    session = applyGeneratedStoryboard(session, makeBoard(), "ci-shorts-1.0.0");
    session = approveWorkingStoryboard(session);
    const frozenNarration = session.approvedStoryboard!.scenes.map((s) => ({
      sceneNumber: s.sceneNumber,
      narration: s.narration,
      onScreenText: s.onScreenText,
    }));

    session = applyGeneratedProduction(
      session,
      makeProduction(),
      "ci-shorts-production-1.0.0",
      "2026-08-14T00:00:00.000Z",
    );
    const patched = updateWorkingProductionScene(
      session.workingProduction!,
      1,
      { visualPrompt: "edited-visual-only" },
    );
    session = applyWorkingProduction(session, patched);

    expect(
      session.approvedStoryboard!.scenes.map((s) => ({
        sceneNumber: s.sceneNumber,
        narration: s.narration,
        onScreenText: s.onScreenText,
      })),
    ).toEqual(frozenNarration);
    expect(session.workingProduction!.scenes[0]!.visualPrompt).toBe(
      "edited-visual-only",
    );
    expect(JSON.stringify(session.workingProduction)).not.toContain(
      "LOCKED-NARRATION",
    );
  });

  it("I7–I9: generatedProduction stays immutable while workingProduction edits", () => {
    let session = ingestTopicPacket({
      packet: makePacket(),
      projectId: "proj_1",
      artifactId: "art_1",
    });
    session = applyGeneratedStoryboard(session, makeBoard(), "v");
    session = approveWorkingStoryboard(session);
    session = applyGeneratedProduction(
      session,
      makeProduction(),
      "ci-shorts-production-1.0.0",
      "2026-08-14T00:00:00.000Z",
    );
    const generatedFrozen = JSON.stringify(session.generatedProduction);
    session = applyWorkingProduction(
      session,
      updateWorkingProductionScene(session.workingProduction!, 3, {
        voiceDirection: "whisper",
      }),
    );
    expect(JSON.stringify(session.generatedProduction)).toBe(generatedFrozen);
    expect(
      session.workingProduction!.scenes.find((s) => s.sceneNumber === 3)
        ?.voiceDirection,
    ).toBe("whisper");
    expect(
      session.generatedProduction!.scenes.find((s) => s.sceneNumber === 3)
        ?.voiceDirection,
    ).toBe("steady");
  });
});
