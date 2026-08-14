"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  MAX_RESEARCH_INPUT_CHARS,
  shouldWarnResearchInputLength,
} from "@/features/content-intelligence/library/config/research-input-limits";
import { acceptResearchHandoff } from "@/features/content-intelligence/library/state/handoff";
import {
  isResearchPromptPaste,
  RESEARCH_PROMPT_PASTE_ERROR,
} from "@/features/research-prompt-builder/lib/is-research-prompt-paste";

/**
 * Thin Step 5 doorway only.
 * Holds completed research in local component state until Send;
 * never persists into ResearchPromptProject / RPB storage.
 */
export function ResearchHandoffPanel({
  projectId,
  researchPromptText,
}: {
  projectId: string;
  /** Formatted Step 5 research assignment — reject if pasted here by mistake. */
  researchPromptText: string;
}) {
  const router = useRouter();
  const [researchText, setResearchText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formattedResearchLimit = MAX_RESEARCH_INPUT_CHARS.toLocaleString();
  const showCapacityWarn = shouldWarnResearchInputLength(researchText.length);

  const send = async () => {
    setBusy(true);
    setError(null);
    if (isResearchPromptPaste(researchText, researchPromptText)) {
      setError(RESEARCH_PROMPT_PASTE_ERROR);
      setBusy(false);
      return;
    }
    try {
      const { artifactId } = await acceptResearchHandoff({
        researchText,
        projectId,
      });
      setResearchText("");
      const params = new URLSearchParams({
        projectId,
        artifactId,
        return: "/",
      });
      router.push(`/content-intelligence?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Handoff failed.");
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
        2 · Paste ChatGPT’s answer
      </p>
      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
          Research complete?
        </p>
        <p className="mt-1 text-sm text-stone-700">
          Paste the finished ChatGPT report here — findings, sources, experiments. Do not paste
          the research prompt from the left.
        </p>
        <textarea
          className="mt-3 w-full min-h-[280px] rounded-md border border-stone-300 bg-stone-50 p-3 text-sm leading-relaxed text-stone-800 lg:min-h-[360px]"
          placeholder="Paste ChatGPT’s completed research report here…"
          value={researchText}
          onChange={(e) => {
            setResearchText(e.target.value);
            if (error) setError(null);
          }}
          disabled={busy}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button onClick={send} disabled={busy || !researchText.trim()}>
            {busy ? "Sending…" : "Send completed research"}
          </Button>
          {showCapacityWarn ? (
            <p className="text-xs font-medium text-amber-800">
              {researchText.length.toLocaleString()} / {formattedResearchLimit} characters
            </p>
          ) : null}
        </div>
        <p className="mt-3 text-xs text-stone-500">
          Preserved unchanged for See What We Found. Maximum {formattedResearchLimit}{" "}
          characters
          (rejected if longer — never truncated).
        </p>
        {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
      </section>
    </div>
  );
}
