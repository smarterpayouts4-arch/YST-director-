import { z } from "zod";
import {
  validateStoryboardSemantics,
  validateStoryboardShape,
} from "@/features/social-media/youtube-shorts/schemas/yss/semantics";

/**
 * Internal Story Planning (P1B) — schema keys only.
 *
 * UI map: Role→storyRole, Purpose→purpose, Scene Description→sceneDescription,
 * Narration→narration, On-Screen Text→onScreenText, Timing→durationTargetSeconds.
 *
 * Generation order is intentional (structured-output key order = think order):
 * sceneNumber → storyRole → purpose → situationLock → sceneDescription →
 * narration → onScreenText → durationTargetSeconds. Zod validation is key-order independent.
 *
 * storyArchitecture is the locked story. Scenes are downstream of it.
 * Optional on persisted boards so older sessions still load.
 *
 * Downstream Generation (P1C — not in this schema): Visual Prompt, Voice Direction,
 * Asset Type (image|video), Motion Prompt, Continuity (internal; export via CHARACTER*
 * fields only — never a generic CONTINUITY paste header).
 *
 * sceneDescription is the human-readable visible event. situationLock is the
 * machine semantic contract for P1C. Neither is a generation-ready still plate.
 * Motion Prompt is action/camera/timing only and must not rewrite the still.
 *
 * Field map (do not duplicate architecture):
 * - eventMode = ADD (physical_comparison | mediated_surface | dual; P1C cannot infer)
 * - requiredSubjects / visibleActionOrState / relationship = ADD (P1C cannot infer)
 * - locationConstraint / humanPresenceConstraint = ADD, default "open"
 * - viewerMustPerceive = DROP (restates purpose)
 * - mustWithhold / hiddenFacts = DROP (restates scene1Withholds / openingQuestion)
 * - physicalAction = DROP (retired shot-card field; action stays visibleActionOrState)
 *
 * Semantic validation lives in ./yss/semantics.ts. This file stays the public contract.
 */
export const SITUATION_LOCK_OPEN = "open";
export const SITUATION_EVENT_MODES = [
  "physical_comparison",
  "mediated_surface",
  "dual",
] as const;
export const HUMAN_PRESENCE_CONSTRAINTS = [
  "open",
  "none",
  "hands",
  "partial",
  "person",
] as const;

export const YouTubeShortsSituationLockSchema = z.object({
  eventMode: z.enum(SITUATION_EVENT_MODES).optional(),
  requiredSubjects: z.array(z.string().min(1).max(80)).min(1).max(4),
  visibleActionOrState: z.string().min(1).max(200),
  relationship: z.string().min(1).max(240),
  locationConstraint: z.string().min(1).max(160),
  humanPresenceConstraint: z.enum(HUMAN_PRESENCE_CONSTRAINTS),
});

/** Model lock requires eventMode so P1C never infers channel from prose. */
export const YouTubeShortsSituationLockModelSchema =
  YouTubeShortsSituationLockSchema.extend({
    eventMode: z.enum(SITUATION_EVENT_MODES),
  });

export const YouTubeShortsStoryboardSceneSchema = z.object({
  sceneNumber: z.number().int().min(1).max(7),
  storyRole: z.string().min(1).max(240),
  purpose: z.string().min(1).max(700),
  situationLock: YouTubeShortsSituationLockSchema.optional(),
  sceneDescription: z.string().min(1).max(1200),
  narration: z.string().min(1).max(800),
  onScreenText: z.string().max(200),
  durationTargetSeconds: z.number().min(5).max(10),
});

/**
 * Model contract enforces the robust cascade with floors (density, not
 * padding): storyRole = short name — one-sentence definition (>=40);
 * purpose = 2–4 dense sentences (>=100); sceneDescription = staged scene
 * (>=200). Persist keeps min(1) everywhere so old sessions still load.
 */
export const YouTubeShortsStoryboardSceneModelSchema =
  YouTubeShortsStoryboardSceneSchema.extend({
    situationLock: YouTubeShortsSituationLockModelSchema,
    storyRole: z.string().min(40).max(240),
    purpose: z.string().min(100).max(700),
    sceneDescription: z.string().min(200).max(1200),
  });

export const YouTubeShortsStoryArchitectureBeatSchema = z.object({
  sceneNumber: z.number().int().min(1).max(7),
  job: z.string().min(1).max(240),
  because: z.string().max(240).optional(),
});

export const YouTubeShortsStoryArchitectureBeatModelSchema = z.object({
  sceneNumber: z.number().int().min(1).max(7),
  job: z.string().min(1).max(240),
  because: z.string().max(240),
});

export const YouTubeShortsStoryArchitectureSchema = z.object({
  storyPromise: z.string().min(1).max(400),
  carrierMode: z.enum(["single", "declared_comparison", "none"]),
  primaryCarrier: z.string().max(200),
  comparisonCarriers: z.array(z.string().min(1).max(200)).max(4),
  excludedCarriers: z.array(z.string().min(1).max(200)).max(8),
  viewerOpening: z.string().min(1).max(400),
  hookMechanism: z.string().min(1).max(240),
  hookWhy: z.string().max(240).optional(),
  openingQuestion: z.string().min(1).max(240),
  scene1Withholds: z.string().min(1).max(240),
  payoff: z.string().min(1).max(400),
  beats: z.array(YouTubeShortsStoryArchitectureBeatSchema).length(7),
});

export const YouTubeShortsStoryArchitectureModelSchema =
  YouTubeShortsStoryArchitectureSchema.extend({
    hookWhy: z.string().min(1).max(240),
    beats: z.array(YouTubeShortsStoryArchitectureBeatModelSchema).length(7),
  });

/** Provider contract — storyArchitecture first, then duration, then scenes. */
export const YouTubeShortsStoryboardModelSchema = z.object({
  storyArchitecture: YouTubeShortsStoryArchitectureModelSchema,
  estimatedTotalSeconds: z.number().min(35).max(70),
  scenes: z.array(YouTubeShortsStoryboardSceneModelSchema).length(7),
});

export const YouTubeShortsStoryboardSchema = z
  .object({
    storyArchitecture: YouTubeShortsStoryArchitectureSchema.optional(),
    estimatedTotalSeconds: z.number().min(35).max(70),
    scenes: z.array(YouTubeShortsStoryboardSceneSchema).length(7),
  })
  .superRefine((board, ctx) => {
    const numbers = board.scenes.map((scene) => scene.sceneNumber);
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
  });

export type YouTubeShortsStoryArchitecture = z.infer<
  typeof YouTubeShortsStoryArchitectureSchema
>;
export type YouTubeShortsStoryArchitectureModel = z.infer<
  typeof YouTubeShortsStoryArchitectureModelSchema
>;
export type StoryboardPhraseSources = {
  tension?: string;
  desiredTakeaway?: string;
  decisionQuestion?: string;
  premise?: string;
  whyItMatters?: string;
  opportunity?: string;
  supportingInsights?: string[];
  evidenceQuotes?: string[];
};
export type YouTubeShortsSituationLock = z.infer<
  typeof YouTubeShortsSituationLockSchema
>;
export type YouTubeShortsSituationLockModel = z.infer<
  typeof YouTubeShortsSituationLockModelSchema
>;
export type YouTubeShortsStoryboardScene = z.infer<
  typeof YouTubeShortsStoryboardSceneSchema
>;
export type YouTubeShortsStoryboardSceneModel = z.infer<
  typeof YouTubeShortsStoryboardSceneModelSchema
>;

/** UI display name for a "short name — definition" storyRole. */
export function storyRoleDisplayName(storyRole: string): string {
  return storyRole.split("—")[0]?.trim() || storyRole;
}

export function openSituationLock(
  requiredSubjects: string[] = ["the beat's required subject"],
): YouTubeShortsSituationLock {
  return {
    eventMode: "physical_comparison",
    requiredSubjects,
    visibleActionOrState: "hold the beat's unresolved comparison",
    relationship: "the decision remains unresolved",
    locationConstraint: SITUATION_LOCK_OPEN,
    humanPresenceConstraint: "open",
  };
}
export type YouTubeShortsStoryboard = z.infer<
  typeof YouTubeShortsStoryboardSchema
>;
export type YouTubeShortsStoryboardModel = z.infer<
  typeof YouTubeShortsStoryboardModelSchema
>;

export {
  countNarrationSentences,
  countNarrationWords,
  firstCopiedSourcePhrase,
  isOrdinalChecklistJob,
  NARRATION_MAX_SENTENCES,
  NARRATION_MAX_WORDS,
  narrationCopiesSourcePhrase,
  validateStoryboardSemantics,
  validateStoryboardShape,
} from "@/features/social-media/youtube-shorts/schemas/yss/semantics";

export function validateGeneratedStoryboard(
  board: YouTubeShortsStoryboard,
  phrases?: StoryboardPhraseSources,
): string[] {
  return [
    ...validateStoryboardShape(board),
    ...validateStoryboardSemantics(board, phrases),
  ];
}
