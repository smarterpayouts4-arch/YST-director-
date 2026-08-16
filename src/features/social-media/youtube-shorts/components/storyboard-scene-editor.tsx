"use client";

import { useEffect, useState, type ReactNode } from "react";
import type {
  ProductionScenePatch,
  StoryboardScenePatch,
} from "@/features/social-media/youtube-shorts/contracts/storyboard-lifecycle";
import {
  formatFullScenePaste,
  formatMotionPromptBody,
  formatSceneNotesPaste,
  formatVisualPromptBody,
} from "@/features/social-media/youtube-shorts/export/format-scene-paste";
import type { YouTubeShortsProduction } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-production";
import {
  storyRoleDisplayName,
  type YouTubeShortsStoryboardScene,
} from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-storyboard";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-sm text-stone-900 disabled:bg-stone-50";

const PANEL_CLASS = "min-h-[11rem] space-y-2";

const P1B_TABS = [
  "role",
  "purpose",
  "scene-description",
  "timing",
  "narration",
  "on-screen-text",
] as const;

const P1C_TABS = [
  "visual-prompt",
  "voice-direction",
  "asset-type",
  "motion-prompt",
  "continuity",
] as const;

const FIELD_TABS = [...P1B_TABS, ...P1C_TABS] as const;

type FieldTab = (typeof FIELD_TABS)[number];

const TAB_LABELS: Record<FieldTab, string> = {
  role: "Role",
  purpose: "Purpose",
  "scene-description": "Scene Description",
  timing: "Timing",
  narration: "Narration",
  "on-screen-text": "On-Screen Text",
  "visual-prompt": "Visual Prompt",
  "voice-direction": "Voice Direction",
  "asset-type": "Asset Type",
  "motion-prompt": "Motion Prompt",
  continuity: "Continuity",
};

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

async function copyText(text: string): Promise<boolean> {
  if (!text.trim()) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function FieldBlock({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-stone-600">{label}</span>
      {hint ? (
        <p className="text-[11px] leading-snug text-stone-500">{hint}</p>
      ) : null}
      {children}
    </label>
  );
}

export function StoryboardSceneEditor({
  scene,
  productionScene,
  production,
  productionFocusKey = null,
  approved,
  disabled,
  onChange,
  onChangeProduction,
  onPrevious,
  onNext,
  canPrevious,
  canNext,
}: {
  scene: YouTubeShortsStoryboardScene;
  productionScene: YouTubeShortsProduction["scenes"][number] | null;
  production: YouTubeShortsProduction | null;
  /** productionGeneratedAt from last Expand/Re-expand (or restored snapshot). */
  productionFocusKey?: string | null;
  approved: boolean;
  disabled: boolean;
  onChange: (patch: StoryboardScenePatch) => void;
  onChangeProduction: (patch: ProductionScenePatch) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  canPrevious?: boolean;
  canNext?: boolean;
}) {
  const hasProduction = Boolean(productionScene && production);
  const [fieldTab, setFieldTab] = useState<FieldTab>(() =>
    hasProduction ? "visual-prompt" : "role",
  );
  const [copyFlash, setCopyFlash] = useState<string | null>(null);
  const storyboardLocked = approved || disabled;
  const productionEditable = hasProduction && approved && !disabled;

  useEffect(() => {
    if (!production || !productionFocusKey) return;
    setFieldTab("visual-prompt");
  }, [productionFocusKey, production]);

  const narrationChars = scene.narration.length;
  const narrationWords = countWords(scene.narration);
  const onScreenChars = scene.onScreenText.length;

  const flashCopy = (label: string) => {
    setCopyFlash(label);
    window.setTimeout(() => setCopyFlash(null), 1200);
  };

  const handleCopyVisual = async () => {
    if (!productionScene) return;
    const ok = await copyText(formatVisualPromptBody(productionScene));
    if (ok) flashCopy("Visual");
  };

  const handleCopyMotion = async () => {
    if (!productionScene) return;
    const text = formatMotionPromptBody(productionScene);
    if (!text) return;
    const ok = await copyText(text);
    if (ok) flashCopy("Motion");
  };

  const handleCopyFull = async () => {
    if (!productionScene || !production) return;
    const ok = await copyText(
      formatFullScenePaste({
        storyboardScene: scene,
        productionScene,
        production,
      }),
    );
    if (ok) flashCopy("Full package");
  };

  const handleCopySceneNotes = async () => {
    const ok = await copyText(
      formatSceneNotesPaste({
        storyboardScene: scene,
        productionScene,
        production,
      }),
    );
    if (ok) flashCopy("Scene notes");
  };

  let panel: ReactNode = null;
  switch (fieldTab) {
    case "role":
      panel = (
        <div className={PANEL_CLASS}>
          <FieldBlock label="Story Role">
            <input
              className={inputClass}
              value={scene.storyRole}
              disabled={storyboardLocked}
              onChange={(event) => onChange({ storyRole: event.target.value })}
            />
          </FieldBlock>
        </div>
      );
      break;
    case "purpose":
      panel = (
        <div className={PANEL_CLASS}>
          <FieldBlock
            label="Purpose"
            hint="Why this beat exists in the seven-scene story."
          >
            <textarea
              className={inputClass}
              rows={5}
              value={scene.purpose}
              disabled={storyboardLocked}
              onChange={(event) => onChange({ purpose: event.target.value })}
            />
          </FieldBlock>
        </div>
      );
      break;
    case "scene-description":
      panel = (
        <div className={PANEL_CLASS}>
          <FieldBlock
            label="Scene Description"
            hint="Visible situation that keeps the scene’s open question visible — not a generation-ready Visual Prompt."
          >
            <textarea
              className={inputClass}
              rows={5}
              value={scene.sceneDescription}
              disabled={storyboardLocked}
              onChange={(event) =>
                onChange({ sceneDescription: event.target.value })
              }
            />
          </FieldBlock>
        </div>
      );
      break;
    case "timing":
      panel = (
        <div className={PANEL_CLASS}>
          <FieldBlock
            label="Duration Target"
            hint="Creative target: approximately 7 seconds."
          >
            <div className="flex items-center gap-2">
              <input
                className={`${inputClass} max-w-[5rem]`}
                type="number"
                min={5}
                max={10}
                step={1}
                value={scene.durationTargetSeconds}
                disabled={storyboardLocked}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  if (!Number.isFinite(next)) return;
                  onChange({
                    durationTargetSeconds: Math.min(10, Math.max(5, next)),
                  });
                }}
              />
              <span className="text-xs text-stone-500">sec</span>
            </div>
          </FieldBlock>
        </div>
      );
      break;
    case "narration":
      panel = (
        <div className={PANEL_CLASS}>
          <FieldBlock
            label="Narration"
            hint="Exact spoken words for this scene. Do not put stage directions here."
          >
            <textarea
              className={inputClass}
              rows={5}
              value={scene.narration}
              disabled={storyboardLocked}
              maxLength={800}
              onChange={(event) => onChange({ narration: event.target.value })}
            />
          </FieldBlock>
          <p className="text-[11px] text-stone-500">
            Words: {narrationWords} · Characters: {narrationChars} / 800
          </p>
        </div>
      );
      break;
    case "on-screen-text":
      panel = (
        <div className={PANEL_CLASS}>
          <FieldBlock
            label="On-Screen Text"
            hint="Short overlay text that reinforces the beat."
          >
            <input
              className={inputClass}
              value={scene.onScreenText}
              disabled={storyboardLocked}
              maxLength={200}
              onChange={(event) =>
                onChange({ onScreenText: event.target.value })
              }
            />
          </FieldBlock>
          <p className="text-[11px] text-stone-500">
            Characters: {onScreenChars} / 200
          </p>
        </div>
      );
      break;
    case "visual-prompt":
      panel = productionScene ? (
        <div className={PANEL_CLASS}>
          <FieldBlock
            label="Visual Prompt"
            hint="Approved Role, Purpose, and Scene Description still drive this plate. This field is production treatment, not a story reset."
          >
            <textarea
              className={inputClass}
              rows={8}
              value={productionScene.visualPrompt}
              disabled={!productionEditable}
              onChange={(event) =>
                onChangeProduction({ visualPrompt: event.target.value })
              }
            />
          </FieldBlock>
        </div>
      ) : (
        <div className={PANEL_CLASS}>
          <p className="rounded-md border border-dashed border-stone-200 bg-stone-50 px-2.5 py-3 text-sm text-stone-500">
            Expand production after storyboard approval to fill this field.
          </p>
        </div>
      );
      break;
    case "voice-direction":
      panel = productionScene ? (
        <div className={PANEL_CLASS}>
          <FieldBlock
            label="Voice Direction"
            hint="Delivery notes only — not spoken words."
          >
            <textarea
              className={inputClass}
              rows={4}
              value={productionScene.voiceDirection}
              disabled={!productionEditable}
              onChange={(event) =>
                onChangeProduction({ voiceDirection: event.target.value })
              }
            />
          </FieldBlock>
        </div>
      ) : (
        <div className={PANEL_CLASS}>
          <p className="rounded-md border border-dashed border-stone-200 bg-stone-50 px-2.5 py-3 text-sm text-stone-500">
            Expand production after storyboard approval to fill this field.
          </p>
        </div>
      );
      break;
    case "asset-type":
      panel = productionScene ? (
        <div className={PANEL_CLASS}>
          <FieldBlock label="Asset Type">
            <select
              className={inputClass}
              value={productionScene.assetType}
              disabled={!productionEditable}
              onChange={(event) => {
                const assetType = event.target.value as "image" | "video";
                onChangeProduction({
                  assetType,
                  motionPrompt:
                    assetType === "image" ? "" : productionScene.motionPrompt,
                });
              }}
            >
              <option value="image">image</option>
              <option value="video">video</option>
            </select>
          </FieldBlock>
        </div>
      ) : (
        <div className={PANEL_CLASS}>
          <p className="rounded-md border border-dashed border-stone-200 bg-stone-50 px-2.5 py-3 text-sm text-stone-500">
            Expand production after storyboard approval to fill this field.
          </p>
        </div>
      );
      break;
    case "motion-prompt":
      panel = productionScene ? (
        <div className={PANEL_CLASS}>
          <FieldBlock
            label="Motion Prompt"
            hint="Image-to-video action, camera, and timing. Empty when asset type is image."
          >
            <textarea
              className={inputClass}
              rows={8}
              value={productionScene.motionPrompt}
              disabled={
                !productionEditable || productionScene.assetType === "image"
              }
              onChange={(event) =>
                onChangeProduction({ motionPrompt: event.target.value })
              }
            />
          </FieldBlock>
        </div>
      ) : (
        <div className={PANEL_CLASS}>
          <p className="rounded-md border border-dashed border-stone-200 bg-stone-50 px-2.5 py-3 text-sm text-stone-500">
            Expand production after storyboard approval to fill this field.
          </p>
        </div>
      );
      break;
    case "continuity":
      panel = productionScene ? (
        <div className={PANEL_CLASS}>
          <FieldBlock
            label="Continuity Delta"
            hint="Internal scene lock delta. Export maps CHARACTER* only — never a bare CONTINUITY paste header."
          >
            <textarea
              className={inputClass}
              rows={5}
              value={productionScene.continuityDelta}
              disabled={!productionEditable}
              onChange={(event) =>
                onChangeProduction({ continuityDelta: event.target.value })
              }
            />
          </FieldBlock>
          {production?.projectVisualContinuity ? (
            <p className="text-[11px] leading-snug text-stone-500">
              Project visual continuity is board-level (internal). Character
              export uses CHARACTER NAME / IDENTITY / CONTINUITY when present.
            </p>
          ) : null}
        </div>
      ) : (
        <div className={PANEL_CLASS}>
          <p className="rounded-md border border-dashed border-stone-200 bg-stone-50 px-2.5 py-3 text-sm text-stone-500">
            Expand production after storyboard approval to fill this field.
          </p>
        </div>
      );
      break;
  }

  return (
    <article className="rounded-xl border border-stone-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-stone-100 px-4 py-2.5">
        <p className="text-sm font-semibold text-stone-900">
          Scene {scene.sceneNumber} — {storyRoleDisplayName(scene.storyRole)}
        </p>
        <button
          type="button"
          onClick={() => void handleCopySceneNotes()}
          title="Copy this scene’s fields for notes"
          aria-label="Copy this scene’s fields for notes"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-stone-300 px-2 py-1 text-xs font-medium text-stone-700 hover:bg-stone-50"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy scene
          {copyFlash === "Scene notes" ? (
            <span className="text-emerald-700">Copied</span>
          ) : null}
        </button>
      </div>

      <div
        className="overflow-hidden border-b border-stone-200 px-3 sm:px-4"
        role="tablist"
        aria-label="Scene field sections"
      >
        <div className="flex w-full items-end justify-between gap-0.5">
          {FIELD_TABS.map((tab) => {
            const active = fieldTab === tab;
            const isProduction = (P1C_TABS as readonly string[]).includes(tab);
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={active}
                title={TAB_LABELS[tab]}
                onClick={() => setFieldTab(tab)}
                className={cn(
                  "-mb-px min-w-0 flex-1 border-b-2 px-0.5 py-2 text-center text-[11px] font-medium leading-tight transition-colors sm:text-xs",
                  active
                    ? "border-emerald-700 text-stone-900"
                    : "border-transparent text-stone-500 hover:text-stone-800",
                  isProduction && !hasProduction && !active
                    ? "text-stone-400"
                    : null,
                )}
              >
                <span className="block truncate">{TAB_LABELS[tab]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-3" role="tabpanel">
        {panel}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!hasProduction}
            title={
              hasProduction ? "Copy Visual Prompt" : "Expand production first"
            }
            onClick={() => void handleCopyVisual()}
            className="rounded-md border border-stone-300 px-2.5 py-1 text-xs font-medium text-stone-800 disabled:opacity-40"
          >
            Copy Visual Prompt
          </button>
          <button
            type="button"
            disabled={
              !hasProduction ||
              !productionScene ||
              productionScene.assetType !== "video" ||
              !productionScene.motionPrompt.trim()
            }
            title={
              hasProduction ? "Copy Motion Prompt" : "Expand production first"
            }
            onClick={() => void handleCopyMotion()}
            className="rounded-md border border-stone-300 px-2.5 py-1 text-xs font-medium text-stone-800 disabled:opacity-40"
          >
            Copy Motion Prompt
          </button>
          <button
            type="button"
            disabled={!hasProduction}
            title={
              hasProduction
                ? "Copy Full Scene Package"
                : "Expand production first"
            }
            onClick={() => void handleCopyFull()}
            className="rounded-md border border-stone-300 px-2.5 py-1 text-xs font-medium text-stone-800 disabled:opacity-40"
          >
            Copy Full Scene Package
          </button>
          {copyFlash ? (
            <span className="text-[11px] text-emerald-700">
              Copied {copyFlash}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-stone-500">
            Scene {scene.sceneNumber} of 7 · ~{scene.durationTargetSeconds}s
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!canPrevious}
              onClick={onPrevious}
              className="rounded-md border border-stone-300 px-2.5 py-1 text-xs font-medium text-stone-800 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={!canNext}
              onClick={onNext}
              className="rounded-md border border-stone-300 px-2.5 py-1 text-xs font-medium text-stone-800 disabled:opacity-40"
            >
              Next Scene
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
