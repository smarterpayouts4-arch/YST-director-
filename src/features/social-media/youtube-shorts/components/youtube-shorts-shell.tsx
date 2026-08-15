"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { JourneyRail } from "@/features/research-prompt-builder/components/journey-rail";
import { atomHandoffHref } from "@/features/social-media/components/atom-handoff-href";
import { ingestTopicPacket } from "@/features/social-media/youtube-shorts/contracts/ingest-topic-packet";
import { resolveShortsIdentity } from "@/features/social-media/youtube-shorts/contracts/resolve-shorts-identity";
import { YouTubeShortsStoryboardReview } from "@/features/social-media/youtube-shorts/components/storyboard-review";
import {
  applyGeneratedProduction,
  applyGeneratedStoryboard,
  applyWorkingProduction,
  applyWorkingStoryboard,
  approveWorkingStoryboard,
  reopenApprovedStoryboard,
} from "@/features/social-media/youtube-shorts/contracts/storyboard-lifecycle";
import type { YouTubeShortsProduction } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-production";
import type { YouTubeShortsSession } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-session";
import type { YouTubeShortsStoryboard } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-storyboard";
import {
  loadShortsSessionForPage,
  loadTeSeedPacket,
} from "@/features/social-media/youtube-shorts/state/resume-shorts-session";
import {
  fetchAndPersistOwnerRestore,
  ownerRestoreIdsMatch,
} from "@/features/social-media/youtube-shorts/state/owner-restore-atom";
import { persistSession } from "@/features/social-media/youtube-shorts/state/shorts-storage";

const EMPTY_COPY =
  "No Atom received yet. Send a Ready Atom from Topic Engine via Social Media, then open YouTube Shorts.";

const OWNER_RESTORE_EMPTY_COPY =
  "This browser has no Shorts session for the frozen test Atom. Restore it here — no Topic Engine rerun.";

export function YouTubeShortsShell({
  topicPacketId,
  projectId,
  artifactId,
  returnHref,
}: {
  topicPacketId?: string;
  projectId?: string;
  artifactId?: string;
  returnHref: string;
}) {
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<YouTubeShortsSession | null>(null);
  const [empty, setEmpty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const socialMediaHref = atomHandoffHref("/social-media", {
    topicPacketId,
    projectId,
    artifactId,
    returnHref,
  });

  const canOwnerRestore = ownerRestoreIdsMatch(topicPacketId, artifactId);

  useEffect(() => {
    let cancelled = false;
    setHydrated(true);
    setError(null);
    setEmpty(false);
    setSession(null);
    setRestoring(false);

    if (!topicPacketId) {
      setEmpty(true);
      return;
    }

    const loaded = loadShortsSessionForPage(topicPacketId);
    if (loaded.ok) {
      setSession(loaded.session);
      return;
    }

    if (loaded.reason === "corrupt_session") {
      setError("Saved Shorts session for this Atom is unreadable.");
      setEmpty(true);
      return;
    }

    if (loaded.reason === "envelope_unparseable") {
      setError("Shorts storage is unreadable.");
      setEmpty(true);
      return;
    }

    if (!artifactId) {
      setEmpty(true);
      return;
    }

    const packet = loadTeSeedPacket({
      expectedTopicPacketId: topicPacketId,
      artifactId,
    });
    if (packet) {
      const identity = resolveShortsIdentity({
        packet,
        queryProjectId: projectId,
        queryArtifactId: artifactId,
      });
      if (!identity.ok) {
        setError(
          identity.reason === "missing_projectId"
            ? "This Atom is missing a project id, so Shorts cannot ingest it."
            : "Atom identity does not match this Shorts session.",
        );
        setEmpty(true);
        return;
      }

      const next = ingestTopicPacket({
        packet,
        projectId: identity.projectId,
        artifactId: identity.artifactId,
        existingSession: null,
      });
      const saved = persistSession(next);
      if (!saved.ok) {
        setError("Could not save this Shorts session.");
        setEmpty(true);
        return;
      }
      setSession(saved.session);
      return;
    }

    // TE seed missing — same-browser owner restore for the frozen fixture URL only.
    if (!ownerRestoreIdsMatch(topicPacketId, artifactId)) {
      setEmpty(true);
      return;
    }

    setRestoring(true);
    void fetchAndPersistOwnerRestore({ topicPacketId, artifactId }).then(
      (result) => {
        if (cancelled) return;
        setRestoring(false);
        if (result.ok) {
          setSession(result.session);
          setEmpty(false);
          return;
        }
        setEmpty(true);
        if (result.reason === "save_failed") {
          setError("Could not save the restored Shorts session.");
        } else if (result.reason !== "ids_mismatch") {
          setError("Could not restore this Atom in this browser.");
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [topicPacketId, projectId, artifactId]);

  const restoreOwnerAtom = async () => {
    if (!topicPacketId || !artifactId || restoring || busy) return;
    if (!ownerRestoreIdsMatch(topicPacketId, artifactId)) return;
    setRestoring(true);
    setError(null);
    try {
      const result = await fetchAndPersistOwnerRestore({
        topicPacketId,
        artifactId,
      });
      if (result.ok) {
        setSession(result.session);
        setEmpty(false);
        return;
      }
      setEmpty(true);
      setError(
        result.reason === "save_failed"
          ? "Could not save the restored Shorts session."
          : "Could not restore this Atom in this browser.",
      );
    } finally {
      setRestoring(false);
    }
  };

  const persist = (next: YouTubeShortsSession): boolean => {
    const saved = persistSession(next);
    if (!saved.ok) {
      setError("Could not save this Shorts session.");
      return false;
    }
    setSession(saved.session);
    return true;
  };

  const generateStoryboard = async () => {
    if (!session || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/social-media/youtube-shorts/storyboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingestedAtom: session.ingestedAtom,
          topicPacketId: session.topicPacketId,
          projectId: session.projectId,
          artifactId: session.artifactId,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error?.message || "Could not generate storyboard.");
      }
      persist(
        applyGeneratedStoryboard(
          session,
          body.storyboard as YouTubeShortsStoryboard,
          String(body.promptVersion ?? ""),
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not generate storyboard.",
      );
    } finally {
      setBusy(false);
    }
  };

  const changeWorking = (board: YouTubeShortsStoryboard) => {
    if (!session) return;
    try {
      persist(applyWorkingStoryboard(session, board));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save edits.");
    }
  };

  const approveStoryboard = () => {
    if (!session) return;
    try {
      persist(approveWorkingStoryboard(session));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not approve storyboard.");
    }
  };

  const reopenStoryboard = () => {
    if (!session) return;
    persist(reopenApprovedStoryboard(session));
  };

  const expandProduction = async () => {
    if (!session || busy || !session.approvedStoryboard) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/social-media/youtube-shorts/expand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingestedAtom: session.ingestedAtom,
          approvedStoryboard: session.approvedStoryboard,
          topicPacketId: session.topicPacketId,
          projectId: session.projectId,
          artifactId: session.artifactId,
          stage: session.stage,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error?.message || "Could not expand production.");
      }
      persist(
        applyGeneratedProduction(
          session,
          body.production as YouTubeShortsProduction,
          String(body.promptVersion ?? ""),
          typeof body.generatedAt === "string"
            ? body.generatedAt
            : new Date().toISOString(),
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not expand production.",
      );
    } finally {
      setBusy(false);
    }
  };

  const changeWorkingProduction = (board: YouTubeShortsProduction) => {
    if (!session) return;
    try {
      persist(applyWorkingProduction(session, board));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save production edits.");
    }
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-stone-50 text-stone-900 md:flex">
        <JourneyRail
          activeId="atom"
          researchSettled={true}
          channelActive={true}
          socialMediaHref={socialMediaHref}
          activeChannelLabel="YouTube Shorts"
        />
        <div className="flex-1 px-5 py-6 text-sm text-stone-600 md:px-10 md:py-10">
          Loading YouTube Shorts…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 md:flex">
      <JourneyRail
        activeId="atom"
        researchSettled={true}
        channelActive={true}
        socialMediaHref={socialMediaHref}
        activeChannelLabel="YouTube Shorts"
      />

      <div className="relative flex-1 px-4 py-4 md:px-8 md:py-6">
        <div className="mx-auto max-w-[1360px] space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
                Social Media
              </p>
              <h1 className="editorial text-2xl text-stone-900">
                {session ? "Storyboard" : "Waiting for Atom"}
              </h1>
            </div>
            <Link
              href={returnHref || "/content-intelligence/topics"}
              className="shrink-0 text-sm font-medium text-primary hover:opacity-90"
            >
              Back
            </Link>
          </div>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          {restoring && !session ? (
            <p className="text-sm text-stone-600">Restoring frozen Atom…</p>
          ) : null}

          {session ? (
            <YouTubeShortsStoryboardReview
              session={session}
              busy={busy}
              onGenerate={generateStoryboard}
              onExpand={expandProduction}
              onChangeWorking={changeWorking}
              onChangeWorkingProduction={changeWorkingProduction}
              onApprove={approveStoryboard}
              onReopen={reopenStoryboard}
            />
          ) : null}

          {empty && !session ? (
            <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-stone-700">
                {canOwnerRestore ? OWNER_RESTORE_EMPTY_COPY : EMPTY_COPY}
              </p>
              {canOwnerRestore ? (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void restoreOwnerAtom()}
                    disabled={restoring}
                    className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-60"
                  >
                    {restoring ? "Restoring…" : "Restore this Atom"}
                  </button>
                  <Link
                    href="/content-intelligence/topics"
                    className="text-sm font-medium text-stone-600 hover:text-stone-900"
                  >
                    Topic Engine
                  </Link>
                </div>
              ) : (
                <Link
                  href="/content-intelligence/topics"
                  className="mt-3 inline-block text-sm font-medium text-primary"
                >
                  Go to Topic Engine
                </Link>
              )}
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
