"use client";

import type { TopicPacket } from "@/features/content-intelligence/contracts/topic-packet";
import { projectTopicPacketToYouTubeShortsInput } from "@/features/social-media/youtube-shorts/contracts/project-topic-packet";
import type { YouTubeShortsStage } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-session";

/**
 * Shallow 3-column status card (reference band). Atom title lives here once —
 * not a separate giant Atom card.
 */
export function YouTubeShortsReadyView({
  packet,
  stage,
  sceneCount,
  estimatedTotalSeconds,
  hasStoryboard,
  edited = false,
  onViewFullStory,
}: {
  packet: TopicPacket;
  stage: YouTubeShortsStage;
  sceneCount: number;
  estimatedTotalSeconds: number | null;
  hasStoryboard: boolean;
  edited?: boolean;
  onViewFullStory?: () => void;
}) {
  const projection = projectTopicPacketToYouTubeShortsInput(packet);
  const approved = stage === "storyboard_approved";
  const statusLabel = approved
    ? "Storyboard Approved · Frozen"
    : hasStoryboard
      ? edited
        ? "Storyboard Draft · Edited"
        : "Storyboard Draft · Editable"
      : "Atom Received";

  return (
    <section className="rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-3 sm:divide-x sm:divide-stone-200">
        <div className="min-w-0 sm:pr-4">
          <div className="flex items-center gap-2">
            {approved ? (
              <span
                aria-hidden
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white"
              >
                ✓
              </span>
            ) : null}
            <p className="text-sm font-semibold text-stone-900">{statusLabel}</p>
          </div>
          <p className="mt-1 truncate text-xs text-stone-600" title={projection.title}>
            {projection.title}
          </p>
          {hasStoryboard && onViewFullStory ? (
            <button
              type="button"
              onClick={onViewFullStory}
              className="mt-1 text-xs font-medium text-primary hover:opacity-90"
            >
              View Story Map
            </button>
          ) : null}
        </div>
        <div className="sm:px-4">
          <p className="editorial text-2xl leading-none text-stone-900">
            {hasStoryboard ? sceneCount : "—"}
          </p>
          <p className="mt-1 text-xs font-medium text-stone-800">Scenes</p>
          <p className="text-[11px] text-stone-500">
            {hasStoryboard ? "All scenes generated." : "Generate when ready."}
          </p>
        </div>
        <div className="sm:pl-4">
          <p className="editorial text-2xl leading-none text-stone-900">
            {estimatedTotalSeconds != null ? `~${estimatedTotalSeconds}` : "—"}
            {estimatedTotalSeconds != null ? (
              <span className="ml-1 text-sm font-normal text-stone-500">sec</span>
            ) : null}
          </p>
          <p className="mt-1 text-xs font-medium text-stone-800">Total duration</p>
          <p className="text-[11px] text-stone-500">
            {hasStoryboard ? `${sceneCount} scenes` : "Pending storyboard"}
          </p>
        </div>
      </div>
    </section>
  );
}
