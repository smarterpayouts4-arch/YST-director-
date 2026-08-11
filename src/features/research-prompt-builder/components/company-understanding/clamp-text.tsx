"use client";

import { useState } from "react";
import { forDisplay } from "@/features/research-prompt-builder/components/company-understanding/display-text";

export function ClampText({ text, max = 180 }: { text: string; max?: number }) {
  const [open, setOpen] = useState(false);
  const clean = forDisplay(text);
  const needsClamp = clean.length > max;
  const shown = !needsClamp || open ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;

  return (
    <div className="space-y-1">
      <p className="rounded-xl border border-stone-100 bg-stone-50/60 p-3.5 text-sm leading-relaxed text-stone-800 md:text-[15px]">
        {shown}
      </p>
      {needsClamp ? (
        <button
          type="button"
          className="text-xs font-medium text-stone-500 underline-offset-2 hover:text-stone-800 hover:underline"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Less" : "More"}
        </button>
      ) : null}
    </div>
  );
}
