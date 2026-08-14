/**
 * Presentation-only journey step IDs.
 * Match AppStage (01–05) and CI rail keys (06–08). Not used for workflow transitions.
 */
export type JourneyStepId =
  | "ingestion"
  | "understanding"
  | "interview"
  | "brief"
  | "prompt"
  | "librarian"
  | "topics"
  | "atom";

export type JourneyStep = {
  step: number;
  id: JourneyStepId;
  customerLabel: string;
  summary: string;
  expandedDescription: string;
  /** Optional one-line meta under expanded description (ingestion only). */
  meta?: string;
};

/**
 * Customer-facing 8-step journey (Option B labels + copy).
 * Do not use for workflow transitions — presentation only.
 */
export const JOURNEY_STEPS: readonly JourneyStep[] = [
  {
    step: 1,
    id: "ingestion",
    customerLabel: "Start With What You Know",
    summary:
      "Start by bringing in the information everything else will build from.",
    expandedDescription:
      "Bring in your company information — this is the foundation for everything that follows.",
    meta: "Supported: CSV · max 5 MB",
  },
  {
    step: 2,
    id: "understanding",
    customerLabel: "See What We See",
    summary:
      "Review what we understood so you can confirm we are looking at the business correctly.",
    expandedDescription:
      "Review what we understood and correct anything that needs attention.",
  },
  {
    step: 3,
    id: "interview",
    customerLabel: "Find Your Focus",
    summary:
      "Narrow the direction so the research concentrates on what matters most.",
    expandedDescription:
      "Answer the questions that narrow the research to the strongest opportunities.",
  },
  {
    step: 4,
    id: "brief",
    customerLabel: "Shape the Plan",
    summary:
      "Turn that direction into a clear research plan before work begins.",
    expandedDescription:
      "Review how the opportunity will be investigated before the assignment is created.",
  },
  {
    step: 5,
    id: "prompt",
    customerLabel: "Start the Research",
    summary:
      "Send the research assignment to ChatGPT and bring the completed research back.",
    expandedDescription:
      "Take the research assignment to ChatGPT and bring the completed research back.",
  },
  {
    step: 6,
    id: "librarian",
    customerLabel: "See What We Found",
    summary:
      "Review the findings and evidence uncovered by the completed research.",
    expandedDescription:
      "Review the findings and evidence surfaced from the completed research.",
  },
  {
    step: 7,
    id: "topics",
    customerLabel: "Make Your Choice",
    summary: "Choose the direction and topic worth taking forward.",
    expandedDescription:
      "Choose your direction, then lock the topic you want to take forward.",
  },
  {
    step: 8,
    id: "atom",
    customerLabel: "Ready to Create",
    summary: "Export your topic packet and hand it to the next channel workflow.",
    expandedDescription:
      "Your selected topic is packaged as a governed handoff — export it, then continue when channel tools unlock.",
  },
] as const;

export function journeyStepById(id: JourneyStepId): JourneyStep {
  const found = JOURNEY_STEPS.find((s) => s.id === id);
  if (!found) {
    throw new Error(`Unknown journey step id: ${id}`);
  }
  return found;
}
