"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { LibraryItem } from "@/features/content-intelligence/library/schemas/library-item";
import type { IntelligenceKind } from "@/features/content-intelligence/library/schemas/enums";

const SUMMARY_GROUPS: { title: string; kinds: IntelligenceKind[] }[] = [
  { title: "Strongest opportunities", kinds: ["opportunity"] },
  { title: "Audiences & moments", kinds: ["audience", "moment"] },
  { title: "Important tensions", kinds: ["tension"] },
  { title: "Restrictions", kinds: ["restriction"] },
  { title: "Unresolved questions", kinds: ["unresolved"] },
  { title: "Demand & competitors", kinds: ["demand", "competitor"] },
  { title: "Facts & limitations", kinds: ["fact", "limitation", "other"] },
];

export function IntelligenceSummary({
  items,
  needsAttentionCount,
  isReady,
  continueHref,
}: {
  items: LibraryItem[];
  needsAttentionCount: number;
  isReady: boolean;
  /** When ready, primary CTA to Topic Engine */
  continueHref?: string;
}) {
  const accepted = items.filter((i) => i.reviewStatus === "accepted");

  return (
    <section className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
          See What We Found
        </p>
        {isReady ? (
          <>
            <h2 className="editorial mt-1 text-2xl text-stone-900">
              Findings ready
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              {accepted.length} item{accepted.length === 1 ? "" : "s"} saved for topic work.
              Original research preserved unchanged.
            </p>
            {continueHref ? (
              <div className="mt-4">
                <Button asChild>
                  <Link href={continueHref}>Continue to Make Your Choice</Link>
                </Button>
              </div>
            ) : null}
          </>
        ) : (
          <>
            <h2 className="editorial mt-1 text-2xl text-stone-900">Research processed</h2>
            <p className="mt-1 text-sm text-stone-600">
              Below is what already looks solid. Then resolve{" "}
              {needsAttentionCount} item{needsAttentionCount === 1 ? "" : "s"} that still need your
              call — Confirm to keep, Dismiss to drop. When that list is empty, findings are ready
              for Make Your Choice.
            </p>
          </>
        )}
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
          What we learned
        </p>
        <div className="mt-3 space-y-4">
          {SUMMARY_GROUPS.map((group) => {
            const groupItems = accepted.filter((i) => group.kinds.includes(i.kind));
            if (groupItems.length === 0) return null;
            return (
              <div key={group.title}>
                <p className="text-sm font-medium text-stone-800">{group.title}</p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-stone-700">
                  {groupItems.slice(0, 6).map((item) => (
                    <li key={item.itemId}>
                      {item.statement}
                      {item.isHypothesis ? (
                        <span className="text-stone-500"> (hypothesis)</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          {accepted.length === 0 ? (
            <p className="text-sm text-stone-600">
              No clean items auto-staged yet — resolve items that need attention below.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
