"use client";

import { useEffect, useState } from "react";
import { StoryboardFullStory } from "@/features/social-media/youtube-shorts/components/storyboard-full-story";
import { StoryboardSceneEditor } from "@/features/social-media/youtube-shorts/components/storyboard-scene-editor";
import { StoryboardSceneStrip } from "@/features/social-media/youtube-shorts/components/storyboard-scene-strip";
import { YouTubeShortsReadyView } from "@/features/social-media/youtube-shorts/components/youtube-shorts-ready-view";
import {
  orderedProductionScenes,
  orderedStoryboardScenes,
  updateWorkingProductionScene,
  updateWorkingScene,
  workingDiffersFromGenerated,
  type ProductionScenePatch,
  type StoryboardScenePatch,
} from "@/features/social-media/youtube-shorts/contracts/storyboard-lifecycle";
import type { YouTubeShortsSession } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-session";
import type { YouTubeShortsProduction } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-production";
import type { YouTubeShortsStoryboard } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-storyboard";

export function YouTubeShortsStoryboardReview({
  session,
  busy,
  onGenerate,
  onExpand,
  onChangeWorking,
  onChangeWorkingProduction,
  onApprove,
  onReopen,
}: {
  session: YouTubeShortsSession;
  busy: boolean;
  onGenerate: () => void;
  onExpand: () => void;
  onChangeWorking: (board: YouTubeShortsStoryboard) => void;
  onChangeWorkingProduction: (board: YouTubeShortsProduction) => void;
  onApprove: () => void;
  onReopen: () => void;
}) {
  const approved = session.stage === "storyboard_approved";
  const board = approved
    ? session.approvedStoryboard
    : session.workingStoryboard;
  const production = session.workingProduction ?? null;
  const hasDraft = Boolean(session.workingStoryboard);
  const hasProduction = Boolean(production);
  const replaceWarn = workingDiffersFromGenerated(session);
  const scenes = board ? orderedStoryboardScenes(board) : [];
  const productionScenes = production
    ? orderedProductionScenes(production)
    : [];
  /** Changes on every successful Expand/Re-expand — never use promptVersion. */
  const productionGeneratedAt = session.productionGeneratedAt ?? null;
  const [selectedSceneNumber, setSelectedSceneNumber] = useState(1);
  const [productionFocusKey, setProductionFocusKey] = useState<string | null>(
    null,
  );
  const [storyMapOpen, setStoryMapOpen] = useState(false);

  // UI focus only: new productionGeneratedAt → Scene 1 + Visual Prompt.
  // Hydration may also present an existing timestamp (restore UI default);
  // that is not a generation event — expand is never called here.
  useEffect(() => {
    if (!productionGeneratedAt || !production) {
      setProductionFocusKey(null);
      return;
    }
    setSelectedSceneNumber(1);
    setProductionFocusKey(productionGeneratedAt);
  }, [productionGeneratedAt, production]);
  const selected =
    scenes.find((scene) => scene.sceneNumber === selectedSceneNumber) ??
    scenes[0];
  const selectedProduction =
    productionScenes.find(
      (scene) => scene.sceneNumber === selected?.sceneNumber,
    ) ?? null;
  const selectedIndex = selected
    ? scenes.findIndex((scene) => scene.sceneNumber === selected.sceneNumber)
    : -1;

  const patchScene = (sceneNumber: number, patch: StoryboardScenePatch) => {
    if (!board || approved) return;
    onChangeWorking(updateWorkingScene(board, sceneNumber, patch));
  };

  const patchSelected = (patch: StoryboardScenePatch) => {
    if (!selected) return;
    patchScene(selected.sceneNumber, patch);
  };

  const patchSelectedProduction = (patch: ProductionScenePatch) => {
    if (!production || !selected || !approved) return;
    onChangeWorkingProduction(
      updateWorkingProductionScene(production, selected.sceneNumber, patch),
    );
  };

  const openStoryMap = () => setStoryMapOpen(true);

  return (
    <section className="space-y-3">
      <YouTubeShortsReadyView
        packet={session.ingestedAtom}
        stage={session.stage}
        sceneCount={scenes.length || 7}
        estimatedTotalSeconds={board?.estimatedTotalSeconds ?? null}
        hasStoryboard={Boolean(board)}
        edited={replaceWarn}
        onViewFullStory={board ? openStoryMap : undefined}
      />

      {!hasDraft ? (
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-stone-700">
            Generate one seven-scene story from this Atom. Nothing runs until
            you ask.
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={onGenerate}
            className="mt-3 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {busy ? "Generating…" : "Generate Storyboard"}
          </button>
        </div>
      ) : null}

      {board && selected ? (
        <div className="space-y-3">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_11rem]">
            <StoryboardSceneStrip
              scenes={scenes}
              selectedSceneNumber={selected.sceneNumber}
              onSelect={setSelectedSceneNumber}
              summaryLabel={
                approved
                  ? "APPROVED STORYBOARD SUMMARY"
                  : "STORYBOARD SUMMARY"
              }
            />

            <aside className="h-fit space-y-3 rounded-xl border border-stone-200 bg-white p-3 shadow-sm lg:sticky lg:top-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Actions
                </p>
                <p className="mt-1 text-xs text-stone-600">
                  {scenes.length} scenes · ~{board.estimatedTotalSeconds}s
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={openStoryMap}
                  className="rounded-lg border border-stone-300 px-3 py-1.5 text-left text-sm font-medium text-stone-800"
                >
                  View Story Map
                </button>
                {approved ? (
                  <>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={onExpand}
                      className="rounded-lg bg-stone-900 px-3 py-1.5 text-left text-sm font-medium text-white disabled:opacity-50"
                    >
                      {busy
                        ? "Expanding…"
                        : hasProduction
                          ? "Re-expand Production"
                          : "Expand Production"}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={onReopen}
                      className="rounded-lg border border-stone-300 px-3 py-1.5 text-left text-sm font-medium text-stone-800 disabled:opacity-50"
                    >
                      Reopen to edit
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={onGenerate}
                      className="rounded-lg border border-stone-300 px-3 py-1.5 text-left text-sm font-medium text-stone-800 disabled:opacity-50"
                    >
                      {busy
                        ? "Generating…"
                        : replaceWarn
                          ? "Regenerate Storyboard (replaces edits)"
                          : "Regenerate Storyboard"}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={onApprove}
                      className="rounded-lg bg-stone-900 px-3 py-1.5 text-left text-sm font-medium text-white disabled:opacity-50"
                    >
                      Approve Storyboard
                    </button>
                  </>
                )}
              </div>
              <p className="text-[11px] leading-relaxed text-stone-500">
                {approved
                  ? hasProduction
                    ? "Need to change the story? Reopen to edit. This clears the current production so you can edit or regenerate the storyboard."
                    : "Approve is locked. Expand Production fills Visual / Motion / Voice / Asset / Continuity. Reopen to edit the story."
                  : "Regenerate Storyboard runs the current Shorts story brain and replaces the current draft."}
              </p>
            </aside>
          </div>

          <StoryboardSceneEditor
            scene={selected}
            productionScene={selectedProduction}
            production={production}
            productionFocusKey={productionFocusKey}
            approved={approved}
            disabled={busy}
            onChange={patchSelected}
            onChangeProduction={patchSelectedProduction}
            canPrevious={selectedIndex > 0}
            canNext={selectedIndex >= 0 && selectedIndex < scenes.length - 1}
            onPrevious={() => {
              const prev = scenes[selectedIndex - 1];
              if (prev) setSelectedSceneNumber(prev.sceneNumber);
            }}
            onNext={() => {
              const next = scenes[selectedIndex + 1];
              if (next) setSelectedSceneNumber(next.sceneNumber);
            }}
          />
        </div>
      ) : null}

      <StoryboardFullStory
        scenes={scenes}
        open={storyMapOpen}
        onClose={() => setStoryMapOpen(false)}
        editable={!approved && !busy}
        onPatchScene={patchScene}
        onSelectScene={setSelectedSceneNumber}
      />
    </section>
  );
}
