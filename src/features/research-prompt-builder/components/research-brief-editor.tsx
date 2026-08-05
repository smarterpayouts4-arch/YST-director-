"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ResearchBrief } from "@/features/research-prompt-builder/types";

export function ResearchBriefEditor({
  brief,
  busy,
  error,
  onChange,
  onGenerate,
}: {
  brief: ResearchBrief;
  busy: boolean;
  error?: string | null;
  onChange: (brief: ResearchBrief) => void;
  onGenerate: () => void;
}) {
  const [local, setLocal] = useState(brief);

  const update = <K extends keyof ResearchBrief>(key: K, value: ResearchBrief[K]) => {
    const next = { ...local, [key]: value };
    setLocal(next);
    onChange(next);
  };

  return (
    <div className="mx-auto max-w-[1040px] space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.16em] text-stone-500">Step 4 of 5</p>
        <h1 className="editorial mt-3 text-4xl text-stone-900 md:text-5xl">
          Approve the research brief
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-stone-600">
          This is exactly what the final ChatGPT research prompt will be built from.
        </p>
      </div>

      {(
        [
          ["companyTruth", "Company truth"],
          ["customerMoment", "Customer moment"],
          ["viewerReward", "Viewer reward"],
          ["businessBridge", "Business bridge"],
          ["contentHypothesis", "Content hypothesis"],
          ["challengeHypothesis", "Challenge hypothesis"],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="block space-y-2">
          <span className="text-sm font-medium text-stone-800">{label}</span>
          <textarea
            className="min-h-28 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
            value={local[key]}
            onChange={(e) => update(key, e.target.value)}
          />
        </label>
      ))}

      <label className="block space-y-2">
        <span className="text-sm font-medium text-stone-800">Primary platform</span>
        <input
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
          value={local.primaryPlatform.value}
          onChange={(e) =>
            update("primaryPlatform", {
              ...local.primaryPlatform,
              value: e.target.value,
            })
          }
        />
        <textarea
          className="min-h-20 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
          value={local.primaryPlatform.rationale}
          onChange={(e) =>
            update("primaryPlatform", {
              ...local.primaryPlatform,
              rationale: e.target.value,
            })
          }
        />
      </label>

      {(
        [
          ["trustBoundaries", "Trust boundaries"],
          ["executionContext", "Execution context"],
          ["unresolvedUnknowns", "Unresolved unknowns"],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="block space-y-2">
          <span className="text-sm font-medium text-stone-800">{label}</span>
          <textarea
            className="min-h-28 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
            value={local[key].join("\n")}
            onChange={(e) =>
              update(
                key,
                e.target.value
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean),
              )
            }
          />
        </label>
      ))}

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <div className="flex justify-end">
        <Button onClick={onGenerate} disabled={busy}>
          {busy ? "Generating…" : "Generate research prompt"}
        </Button>
      </div>
    </div>
  );
}
