"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { JourneyRail } from "@/features/research-prompt-builder/components/journey-rail";
import { atomHandoffHref } from "@/features/social-media/components/atom-handoff-href";
import { ingestTopicPacket } from "@/features/social-media/youtube-shorts/contracts/ingest-topic-packet";
import { resolveShortsIdentity } from "@/features/social-media/youtube-shorts/contracts/resolve-shorts-identity";
import { YouTubeShortsReadyView } from "@/features/social-media/youtube-shorts/components/youtube-shorts-ready-view";
import type { YouTubeShortsSession } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-session";
import {
  loadShortsSessionForPage,
  loadTeSeedPacket,
} from "@/features/social-media/youtube-shorts/state/resume-shorts-session";
import { persistSession } from "@/features/social-media/youtube-shorts/state/shorts-storage";

const EMPTY_COPY =
  "No Atom received yet. Send a Ready Atom from Topic Engine via Social Media, then open YouTube Shorts.";

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

  const socialMediaHref = atomHandoffHref("/social-media", {
    topicPacketId,
    projectId,
    artifactId,
    returnHref,
  });

  useEffect(() => {
    setHydrated(true);

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
    if (!packet) {
      setEmpty(true);
      return;
    }

    const identity = resolveShortsIdentity({
      packet,
      queryProjectId: projectId,
      queryArtifactId: artifactId,
    });
    if (!identity.ok) {
      setEmpty(true);
      return;
    }

    const next = ingestTopicPacket({
      packet,
      projectId: identity.projectId,
      artifactId: identity.artifactId,
    });
    const saved = persistSession(next);
    if (!saved.ok) {
      setEmpty(true);
      return;
    }
    setSession(saved.session);
  }, [topicPacketId, projectId, artifactId]);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-stone-50 text-stone-900 md:flex">
        <JourneyRail
          activeId="atom"
          researchSettled={true}
          channelActive={true}
          socialMediaHref={socialMediaHref}
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
      />

      <div className="relative flex-1 px-5 py-6 md:px-10 md:py-10">
        <div className="mx-auto max-w-[1040px] space-y-6">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
                YouTube Shorts
              </p>
              <h1 className="editorial text-2xl text-stone-900">
                {session ? "Atom received" : "Waiting for Atom"}
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

          {session ? (
            <YouTubeShortsReadyView packet={session.ingestedAtom} />
          ) : null}

          {empty && !session ? (
            <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-stone-700">{EMPTY_COPY}</p>
              <Link
                href="/content-intelligence/topics"
                className="mt-4 inline-block text-sm font-medium text-primary"
              >
                Go to Topic Engine
              </Link>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
