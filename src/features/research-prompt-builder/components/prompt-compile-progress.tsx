"use client";

import { useEffect, useState } from "react";

/**
 * Honest non-completing wait states for the opaque prompt compile call.
 * No fake checkmarks, no percentages, no invented completed phases.
 */
const BEATS = [
  "Preparing your research context…",
  "Structuring the research assignment…",
  "Checking the output contract…",
] as const;

export function PromptCompileProgress({ error }: { error?: string | null }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % BEATS.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="mx-auto max-w-lg space-y-4 py-10">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
        Step 5 of 8 · Start the Research
      </p>
      <h1 className="editorial text-3xl text-stone-900">Building your research prompt</h1>
      <ul className="space-y-2 text-sm text-stone-600">
        {BEATS.map((beat, i) => (
          <li key={beat} className={i === index ? "font-medium text-stone-900" : "text-stone-400"}>
            {i === index ? "•" : "○"} {beat}
          </li>
        ))}
      </ul>
      <p className="text-xs text-stone-500">
        This can take up to a minute. Progress here is status only, not completed work steps.
      </p>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
