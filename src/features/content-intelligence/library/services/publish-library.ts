import type { ContentIntelligenceLibrary } from "@/features/content-intelligence/library/schemas/library";
import type { PublishedLibraryDto } from "@/features/content-intelligence/contracts/published-library";

export function buildPublishedLibraryDto(
  library: ContentIntelligenceLibrary,
  publishedAt = new Date().toISOString(),
  artifactId?: string,
): PublishedLibraryDto {
  const accepted = library.items.filter(
    (item) =>
      item.reviewStatus === "accepted" &&
      (!artifactId || item.artifactId === artifactId),
  );
  if (accepted.length < 1) {
    throw new Error("At least one accepted intelligence item is required.");
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

/** Count items still needing owner attention (not rejected). */
export function countNeedsAttention(
  items: ContentIntelligenceLibrary["items"],
  artifactId?: string,
): number {
  return items.filter(
    (item) =>
      (!artifactId || item.artifactId === artifactId) &&
      item.reviewStatus === "needs_review",
  ).length;
}

/**
 * When no needs_review items remain and ≥1 accepted exists, auto-build PublishedLibraryDto.
 * Clears published state if exceptions reappear.
 */
export function syncLibraryReadyState(
  library: ContentIntelligenceLibrary,
  artifactId?: string,
): ContentIntelligenceLibrary {
  const scoped = artifactId
    ? library.items.filter((i) => i.artifactId === artifactId)
    : library.items;
  const needsAttention = countNeedsAttention(library.items, artifactId);
  const accepted = scoped.filter((i) => i.reviewStatus === "accepted").length;

  if (needsAttention === 0 && accepted >= 1) {
    const publishedAt = new Date().toISOString();
    const publishedDto = buildPublishedLibraryDto(library, publishedAt, artifactId);
    return {
      ...library,
      stage: "published",
      publishedAt,
      publishedDto,
    };
  }

  if (library.stage === "published" || library.publishedDto) {
    return {
      ...library,
      stage: library.stage === "pending_extract" ? library.stage : "in_review",
      publishedAt: null,
      publishedDto: null,
    };
  }

  return library;
}
