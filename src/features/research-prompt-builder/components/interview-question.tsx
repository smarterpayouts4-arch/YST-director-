"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type {
  InterviewAnswer,
  InterviewQuestion,
  SupportingContext,
} from "@/features/research-prompt-builder/types";

export function InterviewQuestionView({
  question,
  totalHint,
  busy,
  error,
  onSave,
  onExtract,
}: {
  question: InterviewQuestion;
  totalHint: string;
  busy: boolean;
  error?: string | null;
  onSave: (answer: InterviewAnswer) => void;
  onExtract: (file: File) => Promise<SupportingContext & { extractedCharCount?: number }>;
}) {
  const [answerText, setAnswerText] = useState("");
  const [usedSuggestion, setUsedSuggestion] = useState(false);
  const [docs, setDocs] = useState<
    Array<{
      documentId: string;
      fileName: string;
      extractedSummary: string;
      extractionWarnings: string[];
      extractedCharCount?: number;
    }>
  >([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mx-auto max-w-[1040px] space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.16em] text-stone-500">
          Strategic question {totalHint}
        </p>
        <h1 className="editorial mt-3 text-4xl leading-tight text-stone-900 md:text-5xl">
          {question.question}
        </h1>
        <p className="mt-4 max-w-3xl text-base text-stone-600">
          <span className="font-medium text-stone-800">What we noticed: </span>
          {question.whatWeNoticed}
        </p>
      </div>

      <section className="space-y-3 border-l-2 border-indigo-700 pl-4">
        <p className="text-xs uppercase tracking-[0.16em] text-stone-500">
          Suggested answer from your data
        </p>
        <p className="text-stone-800">{question.suggestedAnswer}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setAnswerText(question.suggestedAnswer);
              setUsedSuggestion(true);
            }}
          >
            Use this suggestion
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setAnswerText(question.suggestedAnswer);
              setUsedSuggestion(true);
            }}
          >
            Edit suggestion
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setAnswerText("");
              setUsedSuggestion(false);
            }}
          >
            Write my own
          </Button>
        </div>
        <p className="text-sm text-stone-500">
          Start with our suggestion, then add anything that makes it more accurate.
        </p>
      </section>

      <textarea
        className="min-h-40 w-full rounded-md border border-stone-300 bg-white px-4 py-3 text-base"
        placeholder="Your answer"
        value={answerText}
        onChange={(e) => setAnswerText(e.target.value)}
      />

      <section className="space-y-3">
        <p className="text-sm text-stone-600">
          Upload a brief, customer notes, personas, FAQs, research, or other material that would
          make this answer more accurate.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx,.txt,.md,.csv,.json"
          className="sr-only"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
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
        <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={busy || docs.length >= 3}>
          Upload supporting document
        </Button>
        {docs.map((doc) => (
          <div key={doc.documentId} className="flex items-start justify-between gap-3 text-sm text-stone-700">
            <div>
              <p className="font-medium">{doc.fileName}</p>
              <p className="text-stone-500">
                {doc.extractedCharCount ?? doc.extractedSummary.length} characters extracted
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDocs((prev) => prev.filter((d) => d.documentId !== doc.documentId))}
            >
              Remove
            </Button>
          </div>
        ))}
        {uploadError ? <p className="text-sm text-red-700">{uploadError}</p> : null}
      </section>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <div className="flex justify-end">
        <Button
          disabled={!answerText.trim() || busy}
          onClick={() =>
            onSave({
              questionId: question.questionId,
              answerText: answerText.trim(),
              usedSuggestion,
              supportingDocuments: docs.map((doc) => ({
                documentId: doc.documentId,
                fileName: doc.fileName,
                extractedSummary: doc.extractedSummary,
                extractionWarnings: doc.extractionWarnings,
              })),
              answeredAt: new Date().toISOString(),
            })
          }
        >
          {busy ? "Saving…" : "Save answer & continue"}
        </Button>
      </div>
    </div>
  );
}
