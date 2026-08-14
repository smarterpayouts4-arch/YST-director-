"use client";

import type { ExtractionRun } from "@/features/content-intelligence/library/schemas/extraction-run";

export function TechnicalDetails({
  run,
  acceptedCount,
  totalCount,
}: {
  run?: ExtractionRun;
  acceptedCount: number;
  totalCount: number;
}) {
  if (!run) return null;

  return (
    <details className="rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-600 shadow-sm">
      <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-wider text-stone-500">
        Technical details
      </summary>
      <dl className="mt-3 space-y-1 text-xs text-stone-600">
        <div>
          <dt className="inline font-medium text-stone-700">Run ID: </dt>
          <dd className="inline break-all">{run.runId}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-stone-700">Prompt: </dt>
          <dd className="inline">{run.promptVersion}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-stone-700">Model: </dt>
          <dd className="inline">{run.model}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-stone-700">Quote mismatches: </dt>
          <dd className="inline">{run.validationResult.quoteMismatchCount}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-stone-700">Accepted / total: </dt>
          <dd className="inline">
            {acceptedCount} / {totalCount}
          </dd>
        </div>
        <div>
          <dt className="inline font-medium text-stone-700">Original research: </dt>
          <dd className="inline">preserved (immutable artifact)</dd>
        </div>
      </dl>
    </details>
  );
}
