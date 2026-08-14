"use client";

import type { TopicPacket } from "@/features/content-intelligence/contracts/topic-packet";
import { projectTopicPacketToYouTubeShortsInput } from "@/features/social-media/youtube-shorts/contracts/project-topic-packet";

/**
 * Compact confirmation that Shorts owns the Atom.
 * Full 16-field projection stays in contracts for P1B — not dumped in UI.
 */
export function YouTubeShortsReadyView({ packet }: { packet: TopicPacket }) {
  // Keep projector wired for future storyboard input; do not render all fields.
  const projection = projectTopicPacketToYouTubeShortsInput(packet);

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
        Atom received
      </p>
      <h2 className="editorial mt-1 text-2xl text-stone-900">{projection.title}</h2>
      <p className="mt-2 text-sm text-stone-600">
        Shorts owns this Atom. Storyboard not built yet.
      </p>
    </section>
  );
}
