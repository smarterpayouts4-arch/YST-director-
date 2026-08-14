import {
  CI_STORAGE_KEY,
  CURRENT_CI_STORAGE_VERSION,
} from "@/features/content-intelligence/library/config/constants";
import {
  ContentIntelligenceLibrarySchema,
  type ContentIntelligenceLibrary,
} from "@/features/content-intelligence/library/schemas/library";

type CiEnvelope = {
  storageVersion: number;
  savedAt: string;
  library: ContentIntelligenceLibrary;
};

export function createEmptyLibrary(input?: {
  libraryId?: string;
  projectId?: string;
}): ContentIntelligenceLibrary {
  return {
    // UUID so consecutive handoffs never collide on the same millisecond.
    libraryId: input?.libraryId ?? `lib_${globalThis.crypto.randomUUID()}`,
    stage: "idle",
    projectId: input?.projectId,
    artifacts: [],
    extractionRuns: [],
    items: [],
    publishedAt: null,
    publishedDto: null,
  };
}

export function loadLibrary(): ContentIntelligenceLibrary | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CI_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CiEnvelope;
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof parsed.storageVersion !== "number" ||
      parsed.storageVersion > CURRENT_CI_STORAGE_VERSION
    ) {
      return null;
    }
    return ContentIntelligenceLibrarySchema.parse(parsed.library);
  } catch {
    return null;
  }
}

export function saveLibrary(library: ContentIntelligenceLibrary): void {
  if (typeof window === "undefined") return;
  const envelope: CiEnvelope = {
    storageVersion: CURRENT_CI_STORAGE_VERSION,
    savedAt: new Date().toISOString(),
    library: ContentIntelligenceLibrarySchema.parse(library),
  };
  window.localStorage.setItem(CI_STORAGE_KEY, JSON.stringify(envelope));
}
