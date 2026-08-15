import { SHORTS_PRODUCTION_PROMPT_VERSION } from "@/features/social-media/youtube-shorts/prompts/prompt-version";
import { SHORTS_PRODUCTION_EXPANSION_DOCTRINE } from "@/features/social-media/youtube-shorts/prompts/production-expansion-doctrine";
import {
  SHORTS_STORYBOARD_PERSONA,
  wrapUntrustedJson,
} from "@/features/social-media/youtube-shorts/prompts/shared-guardrails";
import type { YouTubeShortsProjection } from "@/features/social-media/youtube-shorts/contracts/project-topic-packet";
import type { YouTubeShortsStoryboard } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-storyboard";

export function buildExpandProductionPrompt(input: {
  projection: YouTubeShortsProjection;
  approvedStoryboard: YouTubeShortsStoryboard;
}): { instructions: string; input: string; promptVersion: string } {
  const boardForModel = {
    estimatedTotalSeconds: input.approvedStoryboard.estimatedTotalSeconds,
    scenes: input.approvedStoryboard.scenes.map((scene) => ({
      sceneNumber: scene.sceneNumber,
      storyRole: scene.storyRole,
      purpose: scene.purpose,
      sceneDescription: scene.sceneDescription,
      durationTargetSeconds: scene.durationTargetSeconds,
      // narration + onScreenText intentionally omitted from LLM input/output
    })),
  };

  const instructions = [
    SHORTS_STORYBOARD_PERSONA,
    `Prompt version: ${SHORTS_PRODUCTION_PROMPT_VERSION}`,
    "",
    "Task: Expand ONE approved seven-scene storyboard into ONE production board with projectVisualContinuity, optional CHARACTER* profile, and EXACTLY 7 scene packages.",
    "Return only structured production output. Do not expose chain-of-thought.",
    SHORTS_PRODUCTION_EXPANSION_DOCTRINE,
    "",
    "Output fields:",
    "- projectVisualContinuity (required)",
    "- characterName / characterIdentity / characterContinuity (optional; all three together when recurring talent exists)",
    "- scenes[7]: sceneNumber, visualPrompt, voiceDirection, assetType (image|video), motionPrompt, continuityDelta",
    "Do NOT output narration or onScreenText. Those remain on the approved storyboard.",
    "Do NOT invent Atom claims. Do NOT emit reserved paste headers inside field bodies.",
  ].join("\n");

  return {
    instructions,
    input: [
      wrapUntrustedJson("YOUTUBE_SHORTS_ATOM_PROJECTION", input.projection),
      "",
      wrapUntrustedJson(
        "YOUTUBE_SHORTS_APPROVED_STORYBOARD",
        boardForModel,
      ),
    ].join("\n"),
    promptVersion: SHORTS_PRODUCTION_PROMPT_VERSION,
  };
}
