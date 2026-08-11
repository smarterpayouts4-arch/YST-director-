"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { buildTransformationSummary } from "@/features/research-prompt-builder/lib/transformation-summary";
import type {
  ConfirmedCompanyProfile,
  FinalResearchPrompt,
  InterviewAnswer,
  InterviewQuestion,
  ResearchBrief,
} from "@/features/research-prompt-builder/types";

export function FinalPromptViewer({
  prompt,
  formatted,
  busy,
  error,
  onRegenerate,
  confirmedProfile,
  questions,
  answers,
  researchBrief,
}: {
  prompt: FinalResearchPrompt;
  formatted: string;
  busy: boolean;
  error?: string | null;
  onRegenerate: () => void;
  confirmedProfile: ConfirmedCompanyProfile;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  researchBrief: ResearchBrief;
}) {
  const [copied, setCopied] = useState(false);
  const [showFull, setShowFull] = useState(false);

  const summary = useMemo(
    () =>
      buildTransformationSummary({
        confirmedProfile,
        questions,
        answers,
        researchBrief,
      }),
    [confirmedProfile, questions, answers, researchBrief],
  );

  const copy = async () => {
    await navigator.clipboard.writeText(formatted);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([formatted], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${prompt.title.replace(/[^\w\- ]+/g, "").trim() || "research-prompt"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const { builtFrom } = summary;

  return (
    <div className="mx-auto max-w-[1040px] space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
          Step 5 of 5
        </p>
        <h1 className="editorial text-3xl leading-tight text-stone-900 md:text-4xl">
          Your research assignment is ready
        </h1>
        <p className="text-base font-medium text-stone-700">{prompt.title}</p>
        <p className="text-xs text-stone-500">
          {new Date(prompt.metadata.generatedAt).toLocaleString()} ·{" "}
          {prompt.metadata.promptVersion} · {prompt.metadata.model}
        </p>
      </div>

      <div className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
            Built from
          </p>
          <ul className="list-disc space-y-1 pl-4 text-sm text-stone-700">
            {builtFrom.companyEvidence ? <li>Your company evidence</li> : null}
            <li>
              {builtFrom.corrections} correction
              {builtFrom.corrections === 1 ? "" : "s"}
            </li>
            <li>
              {builtFrom.strategicDirections} strategic direction
              {builtFrom.strategicDirections === 1 ? "" : "s"}
            </li>
            <li>
              {builtFrom.ownerConstraints} owner constraint
              {builtFrom.ownerConstraints === 1 ? "" : "s"}
            </li>
          </ul>
        </div>
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
            It will investigate
          </p>
          <ul className="list-disc space-y-1 pl-4 text-sm text-stone-700">
            {summary.willInvestigate.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={copy}>{copied ? "Copied" : "Copy research prompt"}</Button>
        <Button variant="secondary" onClick={download}>
          Download Markdown
        </Button>
        <Button variant="outline" onClick={() => setShowFull((v) => !v)}>
          {showFull ? "Hide full prompt" : "View full prompt"}
        </Button>
        <Button variant="outline" onClick={onRegenerate} disabled={busy}>
          {busy ? "Regenerating…" : "Regenerate"}
        </Button>
      </div>

      {showFull ? (
        <pre className="max-h-[min(60vh,640px)] overflow-auto whitespace-pre-wrap rounded-md border border-stone-300 bg-white p-5 text-sm leading-relaxed text-stone-800">
          {formatted}
        </pre>
      ) : null}

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
