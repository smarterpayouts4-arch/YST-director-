"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { SocialMediaHub } from "@/features/social-media/components/social-media-hub";

function SocialMediaInner() {
  const params = useSearchParams();
  const topicPacketId = params.get("topicPacketId") ?? undefined;
  const projectId = params.get("projectId") ?? undefined;
  const artifactId = params.get("artifactId") ?? undefined;
  const returnHref = params.get("return") || "/content-intelligence/topics";

  return (
    <SocialMediaHub
      topicPacketId={topicPacketId}
      projectId={projectId}
      artifactId={artifactId}
      returnHref={returnHref}
    />
  );
}

/** Social Media organizational hub — navigation only; channels own ingest. */
export default function SocialMediaPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1040px] p-6 text-sm text-stone-600">
          Loading Social Media…
        </div>
      }
    >
      <SocialMediaInner />
    </Suspense>
  );
}
