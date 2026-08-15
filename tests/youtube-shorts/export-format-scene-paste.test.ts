import { describe, expect, it } from "vitest";
import {
  formatFullScenePaste,
  formatMotionPromptBody,
  formatMotionPromptPaste,
  formatSceneNotesPaste,
  formatVisualPromptBody,
  formatVisualPromptPaste,
} from "@/features/social-media/youtube-shorts/export/format-scene-paste";
import {
  SCENE_MOTION_PROMPT_MAX_CHARS,
  SCENE_VISUAL_PROMPT_MAX_CHARS,
  SCENE_VOICE_DIRECTION_MAX_CHARS,
  YouTubeShortsProductionSchema,
  type YouTubeShortsProduction,
  type YouTubeShortsProductionScene,
} from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-production";
import type { YouTubeShortsStoryboardScene } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-storyboard";

function storyScene(
  n: number,
  overrides: Partial<YouTubeShortsStoryboardScene> = {},
): YouTubeShortsStoryboardScene {
  return {
    sceneNumber: n,
    storyRole: `role-${n}`,
    purpose: `purpose-${n}`,
    narration: `Narration line for scene ${n}.`,
    sceneDescription: `desc-${n}`,
    onScreenText: `OST ${n}`,
    durationTargetSeconds: 7,
    ...overrides,
  };
}

function prodScene(
  n: number,
  overrides: Partial<YouTubeShortsProductionScene> = {},
): YouTubeShortsProductionScene {
  return {
    sceneNumber: n,
    visualPrompt: `A vertical 9:16 still for scene ${n}.`,
    voiceDirection: "Calm, direct.",
    assetType: "video",
    motionPrompt: `Slow push-in for scene ${n}.`,
    continuityDelta: `Keep wardrobe from prior beat for scene ${n}.`,
    ...overrides,
  };
}

function production(
  overrides: Partial<YouTubeShortsProduction> = {},
): YouTubeShortsProduction {
  return {
    projectVisualContinuity: "Warm daylight office; soft contrast; handheld feel.",
    scenes: [1, 2, 3, 4, 5, 6, 7].map((n) => prodScene(n)),
    ...overrides,
  };
}

describe("format-scene-paste golden export contract", () => {
  it("formats visual prompt exactly", () => {
    expect(formatVisualPromptPaste(prodScene(1))).toBe(
      "VISUAL PROMPT\nA vertical 9:16 still for scene 1.",
    );
  });

  it("formats motion prompt for video only", () => {
    expect(formatMotionPromptPaste(prodScene(1))).toBe(
      "MOTION PROMPT\nSlow push-in for scene 1.",
    );
    expect(
      formatMotionPromptPaste(
        prodScene(1, { assetType: "image", motionPrompt: "" }),
      ),
    ).toBe("");
  });

  it("copy helpers are body-only (no section headers)", () => {
    expect(formatVisualPromptBody(prodScene(1))).toBe(
      "A vertical 9:16 still for scene 1.",
    );
    expect(formatVisualPromptBody(prodScene(1))).not.toContain("VISUAL PROMPT");
    expect(formatMotionPromptBody(prodScene(1))).toBe(
      "Slow push-in for scene 1.",
    );
    expect(formatMotionPromptBody(prodScene(1))).not.toContain("MOTION PROMPT");
    expect(
      formatMotionPromptBody(
        prodScene(1, { assetType: "image", motionPrompt: "" }),
      ),
    ).toBe("");
  });

  it("scene notes dump includes storyboard fields before production exists", () => {
    const notes = formatSceneNotesPaste({
      storyboardScene: storyScene(1),
    });
    expect(notes).toContain("Scene 1 — role-1");
    expect(notes).toContain("STORY ROLE");
    expect(notes).toContain("PURPOSE");
    expect(notes).toContain("SCENE DESCRIPTION");
    expect(notes).toContain("TIMING");
    expect(notes).toContain("NARRATION");
    expect(notes).toContain("ON-SCREEN TEXT");
    expect(notes).toContain("Narration line for scene 1.");
    expect(notes).not.toContain("VISUAL PROMPT");
  });

  it("golden: normal video with voice + OST", () => {
    const out = formatFullScenePaste({
      storyboardScene: storyScene(1),
      productionScene: prodScene(1),
      production: production(),
    });
    expect(out).toBe(
      [
        "VISUAL PROMPT",
        "A vertical 9:16 still for scene 1.",
        "",
        "NARRATION",
        "Narration line for scene 1.",
        "",
        "VOICE DIRECTION",
        "Calm, direct.",
        "",
        "ON-SCREEN TEXT",
        "OST 1",
        "",
        "ASSET TYPE",
        "video",
        "",
        "MOTION PROMPT",
        "Slow push-in for scene 1.",
        "",
      ].join("\n"),
    );
  });

  it("golden: image omits motion; empty optionals omitted", () => {
    const out = formatFullScenePaste({
      storyboardScene: storyScene(2, { onScreenText: "" }),
      productionScene: prodScene(2, {
        assetType: "image",
        motionPrompt: "",
        voiceDirection: "",
      }),
      production: production(),
    });
    expect(out).toBe(
      [
        "VISUAL PROMPT",
        "A vertical 9:16 still for scene 2.",
        "",
        "NARRATION",
        "Narration line for scene 2.",
        "",
        "ASSET TYPE",
        "image",
        "",
      ].join("\n"),
    );
    expect(out).not.toContain("MOTION PROMPT");
    expect(out).not.toContain("VOICE DIRECTION");
    expect(out).not.toContain("ON-SCREEN TEXT");
  });

  it("golden: optional CHARACTER* block when profile present", () => {
    const out = formatFullScenePaste({
      storyboardScene: storyScene(3, { onScreenText: "" }),
      productionScene: prodScene(3, { voiceDirection: "" }),
      production: production({
        characterName: "Maya",
        characterIdentity: "Late-30s product manager, navy blazer.",
        characterContinuity: "Same blazer and glasses across scenes.",
      }),
    });
    expect(out).toBe(
      [
        "CHARACTER NAME",
        "Maya",
        "",
        "CHARACTER IDENTITY",
        "Late-30s product manager, navy blazer.",
        "",
        "CHARACTER CONTINUITY",
        "Same blazer and glasses across scenes.",
        "",
        "VISUAL PROMPT",
        "A vertical 9:16 still for scene 3.",
        "",
        "NARRATION",
        "Narration line for scene 3.",
        "",
        "ASSET TYPE",
        "video",
        "",
        "MOTION PROMPT",
        "Slow push-in for scene 3.",
        "",
      ].join("\n"),
    );
  });

  it("never exports storyboard creative fields or continuity internals", () => {
    const out = formatFullScenePaste({
      storyboardScene: storyScene(1),
      productionScene: prodScene(1),
      production: production({
        projectVisualContinuity: "INTERNAL WORLD LOCK — must not appear",
      }),
    });
    expect(out).not.toMatch(/STORY ROLE|PURPOSE|SCENE DESCRIPTION|TIMING/);
    expect(out).not.toContain("CONTINUITY\n");
    expect(out).not.toContain("PROJECT VISUAL CONTINUITY");
    expect(out).not.toContain("INTERNAL WORLD LOCK");
    expect(out).not.toContain("Keep wardrobe");
  });

  it("seven independent packages stay scene-scoped", () => {
    const board = production();
    const packages = [1, 2, 3, 4, 5, 6, 7].map((n) =>
      formatFullScenePaste({
        storyboardScene: storyScene(n),
        productionScene: board.scenes.find((s) => s.sceneNumber === n)!,
        production: board,
      }),
    );
    expect(packages).toHaveLength(7);
    expect(new Set(packages).size).toBe(7);
    for (let i = 0; i < 7; i += 1) {
      expect(packages[i]).toContain(`scene ${i + 1}`);
      expect(packages[i]).not.toContain(`scene ${((i + 1) % 7) + 1}.`);
    }
  });

  it("schema rejects reserved headers and enforces ceilings", () => {
    const reserved = YouTubeShortsProductionSchema.safeParse(
      production({
        scenes: [1, 2, 3, 4, 5, 6, 7].map((n) =>
          prodScene(n, {
            visualPrompt:
              n === 1
                ? "VISUAL PROMPT\nleaked header body"
                : `A vertical 9:16 still for scene ${n}.`,
          }),
        ),
      }),
    );
    expect(reserved.success).toBe(false);

    const tooLong = YouTubeShortsProductionSchema.safeParse(
      production({
        scenes: [1, 2, 3, 4, 5, 6, 7].map((n) =>
          prodScene(n, {
            visualPrompt:
              n === 1
                ? "x".repeat(SCENE_VISUAL_PROMPT_MAX_CHARS + 1)
                : `A vertical 9:16 still for scene ${n}.`,
            voiceDirection:
              n === 2
                ? "y".repeat(SCENE_VOICE_DIRECTION_MAX_CHARS + 1)
                : "Calm, direct.",
            motionPrompt:
              n === 3
                ? "z".repeat(SCENE_MOTION_PROMPT_MAX_CHARS + 1)
                : `Slow push-in for scene ${n}.`,
          }),
        ),
      }),
    );
    expect(tooLong.success).toBe(false);
  });
});
