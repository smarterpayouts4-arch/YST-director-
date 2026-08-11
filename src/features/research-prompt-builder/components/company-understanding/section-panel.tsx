"use client";

import type { Dispatch, RefObject, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { FieldBlocks } from "@/features/research-prompt-builder/components/company-understanding/field-blocks";
import type { FieldDecision } from "@/features/research-prompt-builder/components/company-understanding/types";
import type { EditableField, ProfileSection } from "@/features/research-prompt-builder/lib/profile";

export function SectionPanel({
  activeSection,
  activeFields,
  activeIndex,
  panelScrollRef,
  editing,
  setEditing,
  decisions,
  setDecisions,
  ownerNotes,
  setOwnerNotes,
  ready,
  onCompleteSection,
  onGoPrevious,
  onConfirmEverything,
}: {
  activeSection: ProfileSection;
  activeFields: EditableField[];
  activeIndex: number;
  panelScrollRef: RefObject<HTMLDivElement | null>;
  editing: boolean;
  setEditing: Dispatch<SetStateAction<boolean>>;
  decisions: Record<string, FieldDecision>;
  setDecisions: Dispatch<SetStateAction<Record<string, FieldDecision>>>;
  ownerNotes: string;
  setOwnerNotes: Dispatch<SetStateAction<string>>;
  ready: boolean;
  onCompleteSection: (section: ProfileSection) => void;
  onGoPrevious: () => void;
  onConfirmEverything: () => void;
}) {
  const isNotesSection = activeSection.id === "limits_and_notes";

  return (
    <section
      className="flex min-h-0 flex-col bg-white"
      aria-labelledby="active-profile-section-title"
    >
      <div
        ref={panelScrollRef}
        className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5 md:px-8 md:py-6"
      >
        <div className="flex items-center justify-between gap-4">
          <h2
            id="active-profile-section-title"
            className="text-lg font-semibold text-stone-900 md:text-xl"
          >
            {activeSection.label}
          </h2>
          {activeFields.length > 0 ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-3 text-xs text-stone-600"
              onClick={() => setEditing((v) => !v)}
            >
              {editing ? "Done" : "Edit"}
            </Button>
          ) : null}
        </div>

        <div className="space-y-5">
          {activeFields.length > 0 ? (
            <FieldBlocks
              fields={activeFields}
              decisions={decisions}
              editing={editing}
              setDecisions={setDecisions}
              hideBoundaryGroupLabel={isNotesSection}
            />
          ) : (
            <p className="text-sm text-stone-600">
              {isNotesSection ? "No off-limits found." : "Nothing found here."}
            </p>
          )}

          {isNotesSection ? (
            <details className="border-t border-stone-100 pt-4">
              <summary className="cursor-pointer list-none text-sm text-stone-500 marker:content-none hover:text-stone-800 [&::-webkit-details-marker]:hidden">
                Optional notes
              </summary>
              <textarea
                className="mt-3 min-h-[96px] w-full rounded-xl border border-stone-200 bg-stone-50/50 p-3.5 text-sm text-stone-800 shadow-sm placeholder:text-stone-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Goals, rivals, niches…"
                value={ownerNotes}
                onChange={(e) => setOwnerNotes(e.target.value)}
              />
            </details>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-stone-200 px-5 py-4 md:px-8">
        <Button
          variant="ghost"
          size="sm"
          disabled={activeIndex === 0}
          onClick={onGoPrevious}
          className="h-9 text-xs font-medium text-stone-500 hover:text-stone-900"
        >
          Back
        </Button>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {!ready ? (
            <Button
              size="sm"
              onClick={() => onCompleteSection(activeSection)}
              className="h-9 bg-stone-900 px-5 text-xs font-semibold text-white shadow-md hover:bg-stone-800"
            >
              Looks right
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCompleteSection(activeSection)}
                className="h-9 border-stone-200 px-4 text-xs"
              >
                Looks right
              </Button>
              <Button
                size="sm"
                onClick={onConfirmEverything}
                className="h-9 rounded-lg bg-indigo-600 px-5 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                Everything looks right. Continue
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
