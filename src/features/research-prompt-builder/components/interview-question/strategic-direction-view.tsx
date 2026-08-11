"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FileAttachFooter,
  INTERVIEW_SHORT_FORM,
  QuestionHeader,
  StatusPanel,
  firstBeat,
  forDisplay,
  type SupportingDoc,
} from "@/features/research-prompt-builder/components/interview-shared";
import type { ViewProps } from "@/features/research-prompt-builder/components/interview-question/types";
import {
  buildStrategyInterviewAnswer,
  canContinueStrategySelection,
} from "@/features/research-prompt-builder/lib/compose-strategy-answer";

export function StrategicDirectionView({
  question,
  seedAnswer = null,
  busy,
  error,
  locked = false,
  statusMessage,
  onRetry,
  canBuildBrief = false,
  onBuildBrief,
  onSave,
  onExtract,
}: ViewProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    () => seedAnswer?.selectedSuggestionIds ?? [],
  );
  const [customDirection, setCustomDirection] = useState(
    () => seedAnswer?.customDirection ?? "",
  );
  const [showCustom, setShowCustom] = useState(
    () => Boolean(seedAnswer?.customDirection?.trim()),
  );
  const [docs, setDocs] = useState<SupportingDoc[]>(() =>
    (seedAnswer?.supportingDocuments ?? []).map((doc) => ({
      documentId: doc.documentId,
      fileName: doc.fileName,
      extractedSummary: doc.extractedSummary,
      extractionWarnings: doc.extractionWarnings,
    })),
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const canContinue = canContinueStrategySelection({
    selectedSuggestionIds: selectedIds,
    customDirection,
  });

  const toggle = (id: string) => {
    if (locked) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const exploreAll = () => {
    if (locked) return;
    setSelectedIds(question.strategicSuggestions.map((c) => c.suggestionId));
  };

  const save = () => {
    if (!canContinue || busy || locked) return;
    onSave(
      buildStrategyInterviewAnswer({
        question,
        selectedSuggestionIds: selectedIds,
        customDirection: customDirection.trim() || null,
        supportingDocuments: docs.map((doc) => ({
          documentId: doc.documentId,
          fileName: doc.fileName,
          extractedSummary: doc.extractedSummary,
          extractionWarnings: doc.extractionWarnings,
        })),
      }),
    );
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <QuestionHeader question={question} />
      <p className="text-sm text-stone-600">
        Based on what we know about your business, here are directions worth investigating.
      </p>

      <StatusPanel
        statusMessage={statusMessage}
        error={error}
        locked={locked}
        busy={busy}
        onRetry={onRetry}
        canBuildBrief={canBuildBrief}
        onBuildBrief={onBuildBrief}
      />

      <details className="group text-sm text-stone-600">
        <summary className="cursor-pointer list-none font-medium text-stone-500 marker:content-none hover:text-stone-800 [&::-webkit-details-marker]:hidden">
          Context
        </summary>
        <p className="mt-2 leading-snug text-stone-700">
          {firstBeat(question.whatWeNoticed, INTERVIEW_SHORT_FORM.whatWeNoticed)}
        </p>
      </details>

      <div className="space-y-3">
        {question.strategicSuggestions.map((card) => {
          const checked = selectedIds.includes(card.suggestionId);
          return (
            <label
              key={card.suggestionId}
              className={`block cursor-pointer rounded-2xl border p-4 shadow-sm transition ${
                checked
                  ? "border-indigo-400 bg-indigo-50/40"
                  : "border-stone-200 bg-white hover:border-stone-300"
              } ${locked ? "pointer-events-none opacity-80" : ""}`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
                  checked={checked}
                  disabled={locked}
                  onChange={() => toggle(card.suggestionId)}
                />
                <div className="min-w-0 space-y-2">
                  <h2 className="text-lg font-medium text-stone-900">
                    {forDisplay(card.title)}
                  </h2>
                  <p className="text-sm leading-snug text-stone-700">
                    {forDisplay(card.description)}
                  </p>
                  <p className="text-sm text-stone-600">
                    <span className="font-medium text-stone-700">Why this may fit. </span>
                    {forDisplay(card.rationale)}
                  </p>
                  <p className="text-sm text-stone-600">
                    <span className="font-medium text-stone-700">Research should test. </span>
                    {forDisplay(card.researchFocus)}
                  </p>
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {!locked ? (
        <button
          type="button"
          className="self-start text-sm font-medium text-stone-600 underline-offset-2 hover:text-stone-900 hover:underline"
          onClick={exploreAll}
        >
          Explore all
        </button>
      ) : null}

      <div className="space-y-2">
        {!showCustom && !locked ? (
          <button
            type="button"
            className="text-sm font-medium text-stone-600 underline-offset-2 hover:text-stone-900 hover:underline"
            onClick={() => setShowCustom(true)}
          >
            + Add your own direction
          </button>
        ) : null}
        {showCustom || customDirection ? (
          <div className="space-y-1 rounded-2xl border border-stone-200 bg-white p-3">
            <label
              htmlFor="custom-direction"
              className="text-[10px] font-bold uppercase tracking-wider text-stone-500"
            >
              Your direction
            </label>
            <textarea
              id="custom-direction"
              className="min-h-[72px] w-full rounded-xl border border-stone-200 bg-white p-3 text-sm leading-snug text-stone-800 placeholder:text-stone-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-stone-50"
              placeholder="A research direction only you can name…"
              value={customDirection}
              disabled={locked}
              maxLength={500}
              onChange={(e) => setCustomDirection(e.target.value)}
            />
          </div>
        ) : null}
      </div>

      {error && !locked ? <p className="text-sm text-red-700">{error}</p> : null}

      <div className="flex items-center justify-between gap-3">
        <FileAttachFooter
          locked={locked}
          busy={busy}
          docs={docs}
          setDocs={setDocs}
          uploadError={uploadError}
          setUploadError={setUploadError}
          onExtract={onExtract}
          fileRef={fileRef}
        />
        <Button disabled={!canContinue || busy || locked} onClick={save} className="shrink-0">
          {busy && !locked ? "Saving…" : "Save answer & continue"}
        </Button>
      </div>
    </div>
  );
}
