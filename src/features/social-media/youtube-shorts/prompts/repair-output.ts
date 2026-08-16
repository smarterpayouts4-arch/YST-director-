import type { AiSchemaName } from "@/ai/operations/schema-names";
import {
  SHORTS_PRODUCTION_PROMPT_VERSION,
  SHORTS_RUNTIME_PROMPT_VERSION,
} from "@/features/social-media/youtube-shorts/prompts/prompt-version";
import { SHORTS_PRODUCTION_EXPANSION_DOCTRINE } from "@/features/social-media/youtube-shorts/prompts/production-expansion-doctrine";
import { OUTPUT_BANS, wrapUntrustedJson } from "@/features/social-media/youtube-shorts/prompts/shared-guardrails";
import { compileStoryBrainRepair } from "@/features/social-media/youtube-shorts/prompts/story-brain";

export type ShortsRepairContext = {
  projection?: unknown;
  approvedStoryboard?: unknown;
};

function isRepairContext(value: unknown): value is ShortsRepairContext {
  return typeof value === "object" && value !== null;
}

function buildRepairInput(input: {
  schemaName: AiSchemaName;
  validationErrors: string[];
  previousOutput: unknown;
  context?: unknown;
}): string {
  const parts = [
    JSON.stringify(
      {
        schemaName: input.schemaName,
        validationErrors: input.validationErrors,
        previousOutput: input.previousOutput,
      },
      null,
      2,
    ),
  ];
  const context = isRepairContext(input.context) ? input.context : undefined;
  if (context?.projection != null) {
    parts.push(
      "",
      wrapUntrustedJson("YOUTUBE_SHORTS_ATOM_PROJECTION", context.projection),
    );
  }
  if (context?.approvedStoryboard != null) {
    parts.push(
      "",
      wrapUntrustedJson(
        "YOUTUBE_SHORTS_APPROVED_STORYBOARD",
        context.approvedStoryboard,
      ),
    );
  }
  return parts.join("\n");
}

/** Shorts-owned repair — do not import TE, Librarian, or RPB repair. */
export function buildShortsRepairPrompt(input: {
  schemaName: AiSchemaName;
  validationErrors: string[];
  previousOutput: unknown;
  context?: unknown;
}): { instructions: string; input: string; promptVersion: string } {
  if (input.schemaName === "youtube_shorts_production") {
    return {
      instructions: [
        "Repair the previous youtube_shorts_production output so it passes schema and validation errors.",
        "You MUST return EXACTLY 7 scenes with sceneNumber 1 through 7 and no duplicates.",
        "Keep projectVisualContinuity. Keep optional CHARACTER* only if talent exists.",
        "Do NOT output narration, onScreenText, or sceneDescription.",
        "If assetType is video, motionPrompt must be non-empty. If image, motionPrompt must be empty.",
        "Obey the same STORY-TO-PLATE doctrine. Do not invent a second repair brain.",
        "Do not invent research or unsupported claims.",
        "Do not emit reserved paste headers inside field bodies.",
        SHORTS_PRODUCTION_EXPANSION_DOCTRINE,
        `Prompt version: ${SHORTS_PRODUCTION_PROMPT_VERSION}`,
      ].join("\n"),
      input: buildRepairInput(input),
      promptVersion: SHORTS_PRODUCTION_PROMPT_VERSION,
    };
  }

  return {
    instructions: [
      "Repair the previous youtube_shorts_storyboard output so it passes schema and validation errors.",
      "Change only the fields named in validationErrors; copy every other field verbatim from previousOutput.",
      "You MUST return storyArchitecture plus EXACTLY 7 scenes with sceneNumber 1 through 7 and no duplicates.",
      "Keep the locked story. Scenes must obey storyArchitecture (carrier, excludedCarriers, openingQuestion, payoff, hookWhy, beat jobs, beats[].because).",
      "Keep hookWhy. Keep nonempty because on beats 2–7. Keep spoken lock fields in spoken register. Narration must stay at most 2 sentences and 22 words. Translate Atom phrasing into spoken first-hearing language. Do not recopy tension, desiredTakeaway, decisionQuestion, or other Atom research phrasing into narration or onScreenText.",
      "If an error names a copied phrase and a from excerpt, rewrite only that field in spoken words. Do not reuse any 5 consecutive words from the excerpt. Keep the claim. Use the spoken rewrite pairs: keep the claim, drop the research sentence.",
      "If an error names a repeated phrase, rename that thing by what the viewer sees or does, in each listed scene only.",
      "Keep one coherent Short. Do not invent research or unsupported claims.",
      "Do not add imagePrompt, motionPrompt, visualPrompt, voiceDirection, assetType, camera, or production fields.",
      "storyRole remains a flexible string. Do not force a seven-role enum.",
      compileStoryBrainRepair(),
      OUTPUT_BANS,
      `Prompt version: ${SHORTS_RUNTIME_PROMPT_VERSION}`,
    ].join("\n"),
    input: buildRepairInput(input),
    promptVersion: SHORTS_RUNTIME_PROMPT_VERSION,
  };
}
