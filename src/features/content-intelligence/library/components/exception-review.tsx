"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { LibraryItem } from "@/features/content-intelligence/library/schemas/library-item";

export function ExceptionReview({
  items,
  onAccept,
  onReject,
  onSaveStatement,
}: {
  items: LibraryItem[];
  onAccept: (itemId: string) => void;
  onReject: (itemId: string) => void;
  onSaveStatement: (itemId: string, statement: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
          Needs your attention
        </p>
        <p className="mt-1 text-sm text-stone-600">
          {items.length} item{items.length === 1 ? "" : "s"} need a decision — often because a quote
          could not be verified, confidence is low, or the research left a question open.
        </p>
        <p className="mt-2 text-sm text-stone-600">
          <span className="font-medium text-stone-800">Confirm</span> keeps the claim in your
          library. <span className="font-medium text-stone-800">Dismiss</span> removes it.{" "}
          <span className="font-medium text-stone-800">Edit</span> if you want to reword before
          confirming.
        </p>
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.itemId}
            className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 shadow-sm"
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              {item.kind}
              {item.quoteCleared ? " · quote not verified" : ""}
              {item.confidence === "low" ? " · low confidence" : ""}
              {item.isHypothesis ? " · hypothesis" : ""}
            </p>
            {editingId === item.itemId ? (
              <textarea
                className="mt-2 w-full min-h-[80px] rounded-md border border-stone-300 bg-white p-2 text-sm"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
            ) : (
              <p className="mt-2 text-sm text-stone-800">{item.statement}</p>
            )}
            <p className="mt-1 text-xs text-stone-500">{item.provenance}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => onAccept(item.itemId)}>
                Confirm
              </Button>
              <Button size="sm" variant="danger" onClick={() => onReject(item.itemId)}>
                Dismiss
              </Button>
              {editingId === item.itemId ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    onSaveStatement(item.itemId, draft.trim() || item.statement);
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
          </li>
        ))}
      </ul>
    </section>
  );
}
