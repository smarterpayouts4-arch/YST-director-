"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { TopicOpportunity } from "@/features/content-intelligence/topics/schemas/topic-opportunity";

export function TopicOpportunityGrid({
  directionName,
  topics,
  onSelect,
}: {
  directionName: string;
  topics: TopicOpportunity[];
  onSelect: (topicId: string) => void;
}) {
  const [briefId, setBriefId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-stone-800">{directionName}</p>
        <p className="text-sm text-stone-600">6 topic opportunities</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((t) => {
          const open = briefId === t.topicId;
          return (
            <article
              key={t.topicId}
              className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-medium text-stone-900">{t.title}</h3>
                {t.priority === 1 ? (
                  <span className="shrink-0 rounded-md bg-success-soft px-2 py-0.5 text-[11px] font-medium text-[var(--brand-charcoal)]">
                    Recommended
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-stone-600">{t.premise}</p>
              <p className="mt-3 text-xs text-stone-500">
                {t.audience} · {t.customerMoment}
              </p>
              <p className="mt-1 text-xs text-stone-500">
                <span className="font-medium text-stone-700">Tension:</span>{" "}
                {t.primaryTension}
              </p>
              <p className="mt-2 text-sm text-stone-700">{t.whyItMatters}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {t.confidence === "high" ? (
                  <Chip>Strong evidence</Chip>
                ) : null}
                {t.priority === 2 ? <Chip>High priority</Chip> : null}
                {t.hypothesisDependencies.length > 0 ? (
                  <Chip>Hypothesis-dependent</Chip>
                ) : null}
                {t.restrictionItemIds.length > 0 ? (
                  <Chip>Restriction-sensitive</Chip>
                ) : null}
              </div>
              {open ? (
                <div className="mt-3 space-y-1 border-t border-stone-100 pt-3 text-xs text-stone-600">
                  <p>
                    <span className="font-medium text-stone-800">Takeaway:</span>{" "}
                    {t.desiredTakeaway}
                  </p>
                  <p>
                    <span className="font-medium text-stone-800">Opportunity:</span>{" "}
                    {t.opportunity}
                  </p>
                  {t.hypothesisDependencies.length > 0 ? (
                    <p>
                      <span className="font-medium text-stone-800">Hypotheses:</span>{" "}
                      {t.hypothesisDependencies.join("; ")}
                    </p>
                  ) : null}
                  {t.unresolvedAssumptions.length > 0 ? (
                    <p>
                      <span className="font-medium text-stone-800">Unresolved:</span>{" "}
                      {t.unresolvedAssumptions.join("; ")}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBriefId(open ? null : t.topicId)}
                >
                  {open ? "Hide brief" : "View brief"}
                </Button>
                <Button size="sm" onClick={() => onSelect(t.topicId)}>
                  Select topic
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700">
      {children}
    </span>
  );
}
