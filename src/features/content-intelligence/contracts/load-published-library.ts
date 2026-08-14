import {
  PublishedLibraryDtoSchema,
  type PublishedLibraryDto,
} from "@/features/content-intelligence/contracts/published-library";
import { CI_STORAGE_KEY } from "@/features/content-intelligence/library/config/constants";

export type LoadedPublishedLibrary = {
  dto: PublishedLibraryDto;
  /** ISO datetime from publish — for “Based on” UI */
  basedOnLabel: string;
};

/**
 * Firewall-safe reader for Topic Engine.
 * Returns only PublishedLibraryDto — never artifacts/rawText/private items.
 */
export function loadPublishedLibraryForArtifact(
  artifactId: string,
): LoadedPublishedLibrary | null {
  if (typeof window === "undefined") return null;
  if (!artifactId.trim()) return null;

  try {
    const raw = window.localStorage.getItem(CI_STORAGE_KEY);
    if (!raw) return null;
    const envelope = JSON.parse(raw) as {
      library?: { publishedDto?: unknown };
    };
    const parsed = PublishedLibraryDtoSchema.safeParse(envelope?.library?.publishedDto);
    if (!parsed.success) return null;

    const dto = parsed.data;
    if (dto.items.length < 1) return null;

    const mismatched = dto.items.some((item) => item.artifactId !== artifactId);
    if (mismatched) return null;

    return {
      dto,
      basedOnLabel: formatBasedOn(dto.publishedAt),
    };
  } catch {
    return null;
  }
}

function formatBasedOn(publishedAt: string): string {
  try {
    const d = new Date(publishedAt);
    if (Number.isNaN(d.getTime())) return `research published ${publishedAt}`;
    return `research intelligence published ${d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })}`;
  } catch {
    return "approved research intelligence";
  }
}
