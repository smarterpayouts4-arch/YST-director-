import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { zodTextFormat } from "openai/helpers/zod";
import { operationRegistry } from "@/ai/operations/registry";
import { getRepairPolicy } from "@/ai/operations/repair-policy";
import { buildExpandProductionPrompt } from "@/features/social-media/youtube-shorts/prompts/expand-production";
import { SHORTS_PRODUCTION_PROMPT_VERSION } from "@/features/social-media/youtube-shorts/prompts/prompt-version";
import { YouTubeShortsProductionModelSchema } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-production";
import { YOUTUBE_SHORTS_PROJECTION_KEYS } from "@/features/social-media/youtube-shorts/contracts/project-topic-packet";
import type { YouTubeShortsStoryboard } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-storyboard";

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
  restrictions: ["Do not give medical advice."],
  supportingInsights: ["i"],
  tension: "t",
  title: "Compare equivalent products",
  unresolvedAssumptions: [],
  whyItMatters: "w",
};

const approvedStoryboard: YouTubeShortsStoryboard = {
  estimatedTotalSeconds: 49,
  scenes: [1, 2, 3, 4, 5, 6, 7].map((n) => ({
    sceneNumber: n,
    storyRole: `role-${n}`,
    purpose: `purpose-${n}`,
    narration: `narration-${n}`,
    sceneDescription: `desc-${n}`,
    onScreenText: `ost-${n}`,
    durationTargetSeconds: 7,
  })),
};

describe("expand-shorts-production contract", () => {
  it("registers one whole-board expand operation and no per-scene expand", () => {
    expect(operationRegistry["expand-shorts-production"]).toBeDefined();
    expect(
      Object.keys(operationRegistry).some((id) =>
        /expand-shorts-scene|per-scene-expand/i.test(id),
      ),
    ).toBe(false);
    expect(
      existsSync(
        join(process.cwd(), "src/app/api/social-media/youtube-shorts/expand"),
      ),
    ).toBe(true);
    expect(getRepairPolicy("youtube_shorts_production").maxAttempts).toBe(1);
  });

  it("prompt expands seven packages and omits narration from LLM surface", () => {
    const { instructions, input, promptVersion } = buildExpandProductionPrompt({
      projection,
      approvedStoryboard,
    });
    expect(promptVersion).toBe(SHORTS_PRODUCTION_PROMPT_VERSION);
    expect(instructions).toMatch(/EXACTLY 7/i);
    expect(instructions).toMatch(/projectVisualContinuity/i);
    expect(instructions).toMatch(/Do NOT output narration or onScreenText/i);
    expect(input).not.toContain('"narration"');
    expect(input).not.toContain('"onScreenText"');
    expect(input).toContain("Compare equivalent products");
    for (const key of YOUTUBE_SHORTS_PROJECTION_KEYS) {
      expect(input).toContain(`"${key}"`);
    }
    expect(
      YouTubeShortsProductionModelSchema.shape.scenes._def.minLength?.value ?? 7,
    ).toBe(7);
  });

  it("model schema is OpenAI structured-output compatible (no bare optional)", () => {
    expect(() =>
      zodTextFormat(YouTubeShortsProductionModelSchema, "youtube_shorts_production"),
    ).not.toThrow();
    const parsed = YouTubeShortsProductionModelSchema.safeParse({
      projectVisualContinuity: "Shared look",
      characterName: null,
      characterIdentity: null,
      characterContinuity: null,
      scenes: [1, 2, 3, 4, 5, 6, 7].map((n) => ({
        sceneNumber: n,
        visualPrompt: `visual-${n}`,
        voiceDirection: "steady",
        assetType: "video",
        motionPrompt: `motion-${n}`,
        continuityDelta: `delta-${n}`,
      })),
    });
    expect(parsed.success).toBe(true);
  });
});
