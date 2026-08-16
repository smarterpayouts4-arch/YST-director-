"use client";

import { useEffect, useState } from "react";
import type { StoryboardScenePatch } from "@/features/social-media/youtube-shorts/contracts/storyboard-lifecycle";
import type { YouTubeShortsStoryboardScene } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-storyboard";

const mapInputClass =
  "w-full rounded-md border border-stone-200 bg-white px-1.5 py-1 text-xs text-stone-900";

/**
 * Overlay drawer for Story Map scan. Draft may toggle Edit Story for
 * Role / Purpose / Narration. Patches go through the same working board
 * the inspector already uses — no local scene copy.
 */
export function StoryboardFullStory({
  scenes,
  open,
  onClose,
  editable = false,
  onPatchScene,
  onSelectScene,
}: {
  scenes: YouTubeShortsStoryboardScene[];
  open: boolean;
  onClose: () => void;
  editable?: boolean;
  onPatchScene?: (sceneNumber: number, patch: StoryboardScenePatch) => void;
  onSelectScene?: (sceneNumber: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const canEdit = Boolean(editable && onPatchScene);

  useEffect(() => {
    if (!open) {
      setEditing(false);
    }
  }, [open]);

  useEffect(() => {
    if (!canEdit) {
      setEditing(false);
    }
  }, [canEdit]);

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
        className="relative z-10 flex h-full w-full max-w-2xl flex-col border-l border-stone-200 bg-white shadow-xl"
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
              Scenes 1–7 · {editing ? "editable" : "read-only"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canEdit ? (
              <button
                type="button"
                onClick={() => setEditing((current) => !current)}
                className="rounded-md border border-stone-300 px-2.5 py-1 text-xs font-medium text-stone-800"
              >
                {editing ? "Done" : "Edit Story"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-stone-300 px-2.5 py-1 text-xs font-medium text-stone-800"
            >
              Close
            </button>
          </div>
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
              data-story-map-scene={scene.sceneNumber}
              className="grid cursor-pointer grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,1.4fr)] gap-2 border-b border-stone-100 pb-3 last:border-b-0"
              onClick={() => onSelectScene?.(scene.sceneNumber)}
            >
              <div>
                <p className="text-xs font-semibold text-stone-900">
                  {scene.sceneNumber}
                </p>
                {editing && onPatchScene ? (
                  <input
                    className={`${mapInputClass} mt-0.5`}
                    value={scene.storyRole}
                    maxLength={240}
                    aria-label={`Scene ${scene.sceneNumber} role`}
                    data-story-map-field="storyRole"
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) =>
                      onPatchScene(scene.sceneNumber, {
                        storyRole: event.target.value,
                      })
                    }
                  />
                ) : scene.storyRole ? (
                  <p className="mt-0.5 text-[11px] leading-snug text-stone-500">
                    {scene.storyRole}
                  </p>
                ) : null}
              </div>
              {editing && onPatchScene ? (
                <textarea
                  className={mapInputClass}
                  rows={3}
                  value={scene.purpose}
                  maxLength={400}
                  aria-label={`Scene ${scene.sceneNumber} purpose`}
                  data-story-map-field="purpose"
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) =>
                    onPatchScene(scene.sceneNumber, {
                      purpose: event.target.value,
                    })
                  }
                />
              ) : (
                <p className="text-xs leading-snug text-stone-700">
                  {scene.purpose}
                </p>
              )}
              {editing && onPatchScene ? (
                <textarea
                  className={mapInputClass}
                  rows={3}
                  value={scene.narration}
                  maxLength={800}
                  aria-label={`Scene ${scene.sceneNumber} narration`}
                  data-story-map-field="narration"
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) =>
                    onPatchScene(scene.sceneNumber, {
                      narration: event.target.value,
                    })
                  }
                />
              ) : (
                <p className="text-sm leading-snug text-stone-900">
                  {scene.narration}
                </p>
              )}
            </article>
          ))}
        </div>
      </aside>
    </div>
  );
}
