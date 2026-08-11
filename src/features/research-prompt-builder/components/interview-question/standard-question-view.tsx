"use client";

import { useMemo, useRef, useState } from "react";
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

export function StandardQuestionView({
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
  const suggestedRaw = question.suggestedAnswer ?? "";
  const suggested = useMemo(
    () => firstBeat(forDisplay(suggestedRaw), INTERVIEW_SHORT_FORM.suggestedAnswer),
    [suggestedRaw],
  );
  const [answerText, setAnswerText] = useState(() => {
    if (seedAnswer?.answerText) return forDisplay(seedAnswer.answerText);
    return forDisplay(suggestedRaw).slice(0, INTERVIEW_SHORT_FORM.suggestedAnswer);
  });
  const [usedSuggestion, setUsedSuggestion] = useState(() =>
    seedAnswer ? seedAnswer.usedSuggestion : Boolean(suggestedRaw),
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

  const save = () => {
    if (!answerText.trim() || busy || locked) return;
    onSave({
      questionId: question.questionId,
      answerText: answerText.trim(),
      usedSuggestion,
      selectedSuggestionIds: [],
      customDirection: null,
      supportingDocuments: docs.map((doc) => ({
        documentId: doc.documentId,
        fileName: doc.fileName,
        extractedSummary: doc.extractedSummary,
        extractionWarnings: doc.extractionWarnings,
      })),
      answeredAt: new Date().toISOString(),
    });
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <QuestionHeader question={question} />

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

      <div className="space-y-2 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="interview-answer"
            className="text-[10px] font-bold uppercase tracking-wider text-stone-500"
          >
            Your answer
          </label>
          {!locked ? (
            <div className="flex gap-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setAnswerText(suggested);
                  setUsedSuggestion(true);
                }}
              >
                Suggestion
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setAnswerText("");
                  setUsedSuggestion(false);
                }}
              >
                Clear
              </Button>
            </div>
          ) : null}
        </div>
        <textarea
          id="interview-answer"
          className="min-h-[88px] w-full rounded-xl border border-stone-200 bg-white p-3 text-sm leading-snug text-stone-800 placeholder:text-stone-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-stone-50"
          placeholder="Your decision in plain words…"
          value={answerText}
          disabled={locked}
          onChange={(e) => {
            setAnswerText(e.target.value);
            setUsedSuggestion(false);
          }}
        />
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
        <Button
          disabled={!answerText.trim() || busy || locked}
          onClick={save}
          className="shrink-0"
        >
          {busy && !locked ? "Saving…" : "Save answer & continue"}
        </Button>
      </div>
    </div>
  );
}
