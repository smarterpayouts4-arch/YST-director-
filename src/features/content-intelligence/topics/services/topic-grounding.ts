import type { PublishedLibraryDto } from "@/features/content-intelligence/contracts/published-library";
import {
  TEACHING_FACT_HARD_FLOOR,
  TEACHING_FACT_SOFT_PREFER,
  countSelectedTeachingFacts,
  listRelevantTeachingFactCandidates,
  unusedTeachingFactIds,
  type TopicTeachingBrief,
} from "@/features/content-intelligence/topics/services/teaching-support";

/** Minimal shape for grounding (topic or direction draft). */
export type SupportingIdsGroundingInput = {
  label?: string;
  supportingItemIds: string[];
};

export type SupportingIdsGroundingIssue =
  | {
      type: "unknown_item_id";
      index: number;
      itemId: string;
      label?: string;
    }
  | {
      type: "missing_kind";
      index: number;
      required: "opportunity|tension" | "audience|moment";
      actualKinds: string[];
      label?: string;
    };

export type TopicGroundingIssue =
  | {
      type: "unknown_item_id";
      topicIndex: number;
      itemId: string;
      title?: string;
    }
  | {
      type: "missing_kind";
      topicIndex: number;
      required: "opportunity|tension" | "audience|moment";
      actualKinds: string[];
      title?: string;
    }
  | {
      type: "insufficient_teaching_facts";
      topicIndex: number;
      title?: string;
      selectedTeachingFacts: number;
      candidatePoolSize: number;
      requiredFloor: number;
      preferCount: number;
      unusedCandidateFactIds: string[];
    };

export type TopicGroundingInput = TopicTeachingBrief & {
  supportingItemIds: string[];
};

export const MAX_TOPIC_GROUNDING_DIAGNOSTICS = 8;

function itemIdsInDto(dto: PublishedLibraryDto): Set<string> {
  return new Set(dto.items.map((i) => i.itemId));
}

function kindsForIds(dto: PublishedLibraryDto, ids: string[]): string[] {
  const set = new Set(ids);
  const kinds = new Set(
    dto.items.filter((i) => set.has(i.itemId)).map((i) => i.kind),
  );
  return [...kinds].sort();
}

function validateSupportingIdsGrounding(
  unit: SupportingIdsGroundingInput,
  dto: PublishedLibraryDto,
  index: number,
): SupportingIdsGroundingIssue[] {
  const issues: SupportingIdsGroundingIssue[] = [];
  const known = itemIdsInDto(dto);
  const label = unit.label?.trim() || undefined;

  for (const itemId of unit.supportingItemIds) {
    if (!known.has(itemId)) {
      issues.push({ type: "unknown_item_id", index, itemId, label });
    }
  }

  const actualKinds = kindsForIds(dto, unit.supportingItemIds);
  const kindSet = new Set(actualKinds);
  const hasOppOrTension = kindSet.has("opportunity") || kindSet.has("tension");
  const hasAudOrMoment = kindSet.has("audience") || kindSet.has("moment");

  if (!hasOppOrTension) {
    issues.push({
      type: "missing_kind",
      index,
      required: "opportunity|tension",
      actualKinds,
      label,
    });
  }
  if (!hasAudOrMoment) {
    issues.push({
      type: "missing_kind",
      index,
      required: "audience|moment",
      actualKinds,
      label,
    });
  }

  return issues;
}

function toTopicIssue(issue: SupportingIdsGroundingIssue): TopicGroundingIssue {
  if (issue.type === "unknown_item_id") {
    return {
      type: "unknown_item_id",
      topicIndex: issue.index,
      itemId: issue.itemId,
      title: issue.label,
    };
  }
  return {
    type: "missing_kind",
    topicIndex: issue.index,
    required: issue.required,
    actualKinds: issue.actualKinds,
    title: issue.label,
  };
}

/**
 * Canonical grounding rules (shared by repair validate + curators).
 * Framing: opportunity|tension + audience|moment.
 * Teaching density: when ≥2 relevant non-hypothesis facts exist in the DTO,
 * require ≥2 of them in supportingItemIds (extras for decision-rule are soft; never hard-fail for 3).
 */
export function validateTopicGrounding(
  topic: TopicGroundingInput,
  dto: PublishedLibraryDto,
  topicIndex: number,
): TopicGroundingIssue[] {
  const issues = validateSupportingIdsGrounding(
    { label: topic.title, supportingItemIds: topic.supportingItemIds },
    dto,
    topicIndex,
  ).map(toTopicIssue);

  const brief: TopicTeachingBrief = {
    title: topic.title,
    premise: topic.premise,
    primaryTension: topic.primaryTension,
    tension: topic.tension,
    opportunity: topic.opportunity,
    desiredTakeaway: topic.desiredTakeaway,
    audience: topic.audience,
    customerMoment: topic.customerMoment,
  };
  const candidates = listRelevantTeachingFactCandidates(dto, brief);
  if (candidates.length >= TEACHING_FACT_HARD_FLOOR) {
    const selectedTeachingFacts = countSelectedTeachingFacts(
      topic.supportingItemIds,
      dto,
    );
    if (selectedTeachingFacts < TEACHING_FACT_HARD_FLOOR) {
      issues.push({
        type: "insufficient_teaching_facts",
        topicIndex,
        title: topic.title?.trim() || undefined,
        selectedTeachingFacts,
        candidatePoolSize: candidates.length,
        requiredFloor: TEACHING_FACT_HARD_FLOOR,
        preferCount: TEACHING_FACT_SOFT_PREFER,
        unusedCandidateFactIds: unusedTeachingFactIds(
          candidates,
          topic.supportingItemIds,
        ),
      });
    }
  }

  return issues;
}

export function validateDraftTopicGrounding(
  topics: TopicGroundingInput[],
  dto: PublishedLibraryDto,
): TopicGroundingIssue[] {
  return topics.flatMap((topic, topicIndex) =>
    validateTopicGrounding(topic, dto, topicIndex),
  );
}

export function validateDirectionGrounding(
  direction: { name?: string; supportingItemIds: string[] },
  dto: PublishedLibraryDto,
  directionIndex: number,
): SupportingIdsGroundingIssue[] {
  return validateSupportingIdsGrounding(
    { label: direction.name, supportingItemIds: direction.supportingItemIds },
    dto,
    directionIndex,
  );
}

export function validateDraftDirectionGrounding(
  directions: { name?: string; supportingItemIds: string[] }[],
  dto: PublishedLibraryDto,
): SupportingIdsGroundingIssue[] {
  return directions.flatMap((direction, directionIndex) =>
    validateDirectionGrounding(direction, dto, directionIndex),
  );
}

export function formatGroundingIssueForRepair(issue: TopicGroundingIssue): string {
  const label =
    issue.title != null && issue.title.length > 0
      ? `topics[${issue.topicIndex}] "${issue.title}"`
      : `topics[${issue.topicIndex}]`;
  if (issue.type === "unknown_item_id") {
    return `${label}: unknown supportingItemId "${issue.itemId}" — use real itemId values from the PublishedLibraryDto only.`;
  }
  if (issue.type === "insufficient_teaching_facts") {
    const unused =
      issue.unusedCandidateFactIds.length > 0
        ? issue.unusedCandidateFactIds.slice(0, 12).join(", ")
        : "(none listed)";
    return (
      `${label}: insufficient teaching-fact support — selected ${issue.selectedTeachingFacts} relevant non-hypothesis fact(s); ` +
      `require ≥${issue.requiredFloor} when ≥${issue.requiredFloor} relevant DTO facts exist ` +
      `(pool=${issue.candidatePoolSize}). After the floor, add the fewest extras only for core reasoning, contrast, or decision rule; ` +
      `if ${issue.requiredFloor} already teach that, stop at ${issue.requiredFloor}. Never pad with market/loyalty/platform/reach stats. ` +
      `Add or replace supportingItemIds only using unused candidate fact IDs: ${unused}. ` +
      `Do not rewrite title, premise, audience, customerMoment, primaryTension, opportunity, or desiredTakeaway.`
    );
  }
  return `${label}: missing ${issue.required} support (actual supporting kinds: [${issue.actualKinds.join(", ") || "none"}]). Include real DTO itemIds whose kinds cover ${issue.required}.`;
}

export function formatDirectionGroundingIssueForRepair(
  issue: SupportingIdsGroundingIssue,
): string {
  const label =
    issue.label != null && issue.label.length > 0
      ? `directions[${issue.index}] "${issue.label}"`
      : `directions[${issue.index}]`;
  if (issue.type === "unknown_item_id") {
    return `${label}: unknown supportingItemId "${issue.itemId}" — use real itemId values from the PublishedLibraryDto only.`;
  }
  return `${label}: missing ${issue.required} support (actual supporting kinds: [${issue.actualKinds.join(", ") || "none"}]). Include real DTO itemIds whose kinds cover ${issue.required}.`;
}

/** Short drop line for curator / fail-closed UI (same rules as validate). */
export function formatTopicGroundingDropReason(
  topic: TopicGroundingInput,
  dto: PublishedLibraryDto,
  topicIndex: number,
): string | null {
  const issues = validateTopicGrounding(topic, dto, topicIndex);
  if (issues.length === 0) return null;
  const title = topic.title?.trim() || `topics[${topicIndex}]`;
  const parts = issues.map((issue) => {
    if (issue.type === "unknown_item_id") {
      return `unknown itemId "${issue.itemId}"`;
    }
    if (issue.type === "insufficient_teaching_facts") {
      return `need ≥${issue.requiredFloor} teaching facts (has ${issue.selectedTeachingFacts}, pool ${issue.candidatePoolSize})`;
    }
    return `missing ${issue.required} (kinds: [${issue.actualKinds.join(", ") || "none"}])`;
  });
  return `${title}: ${parts.join("; ")}`;
}

export function formatDirectionGroundingDropReason(
  direction: { name?: string; supportingItemIds: string[] },
  dto: PublishedLibraryDto,
  directionIndex: number,
): string | null {
  const issues = validateDirectionGrounding(direction, dto, directionIndex);
  if (issues.length === 0) return null;
  const name = direction.name?.trim() || `directions[${directionIndex}]`;
  const parts = issues.map((issue) => {
    if (issue.type === "unknown_item_id") {
      return `unknown itemId "${issue.itemId}"`;
    }
    return `missing ${issue.required} (kinds: [${issue.actualKinds.join(", ") || "none"}])`;
  });
  return `${name}: ${parts.join("; ")}`;
}
