import { compilePromptSections } from "@/features/social-media/youtube-shorts/prompts/compile-sections";
import { PRODUCTION_MISSION } from "./mission";
import { PRODUCTION_AUTHORITY } from "./authority";
import { PRODUCTION_SITUATION_FIDELITY } from "./situation-fidelity";
import { PRODUCTION_EMBODIMENT } from "./embodiment";
import { PRODUCTION_INFORMATION_CRAFT } from "./information-craft";
import { PRODUCTION_PORTRAIT_FRAME } from "./portrait-composition";
import { PRODUCTION_STILL_MOTION } from "./still-motion";
import { PRODUCTION_VISUAL_FINISH } from "./visual-finish";
import { PRODUCTION_STORY_TO_PLATE } from "./staging";
import { PRODUCTION_CONTINUITY } from "./continuity";
import { PRODUCTION_FIELD_RULES } from "./field-rules";
import { PRODUCTION_SEVEN_SCENE_COHERENCE } from "./seven-scene-coherence";

export const PRODUCTION_BRAIN_SECTION_ORDER = [
  "MISSION",
  "AUTHORITY",
  "SITUATION FIDELITY",
  "EMBODIMENT OVER EXPLANATION",
  "INFORMATION CRAFT",
  "PORTRAIT FRAME",
  "STILL vs MOTION",
  "VISUAL FINISH",
  "STORY-TO-PLATE",
  "WHOLE-SHORT VISUAL CONTINUITY",
  "FIELD RULES",
  "SEVEN-SCENE COHERENCE",
] as const;

export const PRODUCTION_BRAIN_MODULES = {
  mission: PRODUCTION_MISSION,
  authority: PRODUCTION_AUTHORITY,
  situationFidelity: PRODUCTION_SITUATION_FIDELITY,
  embodiment: PRODUCTION_EMBODIMENT,
  informationCraft: PRODUCTION_INFORMATION_CRAFT,
  portraitFrame: PRODUCTION_PORTRAIT_FRAME,
  stillMotion: PRODUCTION_STILL_MOTION,
  visualFinish: PRODUCTION_VISUAL_FINISH,
  storyToPlate: PRODUCTION_STORY_TO_PLATE,
  continuity: PRODUCTION_CONTINUITY,
  fieldRules: PRODUCTION_FIELD_RULES,
  sevenSceneCoherence: PRODUCTION_SEVEN_SCENE_COHERENCE,
} as const;

const PRODUCTION_BRAIN_SECTIONS = [
  { heading: "MISSION", body: PRODUCTION_MISSION },
  { heading: "AUTHORITY", body: PRODUCTION_AUTHORITY },
  { heading: "SITUATION FIDELITY", body: PRODUCTION_SITUATION_FIDELITY },
  { heading: "EMBODIMENT OVER EXPLANATION", body: PRODUCTION_EMBODIMENT },
  { heading: "INFORMATION CRAFT", body: PRODUCTION_INFORMATION_CRAFT },
  { heading: "PORTRAIT FRAME", body: PRODUCTION_PORTRAIT_FRAME },
  { heading: "STILL vs MOTION", body: PRODUCTION_STILL_MOTION },
  { heading: "VISUAL FINISH", body: PRODUCTION_VISUAL_FINISH },
  { heading: "STORY-TO-PLATE", body: PRODUCTION_STORY_TO_PLATE },
  { heading: "WHOLE-SHORT VISUAL CONTINUITY", body: PRODUCTION_CONTINUITY },
  { heading: "FIELD RULES", body: PRODUCTION_FIELD_RULES },
  { heading: "SEVEN-SCENE COHERENCE", body: PRODUCTION_SEVEN_SCENE_COHERENCE },
] as const;

export function compileProductionBrain(): string {
  return compilePromptSections(PRODUCTION_BRAIN_SECTIONS);
}

export const SHORTS_PRODUCTION_EXPANSION_DOCTRINE = compileProductionBrain();
