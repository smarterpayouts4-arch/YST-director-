import {
  CI_HANDOFF_SESSION_KEY,
  MAX_RESEARCH_PASTE_CHARS,
} from "@/features/content-intelligence/library/config/constants";
import type { ResearchArtifact } from "@/features/content-intelligence/library/schemas/artifact";
import { hashText } from "@/features/content-intelligence/library/state/hash-text";
import {
  createEmptyLibrary,
  loadLibrary,
  saveLibrary,
} from "@/features/content-intelligence/library/state/library-storage";

export type ResearchHandoffPayload = {
  artifactId: string;
  projectId?: string;
  researchText: string;
  contentHash: string;
  capturedAt: string;
};

/**
 * CI-owned handoff entrypoint for RPB Step 5.
 * Creates an immutable ResearchArtifact in content-intelligence:v1.
 * Never writes to ResearchPromptProject / RPB storage.
 */
export async function acceptResearchHandoff(input: {
  researchText: string;
  projectId?: string;
}): Promise<{ artifactId: string; projectId?: string }> {
  const researchText = input.researchText.trim();
  if (!researchText) {
    throw new Error("Paste the completed research before sending.");
  }
  if (researchText.length > MAX_RESEARCH_PASTE_CHARS) {
    throw new Error(
      `Completed research exceeds ${MAX_RESEARCH_PASTE_CHARS.toLocaleString()} characters.`,
    );
  }

  const capturedAt = new Date().toISOString();
  const contentHash = await hashText(researchText);
  const artifactId = `art_${crypto.randomUUID()}`;
  const artifact: ResearchArtifact = {
    artifactId,
    rawText: researchText,
    contentHash,
    capturedAt,
    projectId: input.projectId,
  };

  const existing = loadLibrary();
  const library = existing ?? createEmptyLibrary({ projectId: input.projectId });
  library.projectId = input.projectId ?? library.projectId;
  library.artifacts = [...library.artifacts.filter((a) => a.artifactId !== artifactId), artifact];
  library.stage = "pending_extract";
  library.publishedAt = null;
  library.publishedDto = null;
  saveLibrary(library);

  const payload: ResearchHandoffPayload = {
    artifactId,
    projectId: input.projectId,
    researchText,
    contentHash,
    capturedAt,
  };
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(CI_HANDOFF_SESSION_KEY, JSON.stringify(payload));
  }

  return { artifactId, projectId: input.projectId };
}

export function peekHandoff(): ResearchHandoffPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(CI_HANDOFF_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ResearchHandoffPayload;
  } catch {
    return null;
  }
}

export function clearHandoff(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(CI_HANDOFF_SESSION_KEY);
}
