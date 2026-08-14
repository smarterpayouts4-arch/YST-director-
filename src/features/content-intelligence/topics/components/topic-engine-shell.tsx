"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  loadPublishedLibraryForArtifact,
  type LoadedPublishedLibrary,
} from "@/features/content-intelligence/contracts/load-published-library";
import type { PublishedLibraryDto } from "@/features/content-intelligence/contracts/published-library";
import { TopicPacketSchema } from "@/features/content-intelligence/contracts/topic-packet";
import { ContentIntelligenceRail } from "@/features/content-intelligence/library/components/content-intelligence-rail";
import { buildTopicPacket } from "@/features/content-intelligence/topics/services/build-topic-packet";
import type { TopicDirection } from "@/features/content-intelligence/topics/schemas/direction";
import type { TopicOpportunity } from "@/features/content-intelligence/topics/schemas/topic-opportunity";
import type { TopicEngineSession } from "@/features/content-intelligence/topics/schemas/topic-session";
import { TOPICS_RUNTIME_PROMPT_VERSION } from "@/features/content-intelligence/topics/prompts/prompt-version";
import {
  isResumableTopicSession,
  topicSessionPromptVersionDiffers,
} from "@/features/content-intelligence/topics/state/resume-topic-session";
import {
  loadTopicSession,
  saveTopicSession,
} from "@/features/content-intelligence/topics/state/topic-storage";
import { DirectionCards } from "@/features/content-intelligence/topics/components/direction-cards";
import { TopicOpportunityGrid } from "@/features/content-intelligence/topics/components/topic-opportunity-grid";
import { TopicReadyView } from "@/features/content-intelligence/topics/components/topic-ready-view";
import { resolveAtomIdentity } from "@/features/content-intelligence/contracts/resolve-atom-identity";
import { atomHandoffHref } from "@/features/social-media/components/atom-handoff-href";

export function TopicEngineShell({
  projectId,
  artifactId,
  returnHref,
}: {
  projectId?: string;
  artifactId?: string;
  returnHref: string;
}) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [loaded, setLoaded] = useState<LoadedPublishedLibrary | null>(null);
  const [session, setSession] = useState<TopicEngineSession | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [resumedStalePrompt, setResumedStalePrompt] = useState(false);
  const directionsRequestedRef = useRef(false);

  const librarianHref = artifactId
    ? `/content-intelligence?${new URLSearchParams({
        ...(projectId ? { projectId } : {}),
        artifactId,
        return: returnHref,
      }).toString()}`
    : `/content-intelligence?return=${encodeURIComponent(returnHref)}`;

  useEffect(() => {
    if (!artifactId) {
      setLoaded(null);
      setSession(null);
      setResumedStalePrompt(false);
      setHydrated(true);
      return;
    }
    const pub = loadPublishedLibraryForArtifact(artifactId);
    setLoaded(pub);
    if (!pub) {
      setSession(null);
      setResumedStalePrompt(false);
      setHydrated(true);
      return;
    }
    const existing = loadTopicSession(artifactId);
    if (isResumableTopicSession(existing, pub.dto.libraryId)) {
      // Resume Ready/topics/directions without re-running AI — even if promptVersion differs.
      setSession(existing);
      setResumedStalePrompt(topicSessionPromptVersionDiffers(existing));
      directionsRequestedRef.current = true;
    } else {
      // No usable generated work for this library — allow one-shot propose-directions.
      setSession(null);
      setResumedStalePrompt(false);
      directionsRequestedRef.current = false;
    }
    setHydrated(true);
  }, [artifactId]);

  const persist = (next: TopicEngineSession) => {
    setSession(next);
    saveTopicSession(next);
  };

  const runDirections = async (dto: PublishedLibraryDto, basedOnLabel: string) => {
    directionsRequestedRef.current = true;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/content-intelligence/propose-directions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publishedLibrary: dto,
          artifactId,
          projectId: projectId ?? dto.projectId,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error?.message || "Could not propose directions.");
      }
      const diagnostics = body.diagnostics as
        | {
            draftCount: number;
            keptCount: number;
            droppedCount: number;
            droppedReasons?: string[];
            model?: string;
          }
        | undefined;
      const next: TopicEngineSession = {
        libraryId: dto.libraryId,
        projectId: projectId ?? dto.projectId,
        artifactId: artifactId!,
        basedOnLabel,
        promptVersion: TOPICS_RUNTIME_PROMPT_VERSION,
        lastDirectionsDiagnostics: diagnostics
          ? {
              draftCount: diagnostics.draftCount,
              keptCount: diagnostics.keptCount,
              droppedCount: diagnostics.droppedCount,
              droppedReasons: diagnostics.droppedReasons,
              model: diagnostics.model,
            }
          : undefined,
        stage: "directions",
        directions: body.directions as TopicDirection[],
        selectedTerritoryId: null,
        topics: [],
        selectedTopicId: null,
        packet: null,
      };
      persist(next);
    } catch (e) {
      directionsRequestedRef.current = false;
      setError(e instanceof Error ? e.message : "Could not propose directions.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!hydrated || !loaded || !artifactId) return;
    if (directionsRequestedRef.current) return;
    void runDirections(loaded.dto, loaded.basedOnLabel);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot when DTO ready
  }, [hydrated, loaded, artifactId]);

  const exploreDirection = async (territoryId: string) => {
    if (!loaded || !session) return;
    const direction = session.directions.find((d) => d.territoryId === territoryId);
    if (!direction) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/content-intelligence/propose-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publishedLibrary: loaded.dto,
          direction,
          artifactId,
          projectId: projectId ?? loaded.dto.projectId,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error?.message || "Could not propose topics.");
      }
      persist({
        ...session,
        stage: "topics",
        selectedTerritoryId: territoryId,
        topics: body.topics as TopicOpportunity[],
        selectedTopicId: null,
        packet: null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not propose topics.");
    } finally {
      setBusy(false);
    }
  };

  /**
   * Lock one Atom (Canonical Topic Packet). Mints a new topicPacketId each call —
   * re-select after Back intentionally creates a new Atom (no history yet).
   */
  const selectTopic = (topicId: string) => {
    if (!loaded || !session) return;
    const topic = session.topics.find((t) => t.topicId === topicId);
    const direction = session.directions.find(
      (d) => d.territoryId === session.selectedTerritoryId,
    );
    if (!topic || !direction || !artifactId) return;
    try {
      const packet = buildTopicPacket({
        dto: loaded.dto,
        direction,
        topic,
        artifactId,
        projectId: projectId ?? loaded.dto.projectId,
      });
      persist({
        ...session,
        stage: "ready",
        selectedTopicId: topicId,
        packet,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create topic packet.");
    }
  };

  /** Abandon Atom; return to 07 with the same six topics (do not reuse Change direction). */
  const backToTopics = () => {
    if (!session) return;
    persist({
      ...session,
      stage: "topics",
      selectedTopicId: null,
      packet: null,
    });
  };

  const sendToSocialMedia = () => {
    if (!session?.packet) return;
    setSendError(null);

    const parsed = TopicPacketSchema.safeParse(session.packet);
    if (!parsed.success) {
      setSendError("Atom packet is invalid.");
      return;
    }

    const identity = resolveAtomIdentity({
      packet: parsed.data,
      sessionProjectId: session.projectId,
      sessionArtifactId: session.artifactId,
      queryProjectId: projectId,
      queryArtifactId: artifactId,
    });
    if (!identity.ok) {
      setSendError(
        identity.reason === "missing_projectId"
          ? "Missing projectId — cannot send to Social Media."
          : "Identity disagreement — projectId or artifactId sources do not match.",
      );
      return;
    }

    router.push(
      atomHandoffHref("/social-media", {
        topicPacketId: parsed.data.topicPacketId,
        projectId: identity.projectId,
        artifactId: identity.artifactId,
        returnHref:
          typeof window !== "undefined"
            ? `${window.location.pathname}${window.location.search}`
            : returnHref,
      }),
    );
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen md:flex">
        <ContentIntelligenceRail activeStep="topics" />
        <div className="flex-1 px-5 py-6 text-sm text-stone-600 md:px-10 md:py-10">
          Loading Topic Engine…
        </div>
      </div>
    );
  }

  if (!artifactId || !loaded) {
    return (
      <div className="min-h-screen bg-stone-50 text-stone-900 md:flex">
        <ContentIntelligenceRail activeStep="topics" />
        <div className="relative flex-1 px-5 py-6 md:px-10 md:py-10">
          <div className="mx-auto max-w-[1040px] rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h1 className="editorial text-2xl text-stone-900">Topics unavailable</h1>
            <p className="mt-2 text-sm text-stone-600">
              Make Your Choice needs approved findings for this research. It does not read raw
              research. Return to See What We Found, finish review until findings are ready, then
              continue.
            </p>
            <Link
              href={librarianHref}
              className="mt-4 inline-block text-sm font-medium text-primary"
            >
              Back to See What We Found
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const selectedDirection = session?.directions.find(
    (d) => d.territoryId === session.selectedTerritoryId,
  );
  const onAtom = session?.stage === "ready" && !!session.packet;

  const socialMediaHref =
    onAtom && session?.packet
      ? atomHandoffHref("/social-media", {
          topicPacketId: session.packet.topicPacketId,
          projectId:
            session.packet.projectId || session.projectId || projectId,
          artifactId:
            session.packet.artifactId || session.artifactId || artifactId,
        })
      : "/social-media";

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 md:flex">
      <ContentIntelligenceRail
        activeStep={onAtom ? "atom" : "topics"}
        researchSettled={onAtom}
        socialMediaHref={socialMediaHref}
      />

      <div className="relative flex-1 px-5 py-6 md:px-10 md:py-10">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            {onAtom ? null : (
              <>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
                  Turn insight into direction
                </p>
                <h1 className="editorial text-2xl text-stone-900">
                  Make Your Choice
                </h1>
                <p className="mt-1 max-w-xl text-sm text-stone-600">
                  Choose the direction and topic worth taking forward.
                </p>
              </>
            )}
            <p className={`text-xs text-stone-500${onAtom ? "" : " mt-2"}`}>
              Based on: {loaded.basedOnLabel}
            </p>
            {resumedStalePrompt ? (
              <p className="mt-2 text-xs text-stone-500">
                Resumed saved Topic Engine session (prompt version may differ).
              </p>
            ) : null}
          </div>
          <Link
            href={librarianHref}
            className="shrink-0 text-sm font-medium text-primary hover:opacity-90"
          >
            Back to See What We Found
          </Link>
        </div>

        <div className="mx-auto max-w-[1040px] space-y-6">
          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          {busy && !session?.directions.length ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-stone-800">
                Finding supported directions…
              </p>
              <p className="mt-1 text-sm text-stone-600">
                Ranking strategic territories from your approved intelligence only.
              </p>
            </div>
          ) : null}

          {onAtom && session.packet ? (
            <TopicReadyView
              packet={session.packet}
              onBack={backToTopics}
              onSendToSocialMedia={sendToSocialMedia}
              sendError={sendError}
            />
          ) : null}

          {session && session.stage !== "ready" ? (
            <>
              {session.stage === "directions" || !selectedDirection ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                      Choose a direction
                    </p>
                    <p className="mt-1 text-sm text-stone-600">
                      Pick among up to three ways to open this research territory. We will propose
                      six topic opportunities inside the lane you choose.
                    </p>
                  </div>
                  <DirectionCards
                    directions={session.directions}
                    busy={busy}
                    onExplore={exploreDirection}
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        void runDirections(loaded.dto, loaded.basedOnLabel)
                      }
                    >
                      Refresh directions
                    </Button>
                    {session.lastDirectionsDiagnostics ? (
                      <div className="space-y-1">
                        <p className="text-[11px] text-stone-400">
                          Generation: draft {session.lastDirectionsDiagnostics.draftCount} · kept{" "}
                          {session.lastDirectionsDiagnostics.keptCount} · dropped{" "}
                          {session.lastDirectionsDiagnostics.droppedCount}
                          {session.lastDirectionsDiagnostics.model
                            ? ` · ${session.lastDirectionsDiagnostics.model}`
                            : ""}{" "}
                          · {session.promptVersion}
                        </p>
                        {session.lastDirectionsDiagnostics.droppedReasons &&
                        session.lastDirectionsDiagnostics.droppedReasons.length > 0 ? (
                          <p className="max-w-xl text-[11px] text-stone-400">
                            Dropped:{" "}
                            {session.lastDirectionsDiagnostics.droppedReasons.join(" · ")}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {session.stage === "topics" && selectedDirection ? (
                <div className="space-y-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() =>
                      persist({
                        ...session,
                        stage: "directions",
                        selectedTerritoryId: null,
                        topics: [],
                        selectedTopicId: null,
                        packet: null,
                      })
                    }
                  >
                    ← Change direction
                  </Button>
                  {busy ? (
                    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                      <p className="text-sm font-medium text-stone-800">
                        Generating six topic opportunities…
                      </p>
                    </div>
                  ) : (
                    <TopicOpportunityGrid
                      directionName={selectedDirection.name}
                      topics={session.topics}
                      onSelect={selectTopic}
                    />
                  )}
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
