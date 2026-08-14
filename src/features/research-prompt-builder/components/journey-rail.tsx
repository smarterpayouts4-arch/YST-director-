"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  journeyChapterById,
  type JourneyChapter,
} from "@/features/research-prompt-builder/config/journey-chapters";
import {
  journeyStepById,
  type JourneyStep,
  type JourneyStepId,
} from "@/features/research-prompt-builder/config/journey-steps";
import {
  railPresentation,
  type ChapterLifecycle,
} from "@/features/research-prompt-builder/components/rail-presentation";

export type JourneyRailProps = {
  activeId: JourneyStepId;
  /** Optional interview-stage progress line under the summary. */
  detailLine?: string;
  /**
   * When true with an active Research-or-later step, collapse Research into a
   * completed chapter and emphasize Social Media as next (header: next-chapter).
   * Wire from Topic Engine when the Topic Packet is present (`onAtom`).
   */
  researchSettled?: boolean;
  /**
   * When true on Social Media hub or a live channel page: Social Media is
   * Current (no Coming next / Next chapter fluff).
   */
  channelActive?: boolean;
  /** Social Media chapter link; defaults to `/social-media`. Append Atom ids when available. */
  socialMediaHref?: string;
};

type StepState = "completed" | "current" | "upcoming";

function stepState(step: number, activeStep: number): StepState {
  if (step < activeStep) return "completed";
  if (step === activeStep) return "current";
  return "upcoming";
}

function stepsForChapter(chapter: JourneyChapter): JourneyStep[] {
  return chapter.stepIds.map((id) => journeyStepById(id));
}

function Chevron({
  open,
  tone = "card",
}: {
  open: boolean;
  tone?: "card" | "rail";
}) {
  const color =
    tone === "card"
      ? "text-[var(--rail-card-muted)]"
      : "text-[var(--rail-muted)]";
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className={`h-3.5 w-3.5 shrink-0 ${color} transition-transform ${open ? "" : "rotate-180"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M4 10l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UploadGlyph() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-7 w-7 text-[var(--rail-card-muted)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <path
        d="M8 4h5l3 3v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
        strokeLinejoin="round"
      />
      <path d="M13 4v3h3" strokeLinejoin="round" />
      <path d="M12 17V10m0 0l-2.5 2.5M12 10l2.5 2.5" strokeLinecap="round" />
    </svg>
  );
}

function StepNode({ state }: { state: StepState }) {
  if (state === "completed") {
    return (
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--rail-accent)] text-[10px] text-white"
        aria-hidden
      >
        ✓
      </span>
    );
  }
  return (
    <span
      className="flex h-5 w-5 shrink-0 items-center justify-center"
      aria-hidden
    >
      <span className="h-2.5 w-2.5 rounded-full border border-[var(--rail-muted)] bg-transparent" />
    </span>
  );
}

function CompactRow({
  step,
  state,
}: {
  step: JourneyStep;
  state: StepState;
}) {
  const muted = state === "upcoming";
  return (
    <div
      className={`flex items-start gap-3 py-2.5 text-[13px] leading-snug ${
        muted
          ? "text-[var(--rail-muted)]"
          : "text-[var(--rail-foreground)]"
      }`}
    >
      <StepNode state={state} />
      <span className="mt-px shrink-0 tabular-nums tracking-wide opacity-80">
        {String(step.step).padStart(2, "0")}
      </span>
      <span
        className={`min-w-0 font-medium ${
          state === "completed" ? "text-[var(--rail-foreground)]" : undefined
        }`}
      >
        {step.customerLabel}
      </span>
    </div>
  );
}

function ExpandedCard({ step }: { step: JourneyStep }) {
  const num = String(step.step).padStart(2, "0");
  return (
    <div className="relative my-1 overflow-hidden rounded-xl border border-[var(--rail-card-border)] bg-[var(--rail-card)] shadow-sm">
      <div
        className="absolute inset-y-0 left-0 w-0.5 bg-[var(--rail-card-accent)]"
        aria-hidden
      />
      <div className="flex items-start justify-between gap-2 px-3.5 py-3 pl-4">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--rail-card-border)] bg-[var(--rail-card)] text-[11px] font-semibold text-[var(--rail-card-foreground)]">
            {num}
          </span>
          <span className="text-[13px] font-semibold leading-snug text-[var(--rail-card-foreground)]">
            {step.customerLabel}
          </span>
        </div>
        <Chevron open />
      </div>
      <div className="space-y-2.5 px-4 pb-3.5 pt-0">
        {step.id === "ingestion" ? <UploadGlyph /> : null}
        <p className="text-[12px] leading-relaxed text-[var(--rail-card-muted)]">
          {step.expandedDescription}
        </p>
        {step.meta ? (
          <p className="text-[11px] leading-snug text-[var(--rail-card-muted)]">
            {step.meta}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function SoftForwardDivider() {
  return (
    <div className="flex items-center gap-2 py-3" role="separator">
      <div className="h-px flex-1 bg-[var(--rail-connector)]" />
      <p className="shrink-0 text-[9px] font-medium uppercase tracking-[0.14em] text-[var(--rail-muted)]">
        Research happens here
      </p>
      <div className="h-px flex-1 bg-[var(--rail-connector)]" />
    </div>
  );
}

function ChapterLabel({
  children,
  muted = false,
}: {
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <p
      className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${
        muted ? "text-[var(--rail-muted)]" : "text-[var(--rail-foreground)]"
      }`}
    >
      {children}
    </p>
  );
}

function CompletedChapterCard({
  chapter,
  expanded,
  onToggle,
  steps,
}: {
  chapter: JourneyChapter;
  expanded: boolean;
  onToggle: () => void;
  steps: JourneyStep[];
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3">
      <div className="flex items-start gap-2">
        <span
          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--rail-accent)] text-[10px] text-white"
          aria-hidden
        >
          ✓
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--rail-foreground)]">
            {chapter.completionTitle}
          </p>
          {chapter.completionSummary ? (
            <p className="mt-1 text-[12px] leading-relaxed text-[var(--rail-muted)]">
              {chapter.completionSummary}
            </p>
          ) : null}
          <button
            type="button"
            onClick={onToggle}
            className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--rail-foreground)]/85 hover:text-[var(--rail-foreground)]"
            aria-expanded={expanded}
          >
            {expanded ? "Hide completed steps" : "View completed steps"}
            <Chevron open={expanded} tone="rail" />
          </button>
        </div>
      </div>
      {expanded ? (
        <ol className="mt-3 space-y-0.5 border-t border-white/10 pt-2">
          {steps.map((step) => (
            <li key={step.id}>
              <CompactRow step={step} state="completed" />
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

/**
 * Durable chapter shell for future / hub chapters (Social Media).
 * States: upcoming → current → complete. Emphasized next is still upcoming.
 * Social Media chapter links to `/social-media` hub; no numbered step 09.
 */
function ChapterShell({
  chapter,
  state,
  emphasizedNext = false,
  socialMediaHref = "/social-media",
}: {
  chapter: JourneyChapter;
  state: ChapterLifecycle;
  emphasizedNext?: boolean;
  socialMediaHref?: string;
}) {
  const emphasized = state === "current" || emphasizedNext;
  const showComingNext = chapter.kind === "future" && state === "upcoming";

  return (
    <div
      className={`rounded-lg px-3 py-3 ${
        emphasized
          ? "border border-[var(--rail-card-border)]/50 bg-white/[0.06]"
          : "border border-transparent"
      }`}
    >
      {showComingNext ? (
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--rail-muted)]">
          Coming next
        </p>
      ) : null}
      {state === "current" ? (
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--rail-muted)]">
          Current
        </p>
      ) : null}
      {state === "complete" ? (
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--rail-muted)]">
          Complete
        </p>
      ) : null}
      {chapter.id === "social-media" ? (
        <Link href={socialMediaHref} className="mt-0.5 block hover:opacity-90">
          <ChapterLabel muted={!emphasized}>{chapter.label}</ChapterLabel>
        </Link>
      ) : (
        <ChapterLabel muted={!emphasized}>{chapter.label}</ChapterLabel>
      )}
      <p
        className={`mt-1.5 text-[12px] leading-relaxed ${
          emphasized
            ? "text-[var(--rail-foreground)]/80"
            : "text-[var(--rail-muted)]"
        }`}
      >
        {chapter.description}
      </p>
    </div>
  );
}

function OpenChapterSteps({
  chapter,
  activeStep,
}: {
  chapter: JourneyChapter;
  activeStep: number;
}) {
  const steps = stepsForChapter(chapter);
  return (
    <div className="space-y-2">
      <div>
        <ChapterLabel>{chapter.label}</ChapterLabel>
        <p className="mt-1 text-[12px] leading-relaxed text-[var(--rail-muted)]">
          {chapter.description}
        </p>
      </div>
      <div className="relative">
        <div
          className="pointer-events-none absolute bottom-4 left-[9px] top-4 w-px bg-[var(--rail-connector)]"
          aria-hidden
        />
        <ol className="relative space-y-1.5">
          {steps.map((step) => {
            const state = stepState(step.step, activeStep);
            return (
              <li key={step.id} className="relative">
                {state === "current" ? (
                  <div className="relative z-[1]">
                    <ExpandedCard step={step} />
                  </div>
                ) : (
                  <CompactRow step={step} state={state} />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/**
 * Shared customer journey rail — presentation only.
 * Chapters collapse when complete; only the current step expands.
 */
export function JourneyRail({
  activeId,
  detailLine,
  researchSettled = false,
  channelActive = false,
  socialMediaHref = "/social-media",
}: JourneyRailProps) {
  const active = journeyStepById(activeId);
  const presentation = railPresentation({
    activeId,
    researchSettled,
    channelActive,
  });
  const {
    headerMode,
    activeStep,
    foundationOpen,
    foundationComplete,
    researchOpen,
    researchComplete,
    socialMedia,
  } = presentation;

  const foundation = journeyChapterById("foundation");
  const research = journeyChapterById("research");
  const social = journeyChapterById("social-media");

  const [foundationExpanded, setFoundationExpanded] = useState(false);
  const [researchExpanded, setResearchExpanded] = useState(false);

  // Never auto-reopen completed chapters on forward navigation.
  useEffect(() => {
    if (!foundationComplete) setFoundationExpanded(false);
  }, [foundationComplete, activeId]);

  useEffect(() => {
    if (!researchComplete) setResearchExpanded(false);
  }, [researchComplete, activeId]);

  return (
    <aside className="flex w-full flex-col bg-[var(--rail)] text-[var(--rail-foreground)] md:min-h-screen md:w-[272px] md:shrink-0">
      <div className="px-5 pt-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--rail-muted)]">
          Your journey
        </p>
        {headerMode === "next-chapter" || headerMode === "chapter" ? (
          <>
            {headerMode === "next-chapter" ? (
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--rail-muted)]">
                Next chapter
              </p>
            ) : (
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--rail-muted)]">
                Current
              </p>
            )}
            <p className="mt-2 text-[15px] font-semibold leading-snug text-[var(--rail-foreground)]">
              {social.label}
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-[var(--rail-muted)]">
              {social.description}
            </p>
          </>
        ) : (
          <>
            <p className="mt-2 text-3xl font-light tracking-tight text-[var(--rail-foreground)]">
              {String(active.step).padStart(2, "0")} / 08
            </p>
            <p className="mt-2 text-[15px] font-semibold leading-snug text-[var(--rail-foreground)]">
              {active.customerLabel}
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-[var(--rail-muted)]">
              {active.summary}
            </p>
            {detailLine ? (
              <p className="mt-1.5 text-[12px] text-[var(--rail-muted)]">{detailLine}</p>
            ) : null}
          </>
        )}
      </div>

      <div className="mt-7 min-h-0 flex-1 space-y-5 overflow-y-auto px-5 pb-4">
        {foundationOpen ? (
          <OpenChapterSteps chapter={foundation} activeStep={activeStep} />
        ) : (
          <CompletedChapterCard
            chapter={foundation}
            expanded={foundationExpanded}
            onToggle={() => setFoundationExpanded((v) => !v)}
            steps={stepsForChapter(foundation)}
          />
        )}

        {foundationOpen ? <SoftForwardDivider /> : null}

        {foundationOpen ? (
          <ChapterShell chapter={research} state="upcoming" />
        ) : researchOpen ? (
          <OpenChapterSteps chapter={research} activeStep={activeStep} />
        ) : (
          <CompletedChapterCard
            chapter={research}
            expanded={researchExpanded}
            onToggle={() => setResearchExpanded((v) => !v)}
            steps={stepsForChapter(research)}
          />
        )}

        <ChapterShell
          chapter={social}
          state={socialMedia.state}
          emphasizedNext={socialMedia.emphasizedNext}
          socialMediaHref={socialMediaHref}
        />
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-white/10 px-5 py-4">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xs font-medium text-[var(--rail-foreground)]"
          aria-hidden
        >
          N
        </div>
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5 text-[var(--rail-muted)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </aside>
  );
}
