"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { TopicPacket } from "@/features/content-intelligence/contracts/topic-packet";
import {
  formatTopicPacketJson,
  formatTopicPacketMarkdown,
} from "@/features/content-intelligence/topics/services/format-topic-packet";

const EVIDENCE_QUOTE_CAP = 12;
const SOURCE_REF_CAP = 12;
const PROVENANCE_CAP = 8;

export function TopicReadyView({
  packet,
  onBack,
  onSendToSocialMedia,
  sendError,
}: {
  packet: TopicPacket;
  /** Abandon this Atom selection and return to the same topic list (07). */
  onBack?: () => void;
  onSendToSocialMedia?: () => void;
  sendError?: string | null;
}) {
  const [copyState, setCopyState] = useState<"idle" | "json" | "md">("idle");
  const proofQuotes = packet.evidenceQuotes.slice(0, EVIDENCE_QUOTE_CAP);
  const sourceRefs = packet.sourceRefs.slice(0, SOURCE_REF_CAP);
  const provenanceNotes = packet.provenanceNotes.slice(0, PROVENANCE_CAP);
  const hasUncertainty =
    packet.hypothesisDependencies.length > 0 ||
    packet.unresolvedAssumptions.length > 0;
  const hasRestrictions =
    packet.restrictions.length > 0 || packet.limitations.length > 0;

  const flashCopied = (kind: "json" | "md") => {
    setCopyState(kind);
    window.setTimeout(() => setCopyState("idle"), 1500);
  };

  const copyJson = async () => {
    await navigator.clipboard.writeText(formatTopicPacketJson(packet));
    flashCopied("json");
  };

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(formatTopicPacketMarkdown(packet));
    flashCopied("md");
  };

  const downloadJson = () => {
    const blob = new Blob([formatTopicPacketJson(packet)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `canonical-topic-packet-${packet.topicId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
          Topic packet
        </p>
        <h1 className="editorial mt-1 text-2xl text-stone-900">{packet.title}</h1>
        <p className="mt-2 text-sm text-stone-600">
          Research, evidence, and strategic direction in one handoff — export when you are ready
          for the next chapter.
        </p>
        {onBack ? (
          <Button variant="ghost" size="sm" className="mt-3" onClick={onBack}>
            ← Back to Make Your Choice
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => void copyJson()}>
          {copyState === "json" ? "Copied JSON" : "Copy packet JSON"}
        </Button>
        <Button type="button" variant="secondary" onClick={downloadJson}>
          Download .json
        </Button>
        <Button type="button" variant="outline" onClick={() => void copyMarkdown()}>
          {copyState === "md" ? "Copied brief" : "Copy brief (Markdown)"}
        </Button>
        {onSendToSocialMedia ? (
          <Button type="button" variant="default" onClick={onSendToSocialMedia}>
            Send to Social Media
          </Button>
        ) : null}
      </div>
      {sendError ? (
        <p className="text-sm text-red-700">{sendError}</p>
      ) : null}

      {/* Always-visible spine — keeps first viewport short */}
      <div className="space-y-4 border-t border-stone-100 pt-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
            Premise
          </p>
          <p className="mt-1 text-sm text-stone-700">{packet.premise}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
            Strategic question
          </p>
          <p className="mt-1 text-sm text-stone-700">{packet.decisionQuestion}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
            Key takeaway
          </p>
          <p className="mt-1 text-sm text-stone-700">{packet.desiredTakeaway}</p>
        </div>
      </div>

      {/* Progressive disclosure — detail stays off the page until opened */}
      <div className="space-y-2 border-t border-stone-100 pt-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-stone-400">
          Packet detail
        </p>

        <Disclosure title="Strategy context">
          <Field label="Audience & moment">
            <p className="text-sm text-stone-700">
              {packet.audience}
              <br />
              {packet.customerMoment}
            </p>
          </Field>
          <Field label="Core tension">
            <p className="text-sm text-stone-700">{packet.tension}</p>
          </Field>
          <Field label="Opportunity">
            <p className="text-sm text-stone-700">{packet.opportunity}</p>
          </Field>
          <Field label="Why it matters">
            <p className="text-sm text-stone-700">{packet.whyItMatters}</p>
          </Field>
        </Disclosure>

        <Disclosure title="Teaching & evidence">
          <Field label="What this content should teach">
            <ul className="list-disc space-y-1.5 pl-4 text-sm text-stone-700">
              {packet.supportingInsights.map((insight) => (
                <li key={insight}>{insight}</li>
              ))}
            </ul>
          </Field>
          <Field label="Evidence / proof">
            {proofQuotes.length > 0 ? (
              <ul className="space-y-2 text-sm italic text-stone-700">
                {proofQuotes.map((q) => (
                  <li key={q}>“{q}”</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-stone-500">
                No source quotes on selected support items.
              </p>
            )}
            {provenanceNotes.length > 0 ? (
              <p className="mt-2 text-xs text-stone-500">
                Provenance: {provenanceNotes.join(" · ")}
              </p>
            ) : null}
            {sourceRefs.length > 0 ? (
              <div className="mt-1 space-y-0.5 text-xs text-stone-500">
                <p>Sources / provenance: {sourceRefs.join(" · ")}</p>
                <p>
                  Show where supporting material came from — not authorization for claims
                  beyond this packet’s evidence.
                </p>
              </div>
            ) : null}
          </Field>
        </Disclosure>

        {hasUncertainty || hasRestrictions ? (
          <Disclosure title="Uncertainty & restrictions">
            {hasUncertainty ? (
              <Field label="Uncertainty">
                <ul className="list-disc space-y-1 pl-4 text-sm text-stone-700">
                  {packet.hypothesisDependencies.map((h) => (
                    <li key={h}>
                      {h} <span className="text-stone-500">(hypothesis)</span>
                    </li>
                  ))}
                  {packet.unresolvedAssumptions.map((u) => (
                    <li key={u}>
                      {u} <span className="text-stone-500">(unresolved)</span>
                    </li>
                  ))}
                </ul>
              </Field>
            ) : null}
            {hasRestrictions ? (
              <Field label="Restrictions & limitations">
                <ul className="list-disc space-y-1 pl-4 text-sm text-stone-700">
                  {packet.restrictions.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                  {packet.limitations.map((l) => (
                    <li key={`lim-${l}`}>
                      {l} <span className="text-stone-500">(limitation)</span>
                    </li>
                  ))}
                </ul>
              </Field>
            ) : null}
          </Disclosure>
        ) : null}

        <Disclosure title="Identity & support IDs">
          <dl className="grid gap-1 text-xs text-stone-600 sm:grid-cols-2">
            <IdentityRow label="topicPacketId" value={packet.topicPacketId} />
            <IdentityRow label="topicId" value={packet.topicId} />
            <IdentityRow label="territoryId" value={packet.territoryId} />
            <IdentityRow label="libraryId" value={packet.libraryId} />
            <IdentityRow label="artifactId" value={packet.artifactId} />
            <IdentityRow label="createdAt" value={packet.createdAt} />
            <IdentityRow
              label="confidence"
              value={packet.confidence}
              hint="Topic-selection confidence; not overall research certainty"
            />
          </dl>
          <Field label="Supporting item IDs">
            <p className="break-all font-mono text-xs text-stone-600">
              {packet.supportingItemIds.join(", ")}
            </p>
          </Field>
        </Disclosure>
      </div>

      <p className="text-sm text-stone-500">
        Export when you are ready for the Social Media chapter ahead.
      </p>
    </section>
  );
}

function Disclosure({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <details className="group rounded-xl border border-stone-200 bg-stone-50/40 open:bg-white">
      <summary className="cursor-pointer list-none px-3.5 py-3 text-sm font-medium text-stone-800 marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-3">
          <span>{title}</span>
          <span
            aria-hidden
            className="text-xs font-normal text-stone-400 transition-transform group-open:rotate-180"
          >
            ▾
          </span>
        </span>
      </summary>
      {/* Cap expanded height so opening a section doesn't grow the page endlessly */}
      <div className="max-h-[min(50vh,28rem)] space-y-4 overflow-y-auto border-t border-stone-200 px-3.5 py-3">
        {children}
      </div>
    </details>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
        {label}
      </p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function IdentityRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className={hint ? "sm:col-span-2" : undefined}>
      <div className="flex gap-2">
        <dt className="shrink-0 font-medium text-stone-500">{label}</dt>
        <dd className="break-all font-mono text-stone-700">{value}</dd>
      </div>
      {hint ? <p className="mt-0.5 text-[11px] text-stone-500">{hint}</p> : null}
    </div>
  );
}
