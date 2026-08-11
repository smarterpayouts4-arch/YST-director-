"use client";

import { useState, type Dispatch, type RefObject, type SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { SUPPORTING_ACCEPT_ATTR } from "@/config/upload-policy";
import type {
  InterviewQuestion,
  SupportingContext,
} from "@/features/research-prompt-builder/types";

export const INTERVIEW_SHORT_FORM = {
  question: 180,
  whyThisMatters: 140,
  whatWeNoticed: 200,
  suggestedAnswer: 280,
} as const;

export const CATEGORY_HOOK: Record<InterviewQuestion["decisionCategory"], string> = {
  strategic_direction: "Chooses which strategic hypotheses the research must test.",
  customer_moment: "Locks the buyer moment into your prompt.",
  viewer_reward: "Locks what the viewer walks away with.",
  business_bridge: "Locks how learning turns into your offer.",
  trust_boundaries: "Locks what the research must never claim.",
  challenge_assumption: "Locks what the research must pressure-test.",
  geography_capacity: "Locks where you can actually deliver.",
  regulated_claims: "Locks the compliance line.",
  commercial_priority: "Locks the commercial priority.",
  customer_qualification: "Locks who counts as a real prospect.",
  production_capacity: "Locks what you can realistically ship.",
  other_material_unknown: "Locks one open question for research.",
};

export type SupportingDoc = {
  documentId: string;
  fileName: string;
  extractedSummary: string;
  extractionWarnings: string[];
  extractedCharCount?: number;
};

export function forDisplay(text: string): string {
  return text
    .replace(/[\u2014\u2015\u2E3A\u2E3B]/g, ", ")
    .replace(/\u2013/g, "-")
    .replace(/\s+-\s+/g, ", ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+,/g, ",")
    .trim();
}

export function firstBeat(text: string, max = 140): string {
  const clean = forDisplay(text).replace(
    /^(observed fact|working hypothesis|confirmed decision|restriction)\s*:\s*/i,
    "",
  );
  const sentence = clean.match(/^[^.!?]+[.!?]?/)?.[0]?.trim() || clean;
  if (sentence.length <= max) return sentence;
  return `${sentence.slice(0, max - 1).trimEnd()}…`;
}

export function FileAttachFooter({
  locked,
  busy,
  docs,
  setDocs,
  uploadError,
  setUploadError,
  onExtract,
  fileRef,
}: {
  locked: boolean;
  busy: boolean;
  docs: SupportingDoc[];
  setDocs: Dispatch<SetStateAction<SupportingDoc[]>>;
  uploadError: string | null;
  setUploadError: (value: string | null) => void;
  onExtract: (file: File) => Promise<SupportingContext & { extractedCharCount?: number }>;
  fileRef: RefObject<HTMLInputElement | null>;
}) {
  return (
    <details className="min-w-0 flex-1 text-sm text-stone-500">
      <summary className="cursor-pointer list-none marker:content-none hover:text-stone-700 [&::-webkit-details-marker]:hidden">
        Add file{docs.length ? ` (${docs.length})` : ""}
      </summary>
      <div className="mt-2 space-y-2">
        <input
          ref={fileRef}
          type="file"
          accept={SUPPORTING_ACCEPT_ATTR}
          className="sr-only"
          disabled={locked}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file || locked) return;
            setUploadError(null);
            try {
              const ctx = await onExtract(file);
              setDocs((prev) => [
                ...prev.slice(0, 2),
                {
                  documentId: ctx.documentId,
                  fileName: ctx.fileName,
                  extractedSummary: [
                    ...ctx.relevantFacts,
                    ...ctx.ownerStatements,
                    ...ctx.suggestedAnswerAdditions,
                  ]
                    .slice(0, 12)
                    .join(" "),
                  extractionWarnings: ctx.warnings,
                  extractedCharCount: ctx.extractedCharCount,
                },
              ]);
            } catch (err) {
              setUploadError(err instanceof Error ? err.message : "Upload failed");
            } finally {
              e.target.value = "";
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={busy || locked || docs.length >= 3}
        >
          Upload
        </Button>
        {docs.map((doc) => (
          <div
            key={doc.documentId}
            className="flex items-center justify-between gap-2 text-xs text-stone-600"
          >
            <span className="truncate">{doc.fileName}</span>
            <Button
              size="sm"
              variant="ghost"
              disabled={locked}
              onClick={() =>
                setDocs((prev) => prev.filter((d) => d.documentId !== doc.documentId))
              }
            >
              Remove
            </Button>
          </div>
        ))}
        {uploadError ? <p className="text-sm text-red-700">{uploadError}</p> : null}
      </div>
    </details>
  );
}

export function StatusPanel({
  statusMessage,
  error,
  locked,
  busy,
  onRetry,
  canBuildBrief,
  onBuildBrief,
}: {
  statusMessage?: string | null;
  error?: string | null;
  locked: boolean;
  busy: boolean;
  onRetry?: () => void;
  canBuildBrief?: boolean;
  onBuildBrief?: () => void;
}) {
  if (!statusMessage) return null;
  return (
    <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-3">
      <p className="text-sm text-stone-700">{statusMessage}</p>
      {error && locked ? <p className="text-sm text-red-700">{error}</p> : null}
      {onRetry || onBuildBrief ? (
        <div className="flex flex-wrap gap-2">
          {onRetry ? (
            <Button size="sm" onClick={onRetry} disabled={busy}>
              Retry next question
            </Button>
          ) : null}
          {canBuildBrief && onBuildBrief ? (
            <Button size="sm" variant="outline" onClick={onBuildBrief} disabled={busy}>
              Build research brief now
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function QuestionHeader({ question }: { question: InterviewQuestion }) {
  const [showFullQuestion, setShowFullQuestion] = useState(false);
  const fullQuestion = forDisplay(question.question);
  const questionIsLong = fullQuestion.length > INTERVIEW_SHORT_FORM.question;
  const questionShown =
    showFullQuestion || !questionIsLong
      ? fullQuestion
      : firstBeat(fullQuestion, INTERVIEW_SHORT_FORM.question);

  return (
    <header className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
        {question.questionKind === "strategic_direction"
          ? "Strategic directions"
          : `Decision ${question.sequenceNumber}`}
      </p>
      <h1 className="editorial text-3xl font-normal leading-snug text-stone-900 md:text-[2.15rem]">
        {questionShown}
      </h1>
      {questionIsLong ? (
        <button
          type="button"
          className="text-xs font-medium text-stone-500 underline-offset-2 hover:text-stone-800 hover:underline"
          onClick={() => setShowFullQuestion((v) => !v)}
        >
          {showFullQuestion ? "Shorter view" : "Full question"}
        </button>
      ) : null}
      <p className="text-sm text-stone-600">
        {firstBeat(question.whyThisMatters, INTERVIEW_SHORT_FORM.whyThisMatters)}
      </p>
      <p className="text-sm font-medium text-stone-700">
        {CATEGORY_HOOK[question.decisionCategory]}
      </p>
    </header>
  );
}
