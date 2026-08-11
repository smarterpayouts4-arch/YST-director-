"use client";

import { useMemo } from "react";
import { forDisplay } from "@/features/research-prompt-builder/components/company-understanding/display-text";
import type { CompanyUnderstanding } from "@/features/research-prompt-builder/types";
import {
  RECOGNITION_BUCKET_LABELS,
  selectRecognitionItems,
  type RecognitionBucketId,
} from "@/features/research-prompt-builder/lib/recognition-summary";

export function RecognitionPanel({
  understanding,
}: {
  understanding: CompanyUnderstanding;
}) {
  const recognitionItems = useMemo(
    () => selectRecognitionItems(understanding),
    [understanding],
  );
  const recognitionByBucket = useMemo(() => {
    const map = new Map<RecognitionBucketId, string[]>();
    for (const item of recognitionItems) {
      const list = map.get(item.bucket) ?? [];
      list.push(item.text);
      map.set(item.bucket, list);
    }
    return map;
  }, [recognitionItems]);

  return (
    <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-base leading-relaxed text-stone-800 md:text-[17px]">
        {forDisplay(understanding.ingestionSummary)}
      </p>
      {recognitionItems.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3">
          {(
            [
              "supported_by_file",
              "worth_checking",
              "research_should_investigate",
            ] as const
          ).map((bucket) => {
            const items = recognitionByBucket.get(bucket) ?? [];
            if (items.length === 0) return null;
            return (
              <div key={bucket} className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  {RECOGNITION_BUCKET_LABELS[bucket]}
                </p>
                <ul className="list-disc space-y-1.5 pl-4 text-sm leading-snug text-stone-700">
                  {items.map((text) => (
                    <li key={text}>{forDisplay(text)}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      ) : null}
      <p className="text-sm font-medium text-stone-600">Review the details</p>
    </section>
  );
}
