"use client";

import { STAGE_LABELS, type AppStage } from "@/features/research-prompt-builder/config/constants";

const ORDER: AppStage[] = [
  "ingestion",
  "understanding",
  "interview",
  "brief",
  "prompt",
];

export function StageRail({
  stage,
  whyThisMatters,
  questionProgress,
}: {
  stage: AppStage;
  whyThisMatters?: string;
  questionProgress?: string;
}) {
  const index = ORDER.indexOf(stage) + 1;
  return (
    <aside className="flex w-full flex-col justify-between bg-[var(--rail)] px-5 py-6 text-white md:min-h-screen md:w-[240px] md:shrink-0">
      <div className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--rail-muted)]">
            Research Prompt Builder
          </p>
          <p className="mt-3 text-3xl font-light">
            {String(index).padStart(2, "0")} / 05
          </p>
          <p className="mt-2 text-sm text-[var(--rail-muted)]">{STAGE_LABELS[stage]}</p>
          {questionProgress ? (
            <p className="mt-1 text-sm text-white/80">{questionProgress}</p>
          ) : null}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--rail-muted)]">
            Why this matters
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/85">
            {whyThisMatters ??
              "A precise research prompt starts with confirmed business truth and a few material decisions."}
          </p>
        </div>
      </div>
      <ol className="mt-10 space-y-2 text-xs text-[var(--rail-muted)] md:mt-0">
        {ORDER.map((item, i) => (
          <li
            key={item}
            className={item === stage ? "text-white" : undefined}
          >
            {String(i + 1).padStart(2, "0")} {STAGE_LABELS[item]}
          </li>
        ))}
      </ol>
    </aside>
  );
}
