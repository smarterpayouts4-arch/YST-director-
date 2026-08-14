"use client";

import { Button } from "@/components/ui/button";
import type { TopicDirection } from "@/features/content-intelligence/topics/schemas/direction";

export function DirectionCards({
  directions,
  busy,
  onExplore,
}: {
  directions: TopicDirection[];
  busy?: boolean;
  onExplore: (territoryId: string) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {directions.map((d) => (
        <article
          key={d.territoryId}
          className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-medium text-stone-900">{d.name}</h3>
            {d.priority === 1 ? (
              <span className="shrink-0 rounded-md bg-success-soft px-2 py-0.5 text-[11px] font-medium text-[var(--brand-charcoal)]">
                Recommended
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-stone-600">{d.description}</p>
          <p className="mt-3 text-xs text-stone-500">
            <span className="font-medium text-stone-700">Core question:</span>{" "}
            {d.decisionQuestion}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            <span className="font-medium text-stone-700">Audience / moment:</span>{" "}
            {d.primaryAudience} · {d.primaryMoment}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            <span className="font-medium text-stone-700">Tension / opportunity:</span>{" "}
            {d.primaryTension} · {d.primaryOpportunity}
          </p>
          <p className="mt-2 text-xs capitalize text-stone-500">
            Evidence: {d.confidence}
            {d.hypothesisDependent ? " · Hypothesis-sensitive" : ""}
            {d.unresolvedDependent ? " · Unresolved open" : ""}
          </p>
          <div className="mt-4 grow" />
          <Button
            size="sm"
            disabled={busy}
            onClick={() => onExplore(d.territoryId)}
          >
            Explore direction
          </Button>
        </article>
      ))}
    </div>
  );
}
