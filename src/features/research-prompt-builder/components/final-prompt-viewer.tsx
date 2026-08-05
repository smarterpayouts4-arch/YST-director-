"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { FinalResearchPrompt } from "@/features/research-prompt-builder/types";

export function FinalPromptViewer({
  prompt,
  formatted,
  busy,
  error,
  onRegenerate,
}: {
  prompt: FinalResearchPrompt;
  formatted: string;
  busy: boolean;
  error?: string | null;
  onRegenerate: () => void;
}) {
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="mx-auto max-w-[1040px] space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.16em] text-stone-500">Step 5 of 5</p>
        <h1 className="editorial mt-3 text-4xl text-stone-900 md:text-5xl">
          {prompt.title}
        </h1>
        <p className="mt-4 text-sm text-stone-600">
          Generated {new Date(prompt.metadata.generatedAt).toLocaleString()} · Prompt{" "}
          {prompt.metadata.promptVersion} · Profile {prompt.metadata.companyProfileVersion} ·{" "}
          {prompt.metadata.model}
        </p>
      </div>

      <pre className="overflow-x-auto whitespace-pre-wrap rounded-md border border-stone-300 bg-white p-5 text-sm leading-relaxed text-stone-800">
        {formatted}
      </pre>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <div className="flex flex-wrap justify-end gap-3">
        <Button variant="outline" onClick={onRegenerate} disabled={busy}>
          {busy ? "Regenerating…" : "Regenerate"}
        </Button>
        <Button variant="secondary" onClick={download}>
          Download Markdown
        </Button>
        <Button onClick={copy}>{copied ? "Copied" : "Copy prompt"}</Button>
      </div>
    </div>
  );
}
