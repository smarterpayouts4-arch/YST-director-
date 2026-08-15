import { z } from "zod";

/**
 * Sibling production expansion schema (P1C).
 * Never mutates approvedStoryboard keys. Narration / onScreenText are NOT here —
 * they are merged from the approved storyboard at export time only.
 */

export const SCENE_VISUAL_PROMPT_MAX_CHARS = 20_000;
export const SCENE_MOTION_PROMPT_MAX_CHARS = 20_000;
export const SCENE_VOICE_DIRECTION_MAX_CHARS = 800;
export const SCENE_CONTINUITY_DELTA_MAX_CHARS = 2_000;
export const PROJECT_VISUAL_CONTINUITY_MAX_CHARS = 8_000;
export const CHARACTER_NAME_MAX_CHARS = 80;
export const CHARACTER_IDENTITY_MAX_CHARS = 4_000;
export const CHARACTER_CONTINUITY_MAX_CHARS = 4_000;

/** Headers reserved for paste export — must not appear as content line-starts. */
export const RESERVED_EXPORT_HEADERS = [
  "VISUAL PROMPT",
  "NARRATION",
  "VOICE DIRECTION",
  "ON-SCREEN TEXT",
  "ASSET TYPE",
  "MOTION PROMPT",
  "CHARACTER NAME",
  "CHARACTER IDENTITY",
  "CHARACTER CONTINUITY",
  "STORY ROLE",
  "PURPOSE",
  "SCENE DESCRIPTION",
  "TIMING",
  "CONTINUITY",
  "PROJECT VISUAL CONTINUITY",
] as const;

export const YouTubeShortsAssetTypeSchema = z.enum(["image", "video"]);

export const YouTubeShortsProductionSceneSchema = z.object({
  sceneNumber: z.number().int().min(1).max(7),
  visualPrompt: z.string().min(1).max(SCENE_VISUAL_PROMPT_MAX_CHARS),
  voiceDirection: z.string().max(SCENE_VOICE_DIRECTION_MAX_CHARS),
  assetType: YouTubeShortsAssetTypeSchema,
  /** Required non-empty when assetType is video; empty when image. */
  motionPrompt: z.string().max(SCENE_MOTION_PROMPT_MAX_CHARS),
  continuityDelta: z.string().max(SCENE_CONTINUITY_DELTA_MAX_CHARS),
});

export const YouTubeShortsProductionModelSchema = z.object({
  projectVisualContinuity: z
    .string()
    .min(1)
    .max(PROJECT_VISUAL_CONTINUITY_MAX_CHARS),
  // OpenAI structured outputs require every property present: use `.nullable()`
  // (not bare `.optional()`) for fields that may be empty / absent of talent.
  characterName: z.string().max(CHARACTER_NAME_MAX_CHARS).nullable(),
  characterIdentity: z.string().max(CHARACTER_IDENTITY_MAX_CHARS).nullable(),
  characterContinuity: z.string().max(CHARACTER_CONTINUITY_MAX_CHARS).nullable(),
  scenes: z.array(YouTubeShortsProductionSceneSchema).length(7),
});

function hasReservedHeader(text: string): string | null {
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim().toUpperCase();
    for (const header of RESERVED_EXPORT_HEADERS) {
      if (trimmed === header || trimmed.startsWith(`${header}:`)) {
        return header;
      }
    }
  }
  return null;
}

export const YouTubeShortsProductionSchema =
  YouTubeShortsProductionModelSchema.superRefine((board, ctx) => {
    const numbers = board.scenes.map((s) => s.sceneNumber);
    const unique = new Set(numbers);
    if (unique.size !== 7) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "sceneNumber values must be unique",
        path: ["scenes"],
      });
    }
    for (let expected = 1; expected <= 7; expected += 1) {
      if (!unique.has(expected)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `missing sceneNumber ${expected}`,
          path: ["scenes"],
        });
      }
    }

    const boardStrings: Array<{ path: (string | number)[]; value: string }> = [
      { path: ["projectVisualContinuity"], value: board.projectVisualContinuity },
    ];
    if (board.characterName) {
      boardStrings.push({ path: ["characterName"], value: board.characterName });
    }
    if (board.characterIdentity) {
      boardStrings.push({
        path: ["characterIdentity"],
        value: board.characterIdentity,
      });
    }
    if (board.characterContinuity) {
      boardStrings.push({
        path: ["characterContinuity"],
        value: board.characterContinuity,
      });
    }

    for (const [index, scene] of board.scenes.entries()) {
      if (scene.assetType === "video" && scene.motionPrompt.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "motionPrompt required when assetType is video",
          path: ["scenes", index, "motionPrompt"],
        });
      }
      if (scene.assetType === "image" && scene.motionPrompt.trim().length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "motionPrompt must be empty when assetType is image",
          path: ["scenes", index, "motionPrompt"],
        });
      }
      boardStrings.push(
        { path: ["scenes", index, "visualPrompt"], value: scene.visualPrompt },
        {
          path: ["scenes", index, "voiceDirection"],
          value: scene.voiceDirection,
        },
        { path: ["scenes", index, "motionPrompt"], value: scene.motionPrompt },
        {
          path: ["scenes", index, "continuityDelta"],
          value: scene.continuityDelta,
        },
      );
    }

    for (const entry of boardStrings) {
      const hit = hasReservedHeader(entry.value);
      if (hit) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `reserved export header leaked into content: ${hit}`,
          path: entry.path,
        });
      }
    }
  });

export type YouTubeShortsAssetType = z.infer<typeof YouTubeShortsAssetTypeSchema>;
export type YouTubeShortsProductionScene = z.infer<
  typeof YouTubeShortsProductionSceneSchema
>;
export type YouTubeShortsProduction = z.infer<
  typeof YouTubeShortsProductionSchema
>;

export function validateProductionShape(
  board: YouTubeShortsProduction,
): string[] {
  const parsed = YouTubeShortsProductionSchema.safeParse(board);
  if (parsed.success) return [];
  return parsed.error.issues.map(
    (issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
  );
}

/** True when optional CHARACTER* profile is complete enough to export. */
export function hasCharacterProfile(
  production: Pick<
    YouTubeShortsProduction,
    "characterName" | "characterIdentity" | "characterContinuity"
  >,
): boolean {
  return Boolean(
    production.characterName?.trim() &&
      production.characterIdentity?.trim() &&
      production.characterContinuity?.trim(),
  );
}
