"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const STEPS = [
  "Reading file",
  "Finding company signals",
  "Separating facts from guesses",
  "Ready to confirm",
];

export function IngestionDropzone({
  busy,
  error,
  onAnalyze,
  onUseSample,
}: {
  busy: boolean;
  error?: string | null;
  onAnalyze: (file: File) => Promise<void>;
  onUseSample: () => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const pick = (next: File | null) => {
    setFile(next);
  };

  const analyze = async () => {
    if (!file) return;
    setStepIndex(0);
    const timer = window.setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 900);
    try {
      await onAnalyze(file);
    } finally {
      window.clearInterval(timer);
    }
  };

  return (
    <div className="mx-auto max-w-[1040px] space-y-7">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
          Step 1 of 5
        </p>
        <h1 className="editorial mt-2 text-4xl leading-tight text-stone-900 md:text-5xl">
          Upload your company information
        </h1>
        <p className="mt-3 max-w-xl text-base text-stone-600">
          One CSV in. One ChatGPT research prompt out.
        </p>
      </div>

      <div
        className="rounded-xl border border-dashed border-stone-300 bg-white/70 px-6 py-12 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          pick(e.dataTransfer.files?.[0] ?? null);
        }}
      >
        <p className="text-base text-stone-800">Drop a CSV here</p>
        <p className="mt-1 text-sm text-stone-500">.csv · max 5 MB · not stored as the raw file</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
            Browse CSV
          </Button>
          <Button type="button" variant="outline" onClick={onUseSample} disabled={busy}>
            Use sample ZYNAVA CSV
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(e) => pick(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <p className="mt-4 text-sm text-stone-700">
            Selected: {file.name} ({Math.round(file.size / 1024)} KB)
          </p>
        ) : null}
      </div>

      <p className="text-xs text-stone-500">
        Do not upload secrets, regulated records, or personal data.
      </p>

      {busy ? (
        <div className="space-y-2" aria-live="polite">
          {STEPS.map((step, i) => (
            <p
              key={step}
              className={i <= stepIndex ? "text-stone-800" : "text-stone-400"}
            >
              {i <= stepIndex ? "•" : "○"} {step}
            </p>
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button type="button" onClick={analyze} disabled={!file || busy}>
          {busy ? "Analyzing…" : "Analyze company"}
        </Button>
      </div>
    </div>
  );
}
