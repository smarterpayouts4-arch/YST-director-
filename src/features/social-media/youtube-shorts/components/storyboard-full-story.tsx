"use client";

import { useEffect } from "react";
import type { YouTubeShortsStoryboardScene } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-storyboard";

/**
 * Overlay drawer for read-only Story Map scan. Does not change page height.
 * Renders the same scenes array the review experience already selected.
 */
export function StoryboardFullStory({
  scenes,
  open,
  onClose,
}: {
  scenes: YouTubeShortsStoryboardScene[];
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        aria-label="Close story map"
        className="absolute inset-0 bg-stone-900/30"
        onClick={onClose}
      />
      <aside
        className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-stone-200 bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label="Story map"
        data-story-map-drawer="true"
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Story map
            </p>
            <p className="text-sm font-medium text-stone-900">
              Scenes 1–7 · read-only
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-stone-300 px-2.5 py-1 text-xs font-medium text-stone-800"
          >
            Close
          </button>
        </div>
        <div className="border-b border-stone-100 px-4 py-2">
          <div className="grid grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,1.4fr)] gap-2 text-[10px] font-bold uppercase tracking-wider text-stone-500">
            <span>Scene</span>
            <span>Job</span>
            <span>Simple story beat</span>
          </div>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {scenes.map((scene) => (
            <article
              key={scene.sceneNumber}
              className="grid grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,1.4fr)] gap-2 border-b border-stone-100 pb-3 last:border-b-0"
            >
              <div>
                <p className="text-xs font-semibold text-stone-900">
                  {scene.sceneNumber}
                </p>
                {scene.storyRole ? (
                  <p className="mt-0.5 text-[11px] leading-snug text-stone-500">
                    {scene.storyRole}
                  </p>
                ) : null}
              </div>
              <p className="text-xs leading-snug text-stone-700">
                {scene.purpose}
              </p>
              <p className="text-sm leading-snug text-stone-900">
                {scene.narration}
              </p>
            </article>
          ))}
        </div>
      </aside>
    </div>
  );
}
