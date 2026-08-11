import {
  escapeRegex,
  normalizeAnchorText,
} from "@/features/research-prompt-builder/lib/company-anchors/extract";
import {
  ANCHOR_BUCKETS,
  type CompanyAnchors,
} from "@/features/research-prompt-builder/lib/company-anchors/types";

/** Flatten all distinctive phrases for mutation helpers / debugging. */
export function flattenAnchors(anchors: CompanyAnchors): string[] {
  const all: string[] = [];
  for (const bucket of ANCHOR_BUCKETS) {
    for (const token of anchors[bucket]) {
      if (!all.includes(token)) all.push(token);
    }
  }
  return all.sort((a, b) => b.length - a.length);
}

/**
 * Replace every distinctive anchor phrase/token with neutral filler.
 * Used by the anchor-mutation proof test.
 */
export function stripAnchors(markdown: string, anchors: CompanyAnchors): string {
  let out = markdown;
  for (const phrase of flattenAnchors(anchors)) {
    const parts = normalizeAnchorText(phrase).split(" ").filter(Boolean);
    if (parts.length === 0) continue;
    const pattern =
      parts.length === 1
        ? new RegExp(`\\b${escapeRegex(parts[0]!)}\\b`, "giu")
        : new RegExp(parts.map(escapeRegex).join("\\s+"), "giu");
    out = out.replace(pattern, parts.length > 1 ? "the market" : "topic");
  }
  return out;
}
