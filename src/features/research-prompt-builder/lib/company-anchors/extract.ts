import {
  GENERIC_TERMS,
  STOPWORDS,
} from "@/features/research-prompt-builder/lib/company-anchors/lexicon";
import type {
  AnchorBucket,
  CompanyAnchors,
} from "@/features/research-prompt-builder/lib/company-anchors/types";

export function normalizeAnchorText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isGeneric(term: string): boolean {
  const n = normalizeAnchorText(term);
  if (!n) return true;
  if (GENERIC_TERMS.has(n)) return true;
  if (STOPWORDS.has(n)) return true;
  if (n.split(" ").every((part) => GENERIC_TERMS.has(part) || STOPWORDS.has(part))) {
    return true;
  }
  return false;
}

function isDistinctiveCandidate(term: string): boolean {
  const n = normalizeAnchorText(term);
  if (!n || isGeneric(n)) return false;
  const words = n.split(" ").filter(Boolean);
  if (words.some((w) => STOPWORDS.has(w) && words.length === 1)) return false;
  if (words.length > 1) {
    if (STOPWORDS.has(words[0]!) || STOPWORDS.has(words[words.length - 1]!)) {
      return false;
    }
    if (words.filter((w) => !STOPWORDS.has(w) && !GENERIC_TERMS.has(w)).length === 0) {
      return false;
    }
    return n.length >= 8 && words.length <= 4;
  }
  if (/\d/.test(n)) return n.length >= 2;
  return n.length >= 4;
}

function extractCandidates(value: string, opts?: { allowFullValue?: boolean }): string[] {
  const normalized = normalizeAnchorText(value);
  if (!normalized) return [];
  const words = normalized.split(" ").filter(Boolean);
  const out: string[] = [];

  for (let size = 3; size >= 2; size -= 1) {
    for (let i = 0; i <= words.length - size; i += 1) {
      const phrase = words.slice(i, i + size).join(" ");
      if (isDistinctiveCandidate(phrase)) out.push(phrase);
    }
  }
  for (const word of words) {
    if (isDistinctiveCandidate(word)) out.push(word);
  }

  // Short full values only (company names, compact labels) — never whole sentences.
  if (opts?.allowFullValue && words.length <= 5 && isDistinctiveCandidate(normalized)) {
    out.unshift(normalized);
  }

  return out;
}

function rankAndDedupe(candidates: string[], limit: number): string[] {
  const seen = new Set<string>();
  const scored = candidates
    .map((c, index) => {
      const n = normalizeAnchorText(c);
      const words = n.split(" ").filter(Boolean);
      const contentWords = words.filter((w) => !STOPWORDS.has(w) && !GENERIC_TERMS.has(w));
      // Prefer compact 2–3 word distinctive phrases; keep strong single tokens too.
      const score =
        contentWords.length * 14 +
        (words.length === 2 ? 10 : words.length === 3 ? 8 : words.length === 1 ? 4 : 0) +
        Math.min(n.length, 28) -
        (words.length > 3 ? 20 : 0) -
        index * 0.01;
      return { n, score };
    })
    .sort((a, b) => b.score - a.score);

  const result: string[] = [];
  for (const item of scored) {
    if (seen.has(item.n)) continue;
    seen.add(item.n);
    result.push(item.n);
    if (result.length >= limit) break;
  }
  return result;
}

export function pushBucket(
  target: CompanyAnchors,
  bucket: AnchorBucket,
  value: string,
  opts?: { allowFullValue?: boolean },
) {
  const ranked = rankAndDedupe(extractCandidates(value, opts), 10);
  for (const item of ranked) {
    if (!target[bucket].includes(item)) target[bucket].push(item);
  }
  target[bucket] = rankAndDedupe(target[bucket], 10);
}
