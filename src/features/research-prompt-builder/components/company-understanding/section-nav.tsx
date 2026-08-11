"use client";

import type { FieldDecision } from "@/features/research-prompt-builder/components/company-understanding/types";
import {
  sectionIsReviewed,
  type ProfileSection,
} from "@/features/research-prompt-builder/lib/profile";

export function SectionNav({
  sections,
  activeIndex,
  decisions,
  sectionConfirmed,
  reviewedCount,
  onOpenSection,
}: {
  sections: ProfileSection[];
  activeIndex: number;
  decisions: Record<string, FieldDecision>;
  sectionConfirmed: Record<string, boolean>;
  reviewedCount: number;
  onOpenSection: (index: number, section: ProfileSection) => void;
}) {
  return (
    <nav
      aria-label="Profile sections"
      className="flex flex-col gap-3 border-b border-stone-200 bg-stone-50/70 p-4 lg:border-b-0 lg:border-r lg:border-stone-200"
    >
      <p
        className="px-1 text-[11px] font-semibold uppercase tracking-wider text-stone-500"
        data-testid="profile-progress"
      >
        {reviewedCount} of {sections.length} reviewed
      </p>
      <ol className="flex flex-1 flex-col gap-1.5">
        {sections.map((section, index) => {
          const reviewed = sectionIsReviewed(section, decisions, sectionConfirmed);
          const open = index === activeIndex;
          const waiting = !reviewed && !open && index > activeIndex;

          return (
            <li key={section.id}>
              <button
                type="button"
                data-testid="profile-topic"
                data-topic-id={section.id}
                data-state={open ? "open" : "closed"}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-colors ${
                  open
                    ? "bg-stone-900 font-medium text-white shadow-md"
                    : waiting
                      ? "cursor-not-allowed text-stone-400"
                      : "font-medium text-stone-700 hover:bg-white"
                }`}
                onClick={() => onOpenSection(index, section)}
                disabled={waiting}
                aria-current={open ? "step" : undefined}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    open
                      ? "bg-white text-stone-900"
                      : reviewed
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-stone-200/80 text-stone-600"
                  }`}
                >
                  {reviewed && !open ? "✓" : index + 1}
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium leading-snug">
                  {section.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
