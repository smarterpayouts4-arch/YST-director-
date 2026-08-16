/**
 * Compact operational extract of the YouTube Shorts Story Brain.
 * Canonical thought: ../brain/*.md — do not runtime-import Reference/.
 * Runtime compile: ./story-brain/ (headed modules; this file is the facade).
 */
export {
  SHORTS_STORY_BRAIN,
  STORY_BRAIN_MODULES,
  STORY_BRAIN_SECTION_ORDER,
  compileStoryBrain,
  compileStoryBrainRepair,
} from "./story-brain/compile-story-brain";
