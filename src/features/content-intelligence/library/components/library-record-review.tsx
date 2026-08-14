"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { LibraryItem } from "@/features/content-intelligence/library/schemas/library-item";
import type { IntelligenceKind } from "@/features/content-intelligence/library/schemas/enums";

const KINDS: IntelligenceKind[] = [
  "fact",
  "audience",
  "moment",
  "tension",
  "opportunity",
  "demand",
  "competitor",
  "restriction",
  "unresolved",
  "limitation",
  "other",
];

export function LibraryRecordReview({
  items,
  onUpdate,
  onAdd,
}: {
  items: LibraryItem[];
  onUpdate: (itemId: string, patch: Partial<LibraryItem>) => void;
  onAdd: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
          All records (advanced)
        </p>
        <Button size="sm" variant="outline" onClick={onAdd}>
          Add item
        </Button>
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.itemId}
            className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  {item.kind} · {item.origin} · {item.confidence} · {item.reviewStatus}
                  {item.quoteCleared ? " · quoteCleared" : ""}
                  {item.isHypothesis ? " · hypothesis" : ""}
                </p>
                {editingId === item.itemId ? (
                  <textarea
                    className="mt-1 w-full min-h-[80px] rounded-md border border-stone-300 p-2 text-sm"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                ) : (
                  <p className="text-sm text-stone-800">{item.statement}</p>
                )}
                <p className="text-xs text-stone-500">Provenance: {item.provenance}</p>
                {item.evidenceQuote ? (
                  <p className="text-xs italic text-stone-600">“{item.evidenceQuote}”</p>
                ) : null}
              </div>
              <div className="flex flex-col gap-2">
                <select
                  className="rounded-md border border-stone-300 bg-white px-2 py-1 text-xs"
                  value={item.kind}
                  onChange={(e) =>
                    onUpdate(item.itemId, { kind: e.target.value as IntelligenceKind })
                  }
                >
                  {KINDS.map((kind) => (
                    <option key={kind} value={kind}>
                      {kind}
                    </option>
                  ))}
                </select>
                <div className="flex flex-wrap gap-1">
                  <Button
                    size="sm"
                    variant={item.reviewStatus === "accepted" ? "default" : "outline"}
                    onClick={() => onUpdate(item.itemId, { reviewStatus: "accepted" })}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant={item.reviewStatus === "rejected" ? "danger" : "outline"}
                    onClick={() => onUpdate(item.itemId, { reviewStatus: "rejected" })}
                  >
                    Reject
                  </Button>
                  {editingId === item.itemId ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        onUpdate(item.itemId, {
                          statement: draft.trim() || item.statement,
                        });
                        setEditingId(null);
                      }}
                    >
                      Save
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(item.itemId);
                        setDraft(item.statement);
                      }}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
