"use client";

import type { YouTubeShortsStoryboardScene } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-storyboard";
import { cn } from "@/lib/utils";

function formatDuration(seconds: number): string {
  const whole = Math.round(seconds);
  return `0:${String(whole).padStart(2, "0")}`;
}

export function StoryboardSceneCard({
  scene,
  selected,
  onSelect,
}: {
  scene: YouTubeShortsStoryboardScene;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div className="min-w-0 flex-1 basis-0">
      <button
        type="button"
        aria-pressed={selected}
        aria-label={`Scene ${scene.sceneNumber}, ${scene.storyRole}`}
        data-scene-number={scene.sceneNumber}
        onClick={onSelect}
        className="w-full text-left"
      >
        <div className="relative aspect-[9/16] w-full">
          <div
            className={cn(
              "absolute inset-0 overflow-hidden rounded-md bg-stone-100",
              selected
                ? "ring-2 ring-stone-900 ring-offset-1"
                : "ring-1 ring-stone-200",
            )}
          >
            <span className="absolute left-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-700 text-[9px] font-bold text-white">
              {scene.sceneNumber}
            </span>
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-1 text-center">
              <span className="text-[10px] font-medium uppercase tracking-wide text-stone-400">
                Preview
              </span>
              <span className="text-[9px] text-stone-400">pending</span>
            </span>
            <span className="absolute bottom-1.5 right-1.5 rounded bg-black/65 px-1.5 py-0.5 text-[9px] font-medium leading-none text-white">
              {formatDuration(scene.durationTargetSeconds)}
            </span>
          </div>
        </div>
        <p className="mt-2 truncate text-center text-[11px] font-semibold text-stone-900">
          {scene.storyRole}
        </p>
      </button>
    </div>
  );
}
