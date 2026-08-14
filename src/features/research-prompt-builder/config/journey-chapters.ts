import type { JourneyStepId } from "@/features/research-prompt-builder/config/journey-steps";

/**
 * Presentation-only journey chapters.
 * Groups steps for the sidebar; not used for workflow transitions.
 */
export type JourneyChapterId = "foundation" | "research" | "social-media";

export type JourneyChapter = {
  id: JourneyChapterId;
  label: string;
  description: string;
  stepIds: readonly JourneyStepId[];
  completionTitle: string;
  /** Single compact body under the completion title. */
  completionSummary: string;
  kind: "steps" | "future";
};

export const JOURNEY_CHAPTERS: readonly JourneyChapter[] = [
  {
    id: "foundation",
    label: "Foundation",
    description: "Set the direction before research begins.",
    stepIds: [
      "ingestion",
      "understanding",
      "interview",
      "brief",
      "prompt",
    ],
    completionTitle: "Foundation complete",
    completionSummary: "Steps 1–5 · Direction and research setup complete.",
    kind: "steps",
  },
  {
    id: "research",
    label: "Research",
    description: "Turn findings into a locked topic packet.",
    stepIds: ["librarian", "topics", "atom"],
    completionTitle: "Research complete",
    completionSummary: "Steps 6–8 · Findings reviewed and topic selected.",
    kind: "steps",
  },
  {
    id: "social-media",
    label: "Social Media",
    description: "Choose a channel — each owns its creative brain.",
    stepIds: [],
    completionTitle: "Social Media complete",
    completionSummary: "",
    kind: "future",
  },
] as const;

export function journeyChapterById(id: JourneyChapterId): JourneyChapter {
  const found = JOURNEY_CHAPTERS.find((c) => c.id === id);
  if (!found) {
    throw new Error(`Unknown journey chapter id: ${id}`);
  }
  return found;
}

/** Chapter that owns the active step (steps 1–8). Future shells are never "owning". */
export function chapterForStepId(stepId: JourneyStepId): JourneyChapter {
  const found = JOURNEY_CHAPTERS.find(
    (c) => c.kind === "steps" && c.stepIds.includes(stepId),
  );
  if (!found) {
    throw new Error(`No chapter owns step id: ${stepId}`);
  }
  return found;
}
