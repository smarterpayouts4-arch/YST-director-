"use client";

import type { Dispatch, SetStateAction } from "react";
import { ClampText } from "@/features/research-prompt-builder/components/company-understanding/clamp-text";
import { forDisplay } from "@/features/research-prompt-builder/components/company-understanding/display-text";
import type { FieldDecision } from "@/features/research-prompt-builder/components/company-understanding/types";
import type { EditableField } from "@/features/research-prompt-builder/lib/profile";
import { classificationLabel } from "@/features/research-prompt-builder/lib/recognition-summary";

export function FieldBlocks({
  fields,
  decisions,
  editing,
  setDecisions,
  hideBoundaryGroupLabel,
}: {
  fields: EditableField[];
  decisions: Record<string, FieldDecision>;
  editing: boolean;
  setDecisions: Dispatch<SetStateAction<Record<string, FieldDecision>>>;
  /** When the section title already says off-limits, skip the repeated group header. */
  hideBoundaryGroupLabel?: boolean;
}) {
  const boundaryFields = fields.filter((f) => f.topicId === "boundaries");
  const otherFields = fields.filter((f) => f.topicId !== "boundaries");

  let lastGroup: string | undefined;

  return (
    <div className="space-y-5">
      {otherFields.map((item) => {
        const showGroup = Boolean(item.groupLabel && item.groupLabel !== lastGroup);
        if (item.groupLabel) lastGroup = item.groupLabel;
        const showFieldLabel = !item.groupLabel || item.label !== item.groupLabel;
        const value = decisions[item.key]?.value || item.field.value;
        return (
          <div key={item.key} className="space-y-1.5">
            {showGroup ? (
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                {item.groupLabel}
              </p>
            ) : null}
            {showFieldLabel ? (
              <span className="block text-[11px] font-bold uppercase tracking-wider text-stone-400">
                {item.label}
              </span>
            ) : null}
            <span className="block text-[11px] text-stone-400">
              {classificationLabel(item.field.classification)}
            </span>
            {editing ? (
              <textarea
                className="min-h-[96px] w-full rounded-xl border border-stone-300 bg-white p-3.5 text-sm leading-relaxed text-stone-800 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={decisions[item.key]?.value ?? item.field.value}
                onChange={(e) =>
                  setDecisions((prev) => ({
                    ...prev,
                    [item.key]: {
                      status: "corrected",
                      value: e.target.value,
                    },
                  }))
                }
              />
            ) : (
              <ClampText text={value} />
            )}
          </div>
        );
      })}

      {boundaryFields.length > 0 ? (
        <div className="space-y-2">
          {!hideBoundaryGroupLabel ? (
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Off-limits
            </p>
          ) : null}
          {!editing ? (
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-snug text-stone-700">
              {boundaryFields.map((item) => (
                <li key={item.key}>
                  {forDisplay(decisions[item.key]?.value || item.field.value)}
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-2.5">
              {boundaryFields.map((item) => (
                <div key={item.key} className="space-y-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    {item.label}
                  </span>
                  <textarea
                    className="min-h-[72px] w-full rounded-lg border border-stone-300 bg-white p-2.5 text-sm leading-snug text-stone-800 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={decisions[item.key]?.value ?? item.field.value}
                    onChange={(e) =>
                      setDecisions((prev) => ({
                        ...prev,
                        [item.key]: {
                          status: "corrected",
                          value: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
