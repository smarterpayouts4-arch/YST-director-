import type {
  PublishedLibraryDto,
  PublishedLibraryItem,
} from "@/features/content-intelligence/contracts/published-library";

/** Minimum non-hypothesis fact supports when enough relevant DTO facts exist. */
export const TEACHING_FACT_HARD_FLOOR = 2;

/**
 * Soft diagnostic hint only (never a hard failure).
 * Prompt doctrine: after floor 2, extras only for decision-rule; stop at 2 if sufficient.
 */
export const TEACHING_FACT_SOFT_PREFER = 3;

const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "for",
  "nor",
  "so",
  "to",
  "of",
  "in",
  "on",
  "at",
  "by",
  "as",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "it",
  "its",
  "this",
  "that",
  "these",
  "those",
  "with",
  "from",
  "into",
  "over",
  "under",
  "about",
  "than",
  "then",
  "when",
  "what",
  "which",
  "who",
  "how",
  "why",
  "you",
  "your",
  "we",
  "our",
  "they",
  "their",
  "them",
  "not",
  "no",
  "do",
  "does",
  "did",
  "can",
  "could",
  "should",
  "would",
  "may",
  "might",
  "will",
  "just",
  "also",
  "more",
  "most",
  "some",
  "any",
  "all",
  "each",
  "other",
  "only",
  "same",
  "such",
  "than",
  "too",
  "very",
  "has",
  "have",
  "had",
  "if",
  "because",
  "while",
  "before",
  "after",
  "between",
  "through",
  "during",
  "without",
  "within",
  "across",
  "must",
  "need",
  "needs",
  "using",
  "used",
  "use",
  "via",
]);

export type TopicTeachingBrief = {
  title: string;
  premise?: string;
  primaryTension?: string;
  tension?: string;
  opportunity?: string;
  desiredTakeaway?: string;
  audience?: string;
  customerMoment?: string;
};

export function isTeachingFactItem(item: PublishedLibraryItem): boolean {
  return item.kind === "fact" && item.isHypothesis !== true;
}

/** Kinds eligible for Atom supportingInsights (never audience/moment). */
export const TEACH_LIST_ELIGIBLE_KINDS = new Set([
  "fact",
  "competitor",
  "opportunity",
  "tension",
  "demand",
]);

/** When all topic-relative scores are zero, allow these non-fact kinds after facts. */
export const TEACH_FAIL_OPEN_KINDS = new Set(["tension", "opportunity"]);

export function isTeachListEligibleItem(item: PublishedLibraryItem): boolean {
  return (
    item.isHypothesis !== true && TEACH_LIST_ELIGIBLE_KINDS.has(item.kind)
  );
}

/** Tokenize topic-owned prose only — no domain dictionaries. */
export function tokenizeTopicBrief(brief: TopicTeachingBrief): Set<string> {
  const text = [
    brief.title,
    brief.premise,
    brief.primaryTension,
    brief.tension,
    brief.opportunity,
    brief.desiredTakeaway,
    brief.audience,
    brief.customerMoment,
  ]
    .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    .join(" ")
    .toLowerCase();

  const tokens = new Set<string>();
  for (const raw of text.split(/[^a-z0-9]+/g)) {
    if (raw.length < 3) continue;
    if (STOPWORDS.has(raw)) continue;
    tokens.add(raw);
    if (raw.endsWith("s") && raw.length >= 4) tokens.add(raw.slice(0, -1));
    if (raw.endsWith("ing") && raw.length >= 6) tokens.add(raw.slice(0, -3));
    if (raw.endsWith("ed") && raw.length >= 5) tokens.add(raw.slice(0, -2));
  }
  return tokens;
}

function statementMatchesTokens(statement: string, tokens: Set<string>): boolean {
  if (tokens.size === 0) return false;
  const lower = statement.toLowerCase();
  for (const token of tokens) {
    if (token.length >= 3 && lower.includes(token)) return true;
  }
  return false;
}

/** Count of topic-brief tokens that appear in the governed statement. */
export function scoreTeachingSupportItem(
  item: PublishedLibraryItem,
  brief: TopicTeachingBrief,
): number {
  if (!isTeachListEligibleItem(item)) return 0;
  const tokens = tokenizeTopicBrief(brief);
  if (tokens.size === 0) return 0;
  const lower = item.statement.toLowerCase();
  let score = 0;
  for (const token of tokens) {
    if (token.length >= 3 && lower.includes(token)) score += 1;
  }
  return score;
}

/**
 * Candidate teaching facts = governed non-hypothesis facts whose statement
 * lexically overlaps the topic brief (topic's own words only).
 * Fail-open when pool size < TEACHING_FACT_HARD_FLOOR (caller decides).
 */
export function listRelevantTeachingFactCandidates(
  dto: PublishedLibraryDto,
  brief: TopicTeachingBrief,
): PublishedLibraryItem[] {
  const tokens = tokenizeTopicBrief(brief);
  const facts = dto.items.filter(isTeachingFactItem);
  if (tokens.size === 0) return facts;
  const matched = facts.filter((item) => statementMatchesTokens(item.statement, tokens));
  // If overlap finds nothing, fail-open on density (do not invent relevance).
  return matched;
}

export function countSelectedTeachingFacts(
  supportingItemIds: string[],
  dto: PublishedLibraryDto,
): number {
  const byId = new Map(dto.items.map((i) => [i.itemId, i]));
  let n = 0;
  for (const id of supportingItemIds) {
    const item = byId.get(id);
    if (item && isTeachingFactItem(item)) n += 1;
  }
  return n;
}

export function unusedTeachingFactIds(
  candidates: PublishedLibraryItem[],
  supportingItemIds: string[],
): string[] {
  const used = new Set(supportingItemIds);
  return candidates.filter((c) => !used.has(c.itemId)).map((c) => c.itemId);
}
