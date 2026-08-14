"use client";

import { JourneyRail } from "@/features/research-prompt-builder/components/journey-rail";
import type { JourneyStepId } from "@/features/research-prompt-builder/config/journey-steps";

export type ContentIntelligenceRailStep = "librarian" | "topics" | "atom";

/**
 * CI stages 06–08. Presentation via shared JourneyRail.
 * Internal step keys remain librarian | topics | atom.
 *
 * Pass `researchSettled` when the Topic Packet is present so Research collapses
 * and Social Media becomes the next-chapter shell.
 */
export function ContentIntelligenceRail({
  activeStep = "librarian",
  researchSettled = false,
  socialMediaHref,
}: {
  activeStep?: ContentIntelligenceRailStep;
  researchSettled?: boolean;
  /** When Atom ids are known, append them so rail → hub preserves handoff. */
  socialMediaHref?: string;
}) {
  const activeId: JourneyStepId = activeStep;
  return (
    <JourneyRail
      activeId={activeId}
      researchSettled={researchSettled}
      socialMediaHref={socialMediaHref}
    />
  );
}
