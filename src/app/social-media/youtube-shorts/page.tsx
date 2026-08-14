"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { YouTubeShortsShell } from "@/features/social-media/youtube-shorts/components/youtube-shorts-shell";

function YouTubeShortsInner() {
  const params = useSearchParams();
  const topicPacketId = params.get("topicPacketId") ?? undefined;
  const projectId = params.get("projectId") ?? undefined;
  const artifactId = params.get("artifactId") ?? undefined;
  const returnHref = params.get("return") || "/content-intelligence/topics";

  return (
    <YouTubeShortsShell
      topicPacketId={topicPacketId}
      projectId={projectId}
      artifactId={artifactId}
      returnHref={returnHref}
    />
  );
}

export default function YouTubeShortsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1040px] p-6 text-sm text-stone-600">
          Loading YouTube Shorts…
        </div>
      }
    >
      <YouTubeShortsInner />
    </Suspense>
  );
}
