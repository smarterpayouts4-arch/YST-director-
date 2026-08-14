import type { PublishedLibraryDto } from "@/features/content-intelligence/contracts/published-library";
import {
  TopicPacketSchema,
  type TopicPacket,
} from "@/features/content-intelligence/contracts/topic-packet";
import type { TopicDirection } from "@/features/content-intelligence/topics/schemas/direction";
import type { TopicOpportunity } from "@/features/content-intelligence/topics/schemas/topic-opportunity";
import {
  isTeachListEligibleItem,
  isTeachingFactItem,
  scoreTeachingSupportItem,
  TEACH_FAIL_OPEN_KINDS,
  type TopicTeachingBrief,
} from "@/features/content-intelligence/topics/services/teaching-support";

const SUPPORTING_INSIGHTS_CAP = 8;

type SupportItem = PublishedLibraryDto["items"][number];

/**
 * Teach-list hygiene (ci-topics-1.1.9):
 * - skip hypotheses, blanks; exact-dedupe; hard cap 8
 * - never audience/moment (already first-class fields)
 * - topic-relative score over eligible kinds: fact|competitor|opportunity|tension|demand
 * - when all scores are zero: fail-open facts then tension|opportunity
 * supportingItemIds on the packet stay untouched (grounding + teach substrate receipt).
 */
function collectSupportingInsights(
  supportItems: SupportItem[],
  brief: TopicTeachingBrief,
): {
  insights: string[];
  contributingItems: SupportItem[];
} {
  const eligible = supportItems.filter(isTeachListEligibleItem);
  const scored = eligible.map((item, index) => ({
    item,
    index,
    score: scoreTeachingSupportItem(item, brief),
  }));
  const anyPositive = scored.some((row) => row.score > 0);

  const ordered: SupportItem[] = anyPositive
    ? scored
        .filter((row) => row.score > 0)
        .sort((a, b) => b.score - a.score || a.index - b.index)
        .map((row) => row.item)
    : [
        ...eligible.filter(isTeachingFactItem),
        ...eligible.filter(
          (item) =>
            !isTeachingFactItem(item) && TEACH_FAIL_OPEN_KINDS.has(item.kind),
        ),
      ];

  const insights: string[] = [];
  const contributingItems: SupportItem[] = [];
  const seen = new Set<string>();
  for (const item of ordered) {
    const statement = item.statement.trim();
    if (!statement || seen.has(statement)) continue;
    seen.add(statement);
    insights.push(statement);
    contributingItems.push(item);
    if (insights.length >= SUPPORTING_INSIGHTS_CAP) break;
  }
  return { insights, contributingItems };
}

/**
 * Builds ONE canonical Topic Packet from selected topic + DTO grounding.
 * Never includes raw research or platform-specific fields.
 *
 * Lifecycle: each selectTopic call mints a new topicPacketId. Back-to-Topics
 * clears packet + selectedTopicId and keeps the topic list; re-selecting the
 * same topic intentionally creates a new Atom (no packet history/reuse yet —
 * channels are not built). Hypothesis/unresolved strings must already be
 * human-readable from curateTopics (do not resolve itemIds here).
 */
export function buildTopicPacket(input: {
  dto: PublishedLibraryDto;
  direction: TopicDirection;
  topic: TopicOpportunity;
  artifactId: string;
  projectId?: string;
}): TopicPacket {
  const byId = new Map(input.dto.items.map((i) => [i.itemId, i]));
  const supportIds = input.topic.supportingItemIds.filter((id) => byId.has(id));
  if (supportIds.length < 1) {
    throw new Error("Topic has no supporting Librarian itemIds in the DTO.");
  }

  const supportItems = supportIds.map((id) => byId.get(id)!);
  const brief: TopicTeachingBrief = {
    title: input.topic.title,
    premise: input.topic.premise,
    primaryTension: input.topic.primaryTension,
    opportunity: input.topic.opportunity,
    desiredTakeaway: input.topic.desiredTakeaway,
    audience: input.topic.audience,
    customerMoment: input.topic.customerMoment,
  };
  const { insights: supportingInsights, contributingItems } =
    collectSupportingInsights(supportItems, brief);
  if (supportingInsights.length < 1) {
    throw new Error("Topic support items have no usable governed statements.");
  }

  const restrictionIds = [
    ...new Set([
      ...input.topic.restrictionItemIds,
      ...input.dto.items.filter((i) => i.kind === "restriction").map((i) => i.itemId),
    ]),
  ].filter((id) => byId.has(id));
  const limitationIds = [
    ...new Set([
      ...input.topic.limitationItemIds,
      ...input.dto.items.filter((i) => i.kind === "limitation").map((i) => i.itemId),
    ]),
  ].filter((id) => byId.has(id));

  const restrictions = restrictionIds.map((id) => byId.get(id)!.statement);
  const limitations = limitationIds.map((id) => byId.get(id)!.statement);
  const doNotClaim = restrictions.map((r) => r);

  const evidenceQuotes = supportItems
    .filter((i) => i.isHypothesis !== true)
    .map((i) => i.evidenceQuote)
    .filter((q): q is string => typeof q === "string" && q.trim().length > 0)
    .slice(0, 12);

  // Provenance only from items that contributed teach insights or used quotes.
  const quoteContributors = supportItems.filter(
    (i) =>
      i.isHypothesis !== true &&
      typeof i.evidenceQuote === "string" &&
      i.evidenceQuote.trim().length > 0 &&
      evidenceQuotes.includes(i.evidenceQuote),
  );
  const provenanceItems = [...new Set([...contributingItems, ...quoteContributors])];

  const packet: TopicPacket = {
    topicPacketId: `tp_${globalThis.crypto.randomUUID()}`,
    projectId: input.projectId ?? input.dto.projectId,
    artifactId: input.artifactId,
    libraryId: input.dto.libraryId,
    territoryId: input.direction.territoryId,
    topicId: input.topic.topicId,
    version: 1,
    status: "selected",
    createdAt: new Date().toISOString(),
    title: input.topic.title,
    premise: input.topic.premise,
    audience: input.topic.audience,
    customerMoment: input.topic.customerMoment,
    tension: input.topic.primaryTension,
    opportunity: input.topic.opportunity,
    decisionQuestion: input.direction.decisionQuestion.trim(),
    desiredTakeaway: input.topic.desiredTakeaway,
    whyItMatters: input.topic.whyItMatters,
    supportingInsights,
    supportingItemIds: supportIds,
    sourceRefs: [...new Set(provenanceItems.flatMap((i) => i.sourceRefs))].slice(
      0,
      24,
    ),
    evidenceQuotes,
    provenanceNotes: provenanceItems.map((i) => i.provenance).slice(0, 24),
    confidence: input.topic.confidence,
    hypothesisDependencies: input.topic.hypothesisDependencies,
    unresolvedAssumptions: [
      ...input.topic.unresolvedAssumptions,
      ...input.dto.items
        .filter((i) => i.kind === "unresolved")
        .map((i) => i.statement),
    ].slice(0, 8),
    restrictions,
    limitations,
    doNotClaim,
  };

  return TopicPacketSchema.parse(packet);
}
