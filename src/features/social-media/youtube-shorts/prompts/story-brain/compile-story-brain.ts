import { compilePromptSections } from "@/features/social-media/youtube-shorts/prompts/compile-sections";
import { STORY_AUTHORITY, STORY_MISSION } from "./mission-authority";
import { STORY_OPERATING_SEQUENCE } from "./operating-sequence";
import { STORY_ARCHITECTURE } from "./story-architecture";
import { STORY_HOOK } from "./hook";
import { STORY_SITUATION_LOCK } from "./situation-lock";
import { STORY_SCENE_REALIZATION } from "./scene-realization";
import { STORY_SPOKEN_LANGUAGE } from "./spoken-language";
import { STORY_PROGRESSION_AND_PAYOFF } from "./progression-payoff";
import {
  STORY_FINAL_SELF_CHECK,
  STORY_GUARDRAILS,
} from "./guardrails-final-check";

export const STORY_BRAIN_SECTION_ORDER = [
  "MISSION",
  "AUTHORITY",
  "OPERATING SEQUENCE",
  "STORY ARCHITECTURE",
  "HOOK",
  "SITUATION LOCK",
  "SCENE REALIZATION",
  "SPOKEN LANGUAGE",
  "PROGRESSION AND PAYOFF",
  "GUARDRAILS",
  "FINAL SELF-CHECK",
] as const;

export const STORY_BRAIN_MODULES = {
  mission: STORY_MISSION,
  authority: STORY_AUTHORITY,
  operatingSequence: STORY_OPERATING_SEQUENCE,
  storyArchitecture: STORY_ARCHITECTURE,
  hook: STORY_HOOK,
  situationLock: STORY_SITUATION_LOCK,
  sceneRealization: STORY_SCENE_REALIZATION,
  spokenLanguage: STORY_SPOKEN_LANGUAGE,
  progressionPayoff: STORY_PROGRESSION_AND_PAYOFF,
  guardrails: STORY_GUARDRAILS,
  finalSelfCheck: STORY_FINAL_SELF_CHECK,
} as const;

const STORY_BRAIN_SECTIONS = [
  { heading: "MISSION", body: STORY_MISSION },
  { heading: "AUTHORITY", body: STORY_AUTHORITY },
  { heading: "OPERATING SEQUENCE", body: STORY_OPERATING_SEQUENCE },
  { heading: "STORY ARCHITECTURE", body: STORY_ARCHITECTURE },
  { heading: "HOOK", body: STORY_HOOK },
  { heading: "SITUATION LOCK", body: STORY_SITUATION_LOCK },
  { heading: "SCENE REALIZATION", body: STORY_SCENE_REALIZATION },
  { heading: "SPOKEN LANGUAGE", body: STORY_SPOKEN_LANGUAGE },
  { heading: "PROGRESSION AND PAYOFF", body: STORY_PROGRESSION_AND_PAYOFF },
  { heading: "GUARDRAILS", body: STORY_GUARDRAILS },
  { heading: "FINAL SELF-CHECK", body: STORY_FINAL_SELF_CHECK },
] as const;

export function compileStoryBrain(): string {
  return compilePromptSections(STORY_BRAIN_SECTIONS);
}

export function compileStoryBrainRepair(): string {
  return compilePromptSections([
    { heading: "AUTHORITY", body: STORY_AUTHORITY },
    { heading: "SITUATION LOCK", body: STORY_SITUATION_LOCK },
    { heading: "SCENE REALIZATION", body: STORY_SCENE_REALIZATION },
    { heading: "SPOKEN LANGUAGE", body: STORY_SPOKEN_LANGUAGE },
    { heading: "GUARDRAILS", body: STORY_GUARDRAILS },
    { heading: "FINAL SELF-CHECK", body: STORY_FINAL_SELF_CHECK },
  ]);
}

export const SHORTS_STORY_BRAIN = compileStoryBrain();
