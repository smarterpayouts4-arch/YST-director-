/**
 * Thin public orchestra for company anchors.
 * Consumers import from this path; implementation lives under ./company-anchors/*.
 */
export {
  ANCHOR_BUCKETS,
  emptyCompanyAnchors,
  type AnchorBucket,
  type CompanyAnchors,
} from "@/features/research-prompt-builder/lib/company-anchors/types";
export { normalizeAnchorText } from "@/features/research-prompt-builder/lib/company-anchors/extract";
export { anchorPhraseMatches } from "@/features/research-prompt-builder/lib/company-anchors/match";
export { buildCompanyAnchors } from "@/features/research-prompt-builder/lib/company-anchors/build";
export {
  flattenAnchors,
  stripAnchors,
} from "@/features/research-prompt-builder/lib/company-anchors/mutate";
export {
  formatAnchorHintClause,
  selectAnchorHints,
  type AnchorHintBucket,
  type AnchorHintPolicy,
} from "@/features/research-prompt-builder/lib/company-anchors/hints";
