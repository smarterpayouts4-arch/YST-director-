"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { provenanceLabel } from "@/features/research-prompt-builder/lib/brief-provenance";
import type { ResearchBrief } from "@/features/research-prompt-builder/types";

type FieldDef = {
  key: keyof ResearchBrief;
  label: string;
  kind: "text" | "lines";
};

type BriefSection = {
  id: string;
  navLabel: string;
  title: string;
  purpose: string;
  fields: FieldDef[];
  includePlatform?: boolean;
};

const SECTIONS: BriefSection[] = [
  {
    id: "audience",
    navLabel: "Audience",
    title: "Who we’re helping",
    purpose: "Moment, reward, and what to pressure-test.",
    fields: [
      { key: "customerMoment", label: "Customer moment", kind: "text" },
      { key: "viewerReward", label: "Viewer reward", kind: "text" },
      { key: "challengeHypothesis", label: "Challenge hypothesis", kind: "text" },
    ],
  },
  {
    id: "story",
    navLabel: "Bet",
    title: "The strategic bet",
    purpose: "Content direction for the research.",
    fields: [
      { key: "contentHypothesis", label: "Content hypothesis", kind: "text" },
      { key: "executionContext", label: "Execution context", kind: "lines" },
    ],
  },
  {
    id: "company",
    navLabel: "Company",
    title: "Company and channel",
    purpose: "Truth, next step, and primary platform.",
    fields: [
      { key: "companyTruth", label: "Company truth", kind: "text" },
      { key: "businessBridge", label: "Business bridge", kind: "text" },
    ],
    includePlatform: true,
  },
  {
    id: "guardrails",
    navLabel: "Guardrails",
    title: "Guardrails",
    purpose: "Hard boundaries and open unknowns.",
    fields: [
      { key: "trustBoundaries", label: "Trust boundaries", kind: "lines" },
      { key: "unresolvedUnknowns", label: "Unresolved unknowns", kind: "lines" },
    ],
  },
];

function fieldText(brief: ResearchBrief, field: FieldDef): string {
  if (field.kind === "lines") {
    return (brief[field.key] as string[]).join("\n");
  }
  return brief[field.key] as string;
}

const editClassName =
  "min-h-[88px] max-h-[220px] w-full resize-y rounded-lg border border-stone-300 bg-white p-2.5 text-sm leading-snug text-stone-800 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export function ResearchBriefEditor({
  brief,
  busy,
  error,
  onChange,
  onGenerate,
}: {
  brief: ResearchBrief;
  busy: boolean;
  error?: string | null;
  onChange: (brief: ResearchBrief) => void;
  onGenerate: () => void;
}) {
  const [local, setLocal] = useState(brief);
  const [activeIndex, setActiveIndex] = useState(0);
  const [editing, setEditing] = useState(false);
  const panelScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocal(brief);
  }, [brief]);

  useEffect(() => {
    panelScrollRef.current?.scrollTo({ top: 0 });
    setEditing(false);
  }, [activeIndex]);

  const update = <K extends keyof ResearchBrief>(key: K, value: ResearchBrief[K]) => {
    const next = { ...local, [key]: value };
    setLocal(next);
    onChange(next);
  };

  const active = SECTIONS[activeIndex] ?? SECTIONS[0];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
            Step 4 of 5
          </p>
          <h1 className="editorial text-3xl font-normal leading-tight text-stone-900 md:text-4xl">
            Approve the research brief
          </h1>
          <p className="text-sm text-stone-600">
            One section at a time. Then generate the prompt.
          </p>
        </div>
        <p className="text-sm font-semibold text-stone-500" data-testid="brief-progress">
          Section {activeIndex + 1} of {SECTIONS.length}
        </p>
      </header>

      {/*
        Same pattern as Step 2: section rail + one panel + fixed desktop height.
        Stops the brief from becoming an endless scrolling form wall.
      */}
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:h-[min(640px,calc(100dvh-12rem))] lg:min-h-[480px]">
        <nav
          aria-label="Brief sections"
          className="flex h-fit flex-col gap-1 rounded-2xl border border-[var(--border)] bg-white p-3 shadow-sm lg:self-start"
        >
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
            Sections
          </p>
          <ol className="space-y-1">
            {SECTIONS.map((section, index) => {
              const open = index === activeIndex;
              return (
                <li key={section.id}>
                  <button
                    type="button"
                    data-testid="brief-section"
                    data-section-id={section.id}
                    data-state={open ? "open" : "closed"}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                      open
                        ? "bg-stone-900 font-medium text-white shadow-md"
                        : "font-medium text-stone-700 hover:bg-stone-50"
                    }`}
                    onClick={() => setActiveIndex(index)}
                    aria-current={open ? "true" : undefined}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        open ? "bg-white text-stone-900" : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1 text-xs leading-snug sm:text-sm">
                      {section.navLabel}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <section
          className="flex flex-col lg:h-full lg:min-h-0 lg:overflow-hidden"
          aria-labelledby="active-brief-section-title"
        >
          <div
            ref={panelScrollRef}
            className="space-y-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain lg:pr-1"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h2
                  id="active-brief-section-title"
                  className="text-base font-semibold text-stone-900 md:text-lg"
                >
                  {active.title}
                </h2>
                <p className="text-xs leading-snug text-stone-500 sm:text-sm">
                  {active.purpose}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-7 shrink-0 border-stone-200 px-2.5 text-xs text-stone-600"
                onClick={() => setEditing((v) => !v)}
              >
                {editing ? "Done editing" : "Edit"}
              </Button>
            </div>

            <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm md:p-4">
              {active.fields.map((field) => {
                const text = fieldText(local, field);
                return (
                  <div key={String(field.key)} className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      {field.label}
                    </p>
                    {editing ? (
                      <textarea
                        className={editClassName}
                        value={text}
                        onChange={(e) => {
                          if (field.kind === "lines") {
                            update(
                              field.key,
                              e.target.value
                                .split("\n")
                                .map((line) => line.trim())
                                .filter(Boolean) as ResearchBrief[typeof field.key],
                            );
                          } else {
                            update(
                              field.key,
                              e.target.value as ResearchBrief[typeof field.key],
                            );
                          }
                        }}
                      />
                    ) : field.kind === "lines" ? (
                      <ul className="list-disc space-y-1.5 pl-5 text-sm leading-snug text-stone-800">
                        {(local[field.key] as string[]).map((line) => (
                          <li key={line.slice(0, 48)}>{line}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="rounded-lg bg-stone-50/50 p-2.5 text-sm leading-snug text-stone-800">
                        {text}
                      </p>
                    )}
                  </div>
                );
              })}

              {active.includePlatform ? (
                <div className="space-y-2 border-t border-stone-100 pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    Primary platform
                  </p>
                  {editing ? (
                    <div className="space-y-2">
                      <input
                        className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
                        value={local.primaryPlatform.value}
                        onChange={(e) =>
                          update("primaryPlatform", {
                            ...local.primaryPlatform,
                            value: e.target.value,
                          })
                        }
                      />
                      <textarea
                        className={editClassName}
                        value={local.primaryPlatform.rationale}
                        onChange={(e) =>
                          update("primaryPlatform", {
                            ...local.primaryPlatform,
                            rationale: e.target.value,
                          })
                        }
                      />
                    </div>
                  ) : (
                    <div className="space-y-1 rounded-lg bg-stone-50/50 p-2.5">
                      <p className="text-sm font-medium text-stone-900">
                        {local.primaryPlatform.value}
                      </p>
                      <p className="text-sm leading-snug text-stone-700">
                        {local.primaryPlatform.rationale}
                      </p>
                      <p className="text-[11px] text-stone-500">
                        {provenanceLabel(local.fieldProvenance.primaryPlatform.origin)}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-3 flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-stone-200 bg-[var(--canvas)] pt-3">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={activeIndex === 0}
                onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                className="h-8 text-xs text-stone-500"
              >
                Previous
              </Button>
              {activeIndex < SECTIONS.length - 1 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveIndex((i) => i + 1)}
                  className="h-8 border-stone-200 text-xs"
                >
                  Next section
                </Button>
              ) : null}
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-stretch gap-2 sm:items-end">
              {error ? (
                <p className="max-w-xl whitespace-pre-wrap break-words text-left text-sm text-red-700 sm:text-right">
                  {error}
                </p>
              ) : null}
              <Button onClick={onGenerate} disabled={busy} className="h-8 self-end text-xs">
                {busy ? "Generating…" : "Generate research prompt"}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
