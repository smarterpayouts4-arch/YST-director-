"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { CompanyUnderstanding } from "@/features/research-prompt-builder/types";
import {
  buildConfirmedProfile,
  getUnderstandingFields,
  materialFieldsReady,
} from "@/features/research-prompt-builder/lib/profile";

const MATERIAL_KEYS = [
  "companyName",
  "industry",
  "offer",
  "customerProblem",
  "likelyAudience",
  "websiteAction",
  "geography",
];

export function CompanyUnderstandingView({
  understanding,
  warnings,
  onConfirm,
}: {
  understanding: CompanyUnderstanding;
  warnings?: string[];
  onConfirm: ReturnType<typeof buildConfirmedProfile> extends infer T
    ? (profile: T) => void
    : never;
}) {
  const fields = useMemo(() => getUnderstandingFields(understanding), [understanding]);
  const [decisions, setDecisions] = useState<
    Record<string, { status: "confirmed" | "corrected" | "rejected" | "unresolved"; value: string }>
  >(() =>
    Object.fromEntries(
      fields.map((f) => [f.key, { status: "unresolved" as const, value: f.field.value }]),
    ),
  );

  const ready = materialFieldsReady(decisions, MATERIAL_KEYS);

  return (
    <div className="mx-auto max-w-[1040px] space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.16em] text-stone-500">
          Step 2 of 5
        </p>
        <h1 className="editorial mt-3 text-4xl text-stone-900 md:text-5xl">
          Confirm what we understood
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-stone-600">
          {understanding.ingestionSummary}
        </p>
      </div>

      {warnings?.length ? (
        <div className="border-l-2 border-amber-600 pl-4 text-sm text-amber-800">
          {warnings.map((w) => (
            <p key={w}>{w}</p>
          ))}
        </div>
      ) : null}

      <div className="space-y-6">
        {fields.map((item) => {
          const decision = decisions[item.key];
          return (
            <section key={item.key} className="border-b border-[var(--border)] pb-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-medium text-stone-900">{item.label}</h2>
                  <p className="mt-1 text-xs uppercase tracking-wide text-stone-500">
                    {item.field.classification.replaceAll("_", " ")} · {item.field.confidence} confidence
                    {item.field.evidence[0]
                      ? ` · evidence ${item.field.evidence[0].ref}`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={decision.status === "confirmed" ? "default" : "outline"}
                    onClick={() =>
                      setDecisions((prev) => ({
                        ...prev,
                        [item.key]: { ...prev[item.key], status: "confirmed" },
                      }))
                    }
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant={decision.status === "rejected" ? "danger" : "outline"}
                    onClick={() =>
                      setDecisions((prev) => ({
                        ...prev,
                        [item.key]: { ...prev[item.key], status: "rejected" },
                      }))
                    }
                  >
                    Reject
                  </Button>
                </div>
              </div>
              <textarea
                className="mt-3 min-h-24 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
                value={decision.value}
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
            </section>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button
          disabled={!ready}
          onClick={() => onConfirm(buildConfirmedProfile(understanding, decisions))}
        >
          Continue to interview
        </Button>
      </div>
    </div>
  );
}
