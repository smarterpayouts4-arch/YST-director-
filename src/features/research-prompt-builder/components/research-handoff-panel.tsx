"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { acceptResearchHandoff } from "@/features/content-intelligence/library/state/handoff";

/**
 * Thin Step 5 doorway only.
 * Holds completed research in local component state until Send;
 * never persists into ResearchPromptProject / RPB storage.
 */
export function ResearchHandoffPanel({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [researchText, setResearchText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    setBusy(true);
    setError(null);
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
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
        Research complete?
      </p>
      <p className="mt-1 text-sm text-stone-700">
        Paste the completed research response below.
      </p>
      <textarea
        className="mt-3 w-full min-h-[180px] rounded-md border border-stone-300 bg-stone-50 p-3 text-sm leading-relaxed text-stone-800"
        placeholder="Paste the ChatGPT research response here…"
        value={researchText}
        onChange={(e) => setResearchText(e.target.value)}
        disabled={busy}
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button onClick={send} disabled={busy || !researchText.trim()}>
          {busy ? "Sending…" : "Send to Content Intelligence"}
        </Button>
      </div>
      <p className="mt-3 text-xs text-stone-500">
        Your original research response will be preserved unchanged. Content Intelligence will
        organize it for review.
      </p>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </section>
  );
}
