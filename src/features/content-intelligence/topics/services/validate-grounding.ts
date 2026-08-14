import type { PublishedLibraryDto } from "@/features/content-intelligence/contracts/published-library";
import type { TopicDirectionsDraft } from "@/features/content-intelligence/topics/schemas/direction";
import type { TopicDirection } from "@/features/content-intelligence/topics/schemas/direction";
import type { TopicOpportunitiesDraft } from "@/features/content-intelligence/topics/schemas/topic-opportunity";
import type { TopicOpportunity } from "@/features/content-intelligence/topics/schemas/topic-opportunity";
import {
  formatDirectionGroundingDropReason,
  formatTopicGroundingDropReason,
  validateDirectionGrounding,
  validateTopicGrounding,
} from "@/features/content-intelligence/topics/services/topic-grounding";

function itemIdsInDto(dto: PublishedLibraryDto): Set<string> {
  return new Set(dto.items.map((i) => i.itemId));
}

/**
 * One-site hygiene: if the model pasted a DTO itemId, replace with statement
 * only when the item matches the field's meaning. Otherwise keep trimmed text.
 * Never resolve again in UI or buildTopicPacket.
 */
export function resolveDtoRefOrKeep(
  value: string,
  dto: PublishedLibraryDto,
  match: (item: PublishedLibraryDto["items"][number]) => boolean,
): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const item = dto.items.find((i) => i.itemId === trimmed);
  if (item && match(item)) return item.statement;
  return trimmed;
}

/**
 * Keep only grounded directions (1–3). Never pad.
 * Grounding = validateDirectionGrounding. Priorities renumbered 1..n uniquely.
 */
export function curateDirections(input: {
  draft: TopicDirectionsDraft;
  dto: PublishedLibraryDto;
  idFactory: () => string;
}): { directions: TopicDirection[]; dropped: string[] } {
  const dropped: string[] = [];
  const kept: TopicDirection[] = [];

  const sorted = [...input.draft.directions].sort((a, b) => a.priority - b.priority);

  for (let i = 0; i < sorted.length; i++) {
    const d = sorted[i]!;
    if (kept.length >= 3) {
      dropped.push(`${d.name}: exceeds max 3`);
      continue;
    }
    const groundingIssues = validateDirectionGrounding(d, input.dto, i);
    if (groundingIssues.length > 0) {
      dropped.push(
        formatDirectionGroundingDropReason(d, input.dto, i) ??
          `${d.name}: ungrounded`,
      );
      continue;
    }

    kept.push({
      territoryId: input.idFactory(),
      name: d.name.trim(),
      description: d.description.trim(),
      decisionQuestion: d.decisionQuestion.trim(),
      primaryAudience: d.primaryAudience.trim(),
      primaryMoment: d.primaryMoment.trim(),
      primaryTension: d.primaryTension.trim(),
      primaryOpportunity: d.primaryOpportunity.trim(),
      supportingItemIds: d.supportingItemIds,
      confidence: d.confidence,
      priority: kept.length + 1,
      rationale: d.rationale.trim(),
      hypothesisDependent: d.hypothesisDependent,
      unresolvedDependent: d.unresolvedDependent,
    });
  }

  return { directions: kept, dropped };
}

/**
 * Keep only grounded topics (max 6). Grounding rules = validateTopicGrounding.
 * Priorities renumbered 1..kept uniquely.
 */
export function curateTopics(input: {
  draft: TopicOpportunitiesDraft;
  dto: PublishedLibraryDto;
  territoryId: string;
  idFactory: () => string;
}): { topics: TopicOpportunity[]; dropped: string[] } {
  const known = itemIdsInDto(input.dto);
  const dropped: string[] = [];
  const kept: TopicOpportunity[] = [];

  const sorted = [...input.draft.topics].sort((a, b) => a.priority - b.priority);

  for (let i = 0; i < sorted.length; i++) {
    const t = sorted[i]!;
    if (kept.length >= 6) break;

    const groundingIssues = validateTopicGrounding(t, input.dto, i);
    if (groundingIssues.length > 0) {
      dropped.push(
        formatTopicGroundingDropReason(t, input.dto, i) ?? `${t.title}: ungrounded`,
      );
      continue;
    }

    const restrictionItemIds = t.restrictionItemIds.filter((id) => known.has(id));
    const limitationItemIds = t.limitationItemIds.filter((id) => known.has(id));

    kept.push({
      topicId: input.idFactory(),
      territoryId: input.territoryId,
      title: t.title.trim(),
      premise: t.premise.trim(),
      audience: t.audience.trim(),
      customerMoment: t.customerMoment.trim(),
      primaryTension: t.primaryTension.trim(),
      opportunity: t.opportunity.trim(),
      whyItMatters: t.whyItMatters.trim(),
      desiredTakeaway: t.desiredTakeaway.trim(),
      priority: kept.length + 1,
      confidence: t.confidence,
      supportingItemIds: t.supportingItemIds,
      hypothesisDependencies: t.hypothesisDependencies
        .map((s) =>
          resolveDtoRefOrKeep(s, input.dto, (item) => item.isHypothesis === true),
        )
        .filter(Boolean),
      unresolvedAssumptions: t.unresolvedAssumptions
        .map((s) =>
          resolveDtoRefOrKeep(s, input.dto, (item) => item.kind === "unresolved"),
        )
        .filter(Boolean),
      restrictionItemIds,
      limitationItemIds,
    });
  }

  return { topics: kept, dropped };
}
