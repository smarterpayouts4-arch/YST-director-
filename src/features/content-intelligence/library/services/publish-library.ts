import type { ContentIntelligenceLibrary } from "@/features/content-intelligence/library/schemas/library";
import type { PublishedLibraryDto } from "@/features/content-intelligence/contracts/published-library";

export function buildPublishedLibraryDto(
  library: ContentIntelligenceLibrary,
  publishedAt = new Date().toISOString(),
): PublishedLibraryDto {
  const accepted = library.items.filter((item) => item.reviewStatus === "accepted");
  if (accepted.length < 1) {
    throw new Error("Publish requires at least one accepted intelligence item.");
  }

  return {
    libraryId: library.libraryId,
    projectId: library.projectId,
    publishedAt,
    items: accepted.map((item) => ({
      itemId: item.itemId,
      artifactId: item.artifactId,
      kind: item.kind,
      statement: item.statement,
      provenance: item.provenance,
      origin: item.origin,
      confidence: item.confidence,
      evidenceQuote: item.evidenceQuote,
      sourceRefs: item.sourceRefs,
      tags: item.tags,
      isHypothesis: item.isHypothesis,
    })),
  };
}
