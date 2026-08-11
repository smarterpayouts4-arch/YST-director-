import {
  GENERIC_TERMS,
  STOPWORDS,
} from "@/features/research-prompt-builder/lib/company-anchors/lexicon";
import type {
  AnchorBucket,
  CompanyAnchors,
} from "@/features/research-prompt-builder/lib/company-anchors/types";

export type AnchorHintBucket = {
  bucket: AnchorBucket;
  phrases: string[];
};

export type AnchorHintPolicy = {
  requiredBuckets?: AnchorBucket[];
  minDistinctBuckets?: number;
  minDistinctTokens?: number;
};

/** Artifact fragments that rarely appear verbatim in natural prose. */
const ARTIFACT_PHRASES = new Set(
  [
    "states online tampa",
    "online tampa",
    "us adult",
    "out perform generic",
    "possible shoppers prefer",
    "24 7 emergency",
    "hits a sudden",
    "e commerce home goods",
    "online shipping",
    "us small business",
    "owners under 3m",
    "states remote first",
    "supplements ai",
    "states and canada",
    "fp a leads",
    "paid form aware",
    "claims and multiple",
    "decoding education compare",
    "perform generic wellness",
    "questions without selling",
    "same day trusted",
    "diners seeking",
    "day storytelling",
    "commerce home",
    "us homeowners",
    "states remote",
    "united states remote",
  ].map((t) => t.toLowerCase()),
);

function wordCount(phrase: string): number {
  return phrase.split(/\s+/).filter(Boolean).length;
}

function hasDigitToken(phrase: string): boolean {
  return phrase.split(/\s+/).some((w) => /\d/.test(w));
}

function startsOrEndsWithFiltered(phrase: string): boolean {
  const words = phrase.split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const first = words[0]!;
  const last = words[words.length - 1]!;
  return (
    GENERIC_TERMS.has(first) ||
    GENERIC_TERMS.has(last) ||
    STOPWORDS.has(first) ||
    STOPWORDS.has(last)
  );
}

function proseScore(phrase: string): number {
  const words = phrase.split(/\s+/).filter(Boolean);
  const n = words.length;
  let score = 0;

  if (ARTIFACT_PHRASES.has(phrase)) score -= 100;
  if (hasDigitToken(phrase)) score -= 40;
  if (startsOrEndsWithFiltered(phrase)) score -= 30;

  // Prefer compact 2–3 word content phrases; de-prioritize long sliding-window junk.
  if (n === 2) score += 48;
  else if (n === 3) score += 36;
  else if (n === 1) score += 28;
  else score -= 10;

  // Penalize tokens that look like mid-sentence joins (common extract artifacts).
  if (/\b(ai|powered|seeking|under|first)\b/i.test(phrase) && n >= 2) {
    score -= 12;
  }

  const contentWords = words.filter(
    (w) => !STOPWORDS.has(w) && !GENERIC_TERMS.has(w),
  );
  score += contentWords.length * 12;
  score += Math.min(phrase.length, 24);

  // Prefer proper-noun-like short geography / brand singles that models reuse.
  if (n === 1 && phrase.length >= 4 && phrase.length <= 12) score += 10;

  return score;
}

function rankPhrases(phrases: string[], limit: number): string[] {
  const seen = new Set<string>();
  const ranked = [...phrases]
    .map((phrase, index) => ({ phrase, score: proseScore(phrase) - index * 0.01 }))
    .sort((a, b) => b.score - a.score);

  const out: string[] = [];
  for (const item of ranked) {
    if (item.score < -20) continue;
    if (seen.has(item.phrase)) continue;
    seen.add(item.phrase);
    out.push(item.phrase);
    if (out.length >= limit) break;
  }

  // Always try to keep the strongest short single token if we only got awkward multi-words.
  if (out.length > 0 && !out.some((p) => wordCount(p) === 1)) {
    const single = ranked.find(
      (r) => wordCount(r.phrase) === 1 && r.score >= -10 && !seen.has(r.phrase),
    );
    if (single) {
      out[out.length - 1] = single.phrase;
    }
  }

  return out;
}

/**
 * Prompts-only: pick natural distinctive phrases for checklist/repair hints.
 * Does not change extraction, matching, or lint policies.
 */
export function selectAnchorHints(
  policy: AnchorHintPolicy | undefined,
  anchors: CompanyAnchors,
): AnchorHintBucket[] {
  const required = policy?.requiredBuckets ?? [];
  const result: AnchorHintBucket[] = [];

  for (const bucket of required) {
    const phrases = rankPhrases(anchors[bucket] ?? [], 3);
    if (phrases.length) {
      result.push({ bucket, phrases });
    }
  }

  return result;
}

export function formatAnchorHintClause(
  policy: AnchorHintPolicy | undefined,
  hints: AnchorHintBucket[],
): string | null {
  if (hints.length === 0) return null;
  const minBuckets = policy?.minDistinctBuckets ?? 1;
  const minTokens = policy?.minDistinctTokens ?? 1;
  const listed = hints
    .flatMap((h) => h.phrases)
    .slice(0, 8)
    .map((p) => `"${p}"`)
    .join(", ");
  return (
    `Same continuous paragraph (no blank line): include at least ${minTokens} distinctive ` +
    `phrase(s) spanning at least ${Math.min(minBuckets, hints.length)} of these buckets ` +
    `(${hints.map((h) => h.bucket).join(", ")}), choosing from: ${listed}.`
  );
}
