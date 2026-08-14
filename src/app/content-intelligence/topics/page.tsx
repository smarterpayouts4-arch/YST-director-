"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { TopicEngineShell } from "@/features/content-intelligence/topics/components/topic-engine-shell";

function TopicsInner() {
  const params = useSearchParams();
  const projectId = params.get("projectId") ?? undefined;
  const artifactId = params.get("artifactId") ?? undefined;
  const returnHref = params.get("return") || "/";

  return (
    <TopicEngineShell
      projectId={projectId}
      artifactId={artifactId}
      returnHref={returnHref}
    />
  );
}

export default function TopicsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1040px] p-6 text-sm text-stone-600">
          Loading Topic Engine…
        </div>
      }
    >
      <TopicsInner />
    </Suspense>
  );
}
