import { SHORTS_RUNTIME_PROMPT_VERSION } from "@/features/social-media/youtube-shorts/prompts/prompt-version";
import {
  OUTPUT_BANS,
  SHORTS_STORYBOARD_PERSONA,
  wrapUntrustedJson,
} from "@/features/social-media/youtube-shorts/prompts/shared-guardrails";
import { SHORTS_STORY_BRAIN } from "@/features/social-media/youtube-shorts/prompts/story-brain";
import type { YouTubeShortsProjection } from "@/features/social-media/youtube-shorts/contracts/project-topic-packet";

export function buildGenerateStoryboardPrompt(input: {
  projection: YouTubeShortsProjection;
}): { instructions: string; input: string; promptVersion: string } {
  const instructions = [
    SHORTS_STORYBOARD_PERSONA,
    `Prompt version: ${SHORTS_RUNTIME_PROMPT_VERSION}`,
    "",
    "Task: Produce ONE YouTube Short storyboard: first lock storyArchitecture (including hookWhy and beats[].because), then write EXACTLY 7 connected spoken scenes that obey it.",
    "Do not expose chain-of-thought. Return only the structured storyboard. Fill storyArchitecture before scenes.",
    SHORTS_STORY_BRAIN,
    OUTPUT_BANS,
    "",
    "Output storyArchitecture first, then estimatedTotalSeconds, then scenes.",
    "Output fields per scene: sceneNumber (1–7), storyRole (short flexible string, not a fixed enum), purpose, narration, sceneDescription, onScreenText, durationTargetSeconds (about 7; 5–10 allowed).",
    "estimatedTotalSeconds for the whole Short (about 49; 35–70 allowed).",
    "storyRole may be any useful short label. Do not force a Line of Discovery enum.",
    "purpose for each scene must match that scene’s storyArchitecture.beats job.",
  ].join("\n");

  return {
    instructions,
    input: wrapUntrustedJson("YOUTUBE_SHORTS_ATOM_PROJECTION", input.projection),
    promptVersion: SHORTS_RUNTIME_PROMPT_VERSION,
  };
}
