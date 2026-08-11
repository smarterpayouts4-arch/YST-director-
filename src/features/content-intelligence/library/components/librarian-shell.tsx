"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { ContentIntelligenceLibrary } from "@/features/content-intelligence/library/schemas/library";
import type { LibraryItem } from "@/features/content-intelligence/library/schemas/library-item";
import type { IntelligenceKind } from "@/features/content-intelligence/library/schemas/enums";
import { clearHandoff, peekHandoff } from "@/features/content-intelligence/library/state/handoff";
import {
  createEmptyLibrary,
  loadLibrary,
  saveLibrary,
} from "@/features/content-intelligence/library/state/library-storage";
import { buildPublishedLibraryDto } from "@/features/content-intelligence/library/services/publish-library";

const KINDS: IntelligenceKind[] = [
  "fact",
  "audience",
  "moment",
  "tension",
  "opportunity",
  "demand",
  "competitor",
  "restriction",
  "unresolved",
  "limitation",
  "other",
];

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
  const [extractStartedFor, setExtractStartedFor] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftStatement, setDraftStatement] = useState("");

  const activeArtifactId = useMemo(() => {
    if (artifactId) return artifactId;
    return library?.artifacts[library.artifacts.length - 1]?.artifactId;
  }, [artifactId, library]);

  const activeArtifact = library?.artifacts.find((a) => a.artifactId === activeArtifactId);

  useEffect(() => {
    const loaded = loadLibrary() ?? createEmptyLibrary({ projectId });
    if (projectId && !loaded.projectId) loaded.projectId = projectId;
    setLibrary(loaded);
    setHydrated(true);
  }, [projectId]);

  useEffect(() => {
    if (!hydrated || !library || !activeArtifact) return;
    if (library.stage !== "pending_extract") return;
    if (library.extractionRuns.some((r) => r.artifactId === activeArtifact.artifactId)) {
      return;
    }
    if (extractStartedFor === activeArtifact.artifactId) return;

    let cancelled = false;
    setExtractStartedFor(activeArtifact.artifactId);
    const run = async () => {
      setBusy(true);
      setError(null);
      try {
        const handoff = peekHandoff();
        const researchText =
          handoff?.artifactId === activeArtifact.artifactId
            ? handoff.researchText
            : activeArtifact.rawText;

        const res = await fetch("/api/content-intelligence/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            researchText,
            artifactId: activeArtifact.artifactId,
            projectId: projectId ?? library.projectId,
          }),
        });
        const body = await res.json();
        if (!res.ok) {
          throw new Error(body?.error?.message || "Extraction failed.");
        }
        if (cancelled) return;

        const next: ContentIntelligenceLibrary = {
          ...library,
          stage: "in_review",
          extractionRuns: [
            ...library.extractionRuns.filter((r) => r.runId !== body.extractionRun.runId),
            body.extractionRun,
          ],
          items: [
            ...library.items.filter((i) => i.artifactId !== activeArtifact.artifactId),
            ...body.items,
          ],
        };
        saveLibrary(next);
        setLibrary(next);
        clearHandoff();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Extraction failed.");
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [hydrated, library, activeArtifact, projectId, extractStartedFor]);

  const persist = (next: ContentIntelligenceLibrary) => {
    saveLibrary(next);
    setLibrary(next);
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
                  : patch.origin ?? item.origin,
            }
          : item,
      ),
    });
  };

  const addItem = () => {
    if (!library || !activeArtifact) return;
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
    setEditingId(item.itemId);
    setDraftStatement(item.statement);
  };

  const publish = () => {
    if (!library) return;
    try {
      const publishedAt = new Date().toISOString();
      const publishedDto = buildPublishedLibraryDto(library, publishedAt);
      persist({
        ...library,
        stage: "published",
        publishedAt,
        publishedDto,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed.");
    }
  };

  if (!hydrated || !library) {
    return (
      <div className="mx-auto max-w-[1040px] p-6 text-sm text-stone-600">
        Loading Content Intelligence…
      </div>
    );
  }

  const items = activeArtifact
    ? library.items.filter((i) => i.artifactId === activeArtifact.artifactId)
    : library.items;
  const acceptedCount = items.filter((i) => i.reviewStatus === "accepted").length;
  const latestRun = activeArtifact
    ? [...library.extractionRuns]
        .reverse()
        .find((r) => r.artifactId === activeArtifact.artifactId)
    : undefined;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-[1040px] items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
              Content Intelligence · Librarian
            </p>
            <h1 className="editorial text-2xl text-stone-900">Review extracted intelligence</h1>
          </div>
          <Link
            href={returnHref}
            className="text-sm font-medium text-indigo-700 hover:text-indigo-900"
          >
            Back to Research Prompt Builder
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1040px] space-y-6 px-6 py-8">
        {!activeArtifact ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-stone-700">
              No research handoff found. Paste completed research from Step 5 Export, then send it
              here.
            </p>
            <Link href={returnHref} className="mt-4 inline-block text-sm font-medium text-indigo-700">
              Go to Step 5
            </Link>
          </div>
        ) : null}

        {busy ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-stone-800">Extracting intelligence…</p>
            <p className="mt-1 text-sm text-stone-600">
              Preserving your original research unchanged, then organizing items for review.
            </p>
          </div>
        ) : null}

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        {latestRun ? (
          <p className="text-xs text-stone-500">
            Extraction run {latestRun.runId} · {latestRun.promptVersion} · {latestRun.model}
            {latestRun.validationResult.quoteMismatchCount
              ? ` · ${latestRun.validationResult.quoteMismatchCount} quote mismatch(es)`
              : ""}
          </p>
        ) : null}

        {activeArtifact && !busy && library.stage !== "idle" ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-stone-600">
                {acceptedCount} accepted · {items.length} total · artifact preserved
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={addItem}>
                  Add item
                </Button>
                <Button onClick={publish} disabled={acceptedCount < 1 || library.stage === "published"}>
                  {library.stage === "published" ? "Published" : "Publish accepted"}
                </Button>
              </div>
            </div>

            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.itemId}
                  className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                        {item.kind} · {item.origin} · {item.confidence}
                        {item.isHypothesis ? " · hypothesis" : ""}
                      </p>
                      {editingId === item.itemId ? (
                        <textarea
                          className="mt-1 w-full min-h-[80px] rounded-md border border-stone-300 p-2 text-sm"
                          value={draftStatement}
                          onChange={(e) => setDraftStatement(e.target.value)}
                        />
                      ) : (
                        <p className="text-sm text-stone-800">{item.statement}</p>
                      )}
                      <p className="text-xs text-stone-500">Provenance: {item.provenance}</p>
                      {item.evidenceQuote ? (
                        <p className="text-xs italic text-stone-600">“{item.evidenceQuote}”</p>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-2">
                      <select
                        className="rounded-md border border-stone-300 bg-white px-2 py-1 text-xs"
                        value={item.kind}
                        onChange={(e) =>
                          updateItem(item.itemId, {
                            kind: e.target.value as IntelligenceKind,
                          })
                        }
                      >
                        {KINDS.map((kind) => (
                          <option key={kind} value={kind}>
                            {kind}
                          </option>
                        ))}
                      </select>
                      <div className="flex flex-wrap gap-1">
                        <Button
                          size="sm"
                          variant={item.reviewStatus === "accepted" ? "default" : "outline"}
                          onClick={() =>
                            updateItem(item.itemId, { reviewStatus: "accepted" })
                          }
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant={item.reviewStatus === "rejected" ? "danger" : "outline"}
                          onClick={() =>
                            updateItem(item.itemId, { reviewStatus: "rejected" })
                          }
                        >
                          Reject
                        </Button>
                        {editingId === item.itemId ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              updateItem(item.itemId, {
                                statement: draftStatement.trim() || item.statement,
                              });
                              setEditingId(null);
                            }}
                          >
                            Save
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(item.itemId);
                              setDraftStatement(item.statement);
                            }}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {library.stage === "published" && library.publishedDto ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="editorial text-xl text-stone-900">Library published</h2>
            <p className="mt-2 text-sm text-stone-600">
              {library.publishedDto.items.length} accepted item
              {library.publishedDto.items.length === 1 ? "" : "s"} ready for later Topic Engine
              use. Librarian stops here.
            </p>
          </div>
        ) : null}
      </main>
    </div>
  );
}
