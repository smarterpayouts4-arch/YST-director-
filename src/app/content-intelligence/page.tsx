"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LibrarianShell } from "@/features/content-intelligence/library/components/librarian-shell";

function ContentIntelligenceInner() {
  const params = useSearchParams();
  const projectId = params.get("projectId") ?? undefined;
  const artifactId = params.get("artifactId") ?? undefined;
  const returnHref = params.get("return") || "/";

  return (
    <LibrarianShell
      projectId={projectId}
      artifactId={artifactId}
      returnHref={returnHref}
    />
  );
}

export default function ContentIntelligencePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1040px] p-6 text-sm text-stone-600">
          Loading Content Intelligence…
        </div>
      }
    >
      <ContentIntelligenceInner />
    </Suspense>
  );
}
