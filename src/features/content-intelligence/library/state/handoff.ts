import { CI_HANDOFF_SESSION_KEY } from "@/features/content-intelligence/library/config/constants";
import { MAX_RESEARCH_INPUT_CHARS } from "@/features/content-intelligence/library/config/research-input-limits";
import type { ResearchArtifact } from "@/features/content-intelligence/library/schemas/artifact";
import { hashText } from "@/features/content-intelligence/library/state/hash-text";
import {
  createEmptyLibrary,
  saveLibrary,
} from "@/features/content-intelligence/library/state/library-storage";
import { clearTopicSession } from "@/features/content-intelligence/topics/state/topic-storage";

export type ResearchHandoffPayload = {
  artifactId: string;
  projectId?: string;
  researchText: string;
  contentHash: string;
  capturedAt: string;
};

/**
 * CI-owned handoff entrypoint for RPB Step 5.
 * Every Send creates a fresh Library (new libraryId) with one immutable ResearchArtifact.
 * Prior active library stops being active — no item accumulation across research pastes.
 * Never writes to ResearchPromptProject / RPB storage.
 */
export async function acceptResearchHandoff(input: {
  researchText: string;
  projectId?: string;
}): Promise<{ artifactId: string; projectId?: string; libraryId: string }> {
  const researchText = input.researchText.trim();
  if (!researchText) {
    throw new Error("Paste the completed research before sending.");
  }
  if (researchText.length > MAX_RESEARCH_INPUT_CHARS) {
    throw new Error(
      `Completed research exceeds ${MAX_RESEARCH_INPUT_CHARS.toLocaleString()} characters. Shorten it before sending — Content Intelligence will not silently truncate.`,
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

  const library = createEmptyLibrary({ projectId: input.projectId });
  library.artifacts = [artifact];
  library.stage = "pending_extract";
  library.publishedAt = null;
  library.publishedDto = null;
  saveLibrary(library);
  clearTopicSession();

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

  return { artifactId, projectId: input.projectId, libraryId: library.libraryId };
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
