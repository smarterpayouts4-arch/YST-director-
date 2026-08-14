import { journeyStepById, type JourneyStepId } from "@/features/research-prompt-builder/config/journey-steps";

/**
 * Durable chapter lifecycle for future shells (Social Media today).
 * Settled Topic Packet uses upcoming + emphasizedNext — not current.
 * Channel surfaces (hub / Shorts) pass channelActive → current.
 */
export type ChapterLifecycle = "upcoming" | "current" | "complete";

export type RailHeaderMode = "step" | "next-chapter" | "chapter";

export type RailPresentation = {
  headerMode: RailHeaderMode;
  activeStep: number;
  foundationOpen: boolean;
  foundationComplete: boolean;
  researchOpen: boolean;
  researchComplete: boolean;
  socialMedia: {
    state: ChapterLifecycle;
    /** Emphasize as next chapter without becoming current. */
    emphasizedNext: boolean;
  };
};

/**
 * Pure chapter/header branching for JourneyRail.
 * Settlement = researchSettled with an active Research-or-later step — not Atom-by-name alone.
 * channelActive = Social Media hub or a live channel page (Current, no Next-chapter fluff).
 */
export function railPresentation({
  activeId,
  researchSettled = false,
  channelActive = false,
}: {
  activeId: JourneyStepId;
  researchSettled?: boolean;
  channelActive?: boolean;
}): RailPresentation {
  const active = journeyStepById(activeId);
  const activeStep = active.step;
  const foundationOpen = activeStep <= 5;
  const foundationComplete = activeStep >= 6;
  const researchOpen = activeStep >= 6 && !researchSettled && !channelActive;
  const researchComplete =
    (researchSettled || channelActive) && activeStep >= 6;

  if (channelActive) {
    return {
      headerMode: "chapter",
      activeStep,
      foundationOpen: false,
      foundationComplete: true,
      researchOpen: false,
      researchComplete: true,
      socialMedia: {
        state: "current",
        emphasizedNext: false,
      },
    };
  }

  return {
    headerMode: researchComplete ? "next-chapter" : "step",
    activeStep,
    foundationOpen,
    foundationComplete,
    researchOpen,
    researchComplete,
    socialMedia: {
      // current only when channelActive (hub / Shorts)
      state: "upcoming",
      emphasizedNext: researchComplete,
    },
  };
}
