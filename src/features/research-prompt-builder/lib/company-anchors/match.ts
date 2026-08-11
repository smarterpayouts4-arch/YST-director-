import {
  escapeRegex,
  normalizeAnchorText,
} from "@/features/research-prompt-builder/lib/company-anchors/extract";

/** Boundary-aware match: word boundaries for tokens, ordered phrase for multi-word. */
export function anchorPhraseMatches(haystack: string, phrase: string): boolean {
  const h = normalizeAnchorText(haystack);
  const p = normalizeAnchorText(phrase);
  if (!p || !h) return false;
  if (p.includes(" ")) {
    return h.includes(p);
  }
  const re = new RegExp(`(?:^|\\s)${escapeRegex(p)}(?:\\s|$)`, "u");
  return re.test(h);
}
