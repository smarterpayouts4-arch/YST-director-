import { describe, expect, it } from "vitest";
import {
  YouTubeShortsStoryboardModelSchema,
  YouTubeShortsStoryboardSchema,
  validateStoryboardShape,
} from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-storyboard";

function scene(n: number, role = "open") {
  return {
    sceneNumber: n,
    storyRole: role,
    purpose: "p",
    narration: "n",
    sceneDescription: "d",
    onScreenText: "t",
    durationTargetSeconds: 7,
  };
}

function board(roles?: string[]) {
  return {
    estimatedTotalSeconds: 49,
    scenes: [1, 2, 3, 4, 5, 6, 7].map((n, i) =>
      scene(n, roles?.[i] ?? `role-${n}`),
    ),
  };
}

describe("YouTube Shorts storyboard schema", () => {
  it("requires exactly 7 scenes numbered 1–7", () => {
    expect(YouTubeShortsStoryboardSchema.safeParse(board()).success).toBe(true);
    expect(
      YouTubeShortsStoryboardSchema.safeParse({
        estimatedTotalSeconds: 49,
        scenes: board().scenes.slice(0, 6),
      }).success,
    ).toBe(false);
    expect(
      YouTubeShortsStoryboardSchema.safeParse({
        estimatedTotalSeconds: 49,
        scenes: [...board().scenes, scene(8)],
      }).success,
    ).toBe(false);
    expect(
      YouTubeShortsStoryboardSchema.safeParse({
        estimatedTotalSeconds: 49,
        scenes: [1, 2, 3, 4, 5, 6, 6].map((n) => scene(n)),
      }).success,
    ).toBe(false);
    expect(validateStoryboardShape(board()).length).toBe(0);
  });

  it("accepts arbitrary storyRole strings and has no LoD enum", () => {
    const parsed = YouTubeShortsStoryboardSchema.parse(
      board(["hook", "because", "custom-lens", "payoff", "x", "y", "z"]),
    );
    expect(parsed.scenes[2]?.storyRole).toBe("custom-lens");
    expect(YouTubeShortsStoryboardModelSchema.shape.scenes.element.shape.storyRole).toBeDefined();
    expect(
      YouTubeShortsStoryboardModelSchema.shape.scenes.element.shape.storyRole
        ._def.typeName,
    ).toBe("ZodString");
    expect(JSON.stringify(YouTubeShortsStoryboardModelSchema)).not.toMatch(
      /Mistake|Framework/,
    );
  });

  it("keeps storyArchitecture optional on persisted boards and required on the model contract", () => {
    expect(YouTubeShortsStoryboardSchema.safeParse(board()).success).toBe(true);
    expect(YouTubeShortsStoryboardModelSchema.safeParse(board()).success).toBe(
      false,
    );
    const keys = Object.keys(YouTubeShortsStoryboardModelSchema.shape);
    expect(keys[0]).toBe("storyArchitecture");
    const architectureKeys = Object.keys(
      YouTubeShortsStoryboardModelSchema.shape.storyArchitecture.shape,
    );
    expect(architectureKeys).toContain("hookWhy");
    expect(
      YouTubeShortsStoryboardModelSchema.shape.storyArchitecture.shape.beats
        .element.shape.because,
    ).toBeDefined();
  });

  it("rejects P1C production fields from the persist contract", () => {
    const keys = Object.keys(
      YouTubeShortsStoryboardModelSchema.shape.scenes.element.shape,
    );
    expect(keys).toContain("situationLock");
    expect(keys).not.toContain("imagePrompt");
    expect(keys).not.toContain("motionPrompt");
    expect(keys).not.toContain("cameraMovement");
    expect(keys).not.toContain("shotSize");
    expect(keys).not.toContain("actor");
    expect(keys).not.toContain("physicalAction");
  });
});
