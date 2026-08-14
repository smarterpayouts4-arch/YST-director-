"use client";

import Link from "next/link";
import { JourneyRail } from "@/features/research-prompt-builder/components/journey-rail";
import { atomHandoffHref } from "@/features/social-media/components/atom-handoff-href";

/**
 * Organizational Social Media hub — navigation only.
 * Must not import Shorts contracts, state, schemas, or perform ingest.
 */
export function SocialMediaHub({
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
  const ids = { topicPacketId, projectId, artifactId, returnHref };
  const hubHref = atomHandoffHref("/social-media", ids);
  const shortsHref = atomHandoffHref("/social-media/youtube-shorts", ids);
  const hasAtomIds = Boolean(topicPacketId && projectId && artifactId);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 md:flex">
      <JourneyRail
        activeId="atom"
        researchSettled={true}
        channelActive={true}
        socialMediaHref={hubHref}
      />

      <div className="relative flex-1 px-5 py-6 md:px-10 md:py-10">
        <div className="mx-auto max-w-[1040px] space-y-6">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
                Social Media
              </p>
              <h1 className="editorial text-2xl text-stone-900">
                Choose a channel
              </h1>
              <p className="mt-1 max-w-xl text-sm text-stone-600">
                Pick where this Atom should become content. Each channel owns its
                own creative brain.
              </p>
            </div>
            <Link
              href={returnHref || "/content-intelligence/topics"}
              className="shrink-0 text-sm font-medium text-primary hover:opacity-90"
            >
              Back
            </Link>
          </div>

          {!hasAtomIds ? (
            <p className="text-sm text-stone-600">
              No Atom identity in the URL. Open a channel to resume a saved
              portfolio, or send a Ready Atom from Topic Engine.
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-1">
            <Link
              href={shortsHref}
              className="block rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-colors hover:border-stone-300 hover:bg-stone-50/80"
            >
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Live
              </p>
              <h2 className="editorial mt-1 text-xl text-stone-900">
                YouTube Shorts
              </h2>
              <p className="mt-2 text-sm text-stone-600">
                Ingest this Atom into a Shorts-owned portfolio and continue from
                there.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
