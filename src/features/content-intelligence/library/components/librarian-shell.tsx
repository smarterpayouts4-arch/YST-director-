"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { ContentIntelligenceLibrary } from "@/features/content-intelligence/library/schemas/library";
import type { LibraryItem } from "@/features/content-intelligence/library/schemas/library-item";
import { EXTRACT_DRAFT_ITEMS_MAX } from "@/features/content-intelligence/library/schemas/extract-draft";
import { LIBRARY_ITEMS_MAX } from "@/features/content-intelligence/library/schemas/library";
import { clearHandoff, peekHandoff } from "@/features/content-intelligence/library/state/handoff";
import {
  createEmptyLibrary,
  loadLibrary,
  saveLibrary,
} from "@/features/content-intelligence/library/state/library-storage";
import { formatLibrarianClientError } from "@/features/content-intelligence/library/services/librarian-client-errors";
import {
  countNeedsAttention,
  syncLibraryReadyState,
} from "@/features/content-intelligence/library/services/publish-library";
import { ContentIntelligenceRail } from "@/features/content-intelligence/library/components/content-intelligence-rail";
import { IntelligenceSummary } from "@/features/content-intelligence/library/components/intelligence-summary";
import { ExceptionReview } from "@/features/content-intelligence/library/components/exception-review";
import { LibraryRecordReview } from "@/features/content-intelligence/library/components/library-record-review";
import { TechnicalDetails } from "@/features/content-intelligence/library/components/technical-details";

export function LibrarianShell({
  projectId,
  artifactId,
  returnHref,
}: {
  projectId?: string;
  artifactId?: string;
  returnHref: string;
}) {
  const [library, setLibrary] = useState<ContentIntelligenceLibrary | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const extractInFlightRef = useRef<string | null>(null);

  const activeArtifactId = useMemo(() => {
    if (artifactId) return artifactId;
    return library?.artifacts[library.artifacts.length - 1]?.artifactId;
  }, [artifactId, library]);

  const activeArtifact = library?.artifacts.find((a) => a.artifactId === activeArtifactId);

  useEffect(() => {
    const loaded = loadLibrary() ?? createEmptyLibrary({ projectId });
    if (projectId && !loaded.projectId) loaded.projectId = projectId;
    const scopeId =
      artifactId ?? loaded.artifacts[loaded.artifacts.length - 1]?.artifactId;
    const synced = syncLibraryReadyState(loaded, scopeId);
    saveLibrary(synced);
    setLibrary(synced);
    setHydrated(true);
  }, [projectId, artifactId]);

  useEffect(() => {
    if (!hydrated || !library || !activeArtifact) return;
    if (library.stage !== "pending_extract") return;
    if (library.extractionRuns.some((r) => r.artifactId === activeArtifact.artifactId)) {
      return;
    }
    if (extractInFlightRef.current === activeArtifact.artifactId) return;

    const artifact = activeArtifact;
    const librarySnapshot = library;
    extractInFlightRef.current = artifact.artifactId;
    setBusy(true);
    setError(null);

    const run = async () => {
      try {
        const handoff = peekHandoff();
        const researchText =
          handoff?.artifactId === artifact.artifactId
            ? handoff.researchText
            : artifact.rawText;

        const res = await fetch("/api/content-intelligence/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            researchText,
            artifactId: artifact.artifactId,
            projectId: projectId ?? librarySnapshot.projectId,
          }),
        });
        const body = await res.json();
        if (!res.ok) {
          throw new Error(body?.error?.message || "Extraction failed.");
        }
        if (!Array.isArray(body.items) || body.items.length > EXTRACT_DRAFT_ITEMS_MAX) {
          throw new Error(
            `Extraction returned an invalid item count (max ${EXTRACT_DRAFT_ITEMS_MAX}). Try sending research again.`,
          );
        }

        let next: ContentIntelligenceLibrary = {
          ...librarySnapshot,
          stage: "in_review",
          extractionRuns: [
            ...librarySnapshot.extractionRuns.filter(
              (r) => r.runId !== body.extractionRun.runId,
            ),
            body.extractionRun,
          ],
          // Fresh Library handoff keeps a single artifact; replace that artifact's slice only.
          items: [
            ...librarySnapshot.items.filter((i) => i.artifactId !== artifact.artifactId),
            ...body.items,
          ],
        };
        next = syncLibraryReadyState(next, artifact.artifactId);
        saveLibrary(next);
        setLibrary(next);
        clearHandoff();
      } catch (err) {
        extractInFlightRef.current = null;
        setError(formatLibrarianClientError(err));
      } finally {
        setBusy(false);
      }
    };
    void run();
  }, [hydrated, library, activeArtifact, projectId]);

  const persist = (next: ContentIntelligenceLibrary) => {
    try {
      const synced = syncLibraryReadyState(next, activeArtifactId);
      saveLibrary(synced);
      setLibrary(synced);
      setError(null);
    } catch (err) {
      setError(formatLibrarianClientError(err));
    }
  };

  const updateItem = (itemId: string, patch: Partial<LibraryItem>) => {
    if (!library) return;
    persist({
      ...library,
      items: library.items.map((item) =>
        item.itemId === itemId
          ? {
              ...item,
              ...patch,
              origin:
                patch.statement !== undefined ||
                patch.kind !== undefined ||
                patch.provenance !== undefined
                  ? item.origin === "owner_added"
                    ? "owner_added"
                    : "owner_edited"
                  : (patch.origin ?? item.origin),
            }
          : item,
      ),
    });
  };

  const addItem = () => {
    if (!library || !activeArtifact) return;
    if (library.items.length >= LIBRARY_ITEMS_MAX) {
      setError(
        `Cannot add more items — library is at the ${LIBRARY_ITEMS_MAX}-item limit. Send new research from Step 5 to start a fresh Library.`,
      );
      return;
    }
    const now = new Date().toISOString();
    const item: LibraryItem = {
      itemId: `item_${crypto.randomUUID()}`,
      artifactId: activeArtifact.artifactId,
      extractionRunId: null,
      kind: "other",
      statement: "New owner-added intelligence",
      provenance: "Owner added during review",
      origin: "owner_added",
      reviewStatus: "needs_review",
      confidence: "medium",
      evidenceQuote: null,
      quoteCleared: false,
      sourceRefs: [],
      tags: [],
      isHypothesis: false,
      capturedAt: now,
    };
    persist({
      ...library,
      stage: library.stage === "published" ? "in_review" : library.stage,
      publishedAt: null,
      publishedDto: null,
      items: [...library.items, item],
    });
  };

  if (!hydrated || !library) {
    return (
      <div className="min-h-screen md:flex">
        <ContentIntelligenceRail />
        <div className="flex-1 px-5 py-6 text-sm text-stone-600 md:px-10 md:py-10">
          Loading Content Intelligence…
        </div>
      </div>
    );
  }

  const items = activeArtifact
    ? library.items.filter((i) => i.artifactId === activeArtifact.artifactId)
    : library.items;
  const exceptions = items.filter((i) => i.reviewStatus === "needs_review");
  const acceptedCount = items.filter((i) => i.reviewStatus === "accepted").length;
  const needsAttention = countNeedsAttention(items);
  const isReady = library.stage === "published" && !!library.publishedDto && needsAttention === 0;
  const latestRun = activeArtifact
    ? [...library.extractionRuns]
        .reverse()
        .find((r) => r.artifactId === activeArtifact.artifactId)
    : undefined;

  const continueHref =
    isReady && activeArtifact
      ? `/content-intelligence/topics?${new URLSearchParams({
          ...(projectId || library.projectId
            ? { projectId: projectId || library.projectId || "" }
            : {}),
          artifactId: activeArtifact.artifactId,
          return: returnHref,
        }).toString()}`
      : undefined;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 md:flex">
      <ContentIntelligenceRail activeStep="librarian" />

      <div className="relative flex-1 px-5 py-6 md:px-10 md:py-10">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
              Turn insight into direction
            </p>
            <h1 className="editorial text-2xl text-stone-900">See What We Found</h1>
            <p className="mt-1 max-w-xl text-sm text-stone-600">
              See what the research uncovered. Clean items are already saved; finish the ones that
              need a decision so findings can be marked ready.
            </p>
          </div>
          <Link
            href={returnHref}
            className="shrink-0 text-sm font-medium text-primary hover:opacity-90"
          >
            Back to Research Prompt Builder
          </Link>
        </div>

        <div className="mx-auto max-w-[1040px] space-y-6">
          {!activeArtifact ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-stone-700">
                No research handoff found. Paste completed research from Start the Research, then send it here.
              </p>
              <Link
                href={returnHref}
                className="mt-4 inline-block text-sm font-medium text-primary"
              >
                Go to Step 5
              </Link>
            </div>
          ) : null}

          {busy ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-stone-800">Processing research…</p>
              <p className="mt-1 text-sm text-stone-600">
                Preserving your original research unchanged, then organizing intelligence.
              </p>
            </div>
          ) : null}

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          {activeArtifact && !busy && !error ? (
            <>
              <IntelligenceSummary
                items={items}
                needsAttentionCount={needsAttention}
                isReady={isReady}
                continueHref={continueHref}
              />

              <ExceptionReview
                items={exceptions}
                onAccept={(id) => updateItem(id, { reviewStatus: "accepted" })}
                onReject={(id) => updateItem(id, { reviewStatus: "rejected" })}
                onSaveStatement={(id, statement) => updateItem(id, { statement })}
              />

              <TechnicalDetails
                run={latestRun}
                acceptedCount={acceptedCount}
                totalCount={items.length}
              />

              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced((v) => !v)}
                >
                  {showAdvanced ? "Hide advanced records" : "Review all details"}
                </Button>
              </div>

              {showAdvanced ? (
                <LibraryRecordReview
                  items={items}
                  onUpdate={updateItem}
                  onAdd={addItem}
                />
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
