import { randomUUID } from "node:crypto";
import type { ContentIntelligenceExtract } from "@/features/content-intelligence/library/schemas/extract-draft";
import type { ExtractionValidationResult } from "@/features/content-intelligence/library/schemas/extraction-run";
import type { LibraryItem } from "@/features/content-intelligence/library/schemas/library-item";
import { quoteIsInRaw } from "@/features/content-intelligence/library/validation/quote-in-raw";

export function curateLibraryItems(input: {
  draft: ContentIntelligenceExtract;
  artifactId: string;
  extractionRunId: string;
  rawText: string;
  capturedAt?: string;
}): { items: LibraryItem[]; validationResult: ExtractionValidationResult } {
  const capturedAt = input.capturedAt ?? new Date().toISOString();
  const issues: string[] = [];
  let quoteMismatchCount = 0;
  const items: LibraryItem[] = [];

  for (const [index, draft] of input.draft.items.entries()) {
    const statement = draft.statement.trim();
    if (!statement) {
      issues.push(`Item ${index + 1}: empty statement dropped`);
      continue;
    }

    let evidenceQuote = draft.evidenceQuote?.trim() || null;
    if (evidenceQuote && !quoteIsInRaw(evidenceQuote, input.rawText)) {
      quoteMismatchCount += 1;
      issues.push(
        `Item ${index + 1}: evidenceQuote not found in raw research; kept as needs_review without quote`,
      );
      evidenceQuote = null;
    }

    items.push({
      itemId: `item_${randomUUID()}`,
      artifactId: input.artifactId,
      extractionRunId: input.extractionRunId,
      kind: draft.kind,
      statement,
      provenance: draft.provenance.trim() || "unspecified section",
      origin: "extracted",
      reviewStatus: "needs_review",
      confidence: draft.confidence,
      evidenceQuote,
      sourceRefs: draft.sourceRefs.slice(0, 12),
      tags: draft.tags.slice(0, 12),
      isHypothesis: draft.isHypothesis,
      capturedAt,
    });
  }

  return {
    items,
    validationResult: {
      ok: issues.length === 0,
      issues: issues.slice(0, 40),
      itemCount: items.length,
      quoteMismatchCount,
    },
  };
}
