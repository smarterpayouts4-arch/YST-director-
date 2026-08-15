"use client";

import { StoryboardSceneCard } from "@/features/social-media/youtube-shorts/components/storyboard-scene-card";
import type { YouTubeShortsStoryboardScene } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-storyboard";

export function StoryboardSceneStrip({
  scenes,
  selectedSceneNumber,
  onSelect,
  summaryLabel = "STORYBOARD SUMMARY",
}: {
  scenes: YouTubeShortsStoryboardScene[];
  selectedSceneNumber: number;
  onSelect: (sceneNumber: number) => void;
  summaryLabel?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">
        {summaryLabel}
      </p>
      <div
        className="flex w-full items-start gap-4 sm:gap-5"
        role="listbox"
        aria-label="Seven-scene contact sheet"
      >
        {scenes.map((scene) => (
          <StoryboardSceneCard
            key={scene.sceneNumber}
            scene={scene}
            selected={scene.sceneNumber === selectedSceneNumber}
            onSelect={() => onSelect(scene.sceneNumber)}
          />
        ))}
      </div>
    </div>
  );
}
