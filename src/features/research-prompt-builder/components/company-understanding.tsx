"use client";

import { forDisplay } from "@/features/research-prompt-builder/components/company-understanding/display-text";
import { RecognitionPanel } from "@/features/research-prompt-builder/components/company-understanding/recognition-panel";
import { SectionNav } from "@/features/research-prompt-builder/components/company-understanding/section-nav";
import { SectionPanel } from "@/features/research-prompt-builder/components/company-understanding/section-panel";
import { useSectionReview } from "@/features/research-prompt-builder/components/company-understanding/use-section-review";
import type { CompanyUnderstanding } from "@/features/research-prompt-builder/types";
import { buildConfirmedProfile } from "@/features/research-prompt-builder/lib/profile";

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
  const review = useSectionReview(understanding);

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
      <header className="space-y-1.5">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
          Step 2 of 5 · {review.reviewedCount}/{review.sections.length}
        </p>
        <h1 className="editorial text-3xl font-normal leading-tight text-stone-900 md:text-4xl">
          Here’s what we understand
        </h1>
        <p className="text-sm font-medium text-stone-700 md:text-base">
          Look at what we understood from what you gave us. Correct anything we missed.
        </p>
      </header>

      <RecognitionPanel understanding={understanding} />

      {warnings?.length ? (
        <div className="border-l-2 border-amber-600 pl-4 text-sm text-amber-800">
          {warnings.map((w) => (
            <p key={w}>{forDisplay(w)}</p>
          ))}
        </div>
      ) : null}

      {/* One workspace shell: equal-height columns, shared border — fills available width */}
      <div className="grid min-h-[min(720px,calc(100dvh-11rem))] overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm lg:grid-cols-[300px_minmax(0,1fr)]">
        <SectionNav
          sections={review.sections}
          activeIndex={review.activeIndex}
          decisions={review.decisions}
          sectionConfirmed={review.sectionConfirmed}
          reviewedCount={review.reviewedCount}
          onOpenSection={review.openSection}
        />

        {review.activeSection ? (
          <SectionPanel
            activeSection={review.activeSection}
            activeFields={review.activeFields}
            activeIndex={review.activeIndex}
            panelScrollRef={review.panelScrollRef}
            editing={review.editing}
            setEditing={review.setEditing}
            decisions={review.decisions}
            setDecisions={review.setDecisions}
            ownerNotes={review.ownerNotes}
            setOwnerNotes={review.setOwnerNotes}
            ready={review.ready}
            onCompleteSection={review.completeSection}
            onGoPrevious={review.goPrevious}
            onConfirmEverything={() => onConfirm(review.buildProfile())}
          />
        ) : null}
      </div>
    </div>
  );
}
