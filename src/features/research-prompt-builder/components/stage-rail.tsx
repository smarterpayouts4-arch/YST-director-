"use client";

import { JourneyRail } from "@/features/research-prompt-builder/components/journey-rail";
import type { AppStage } from "@/features/research-prompt-builder/config/constants";

/**
 * RPB stages 01–05. Presentation via shared JourneyRail.
 * Internal AppStage IDs unchanged.
 */
export function StageRail({
  stage,
  questionProgress,
}: {
  stage: AppStage;
  questionProgress?: string;
}) {
  return <JourneyRail activeId={stage} detailLine={questionProgress} />;
}
