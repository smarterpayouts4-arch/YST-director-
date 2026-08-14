import { TOPICS_RUNTIME_PROMPT_VERSION } from "@/features/content-intelligence/topics/prompts/prompt-version";
import type { TopicEngineSession } from "@/features/content-intelligence/topics/schemas/topic-session";

/**
 * Whether a saved Topic Engine session should be restored without re-running AI.
 * Primary freeze: Ready + TopicPacket. Fallbacks: topics or directions already paid for.
 * Same libraryId required; promptVersion mismatch alone must not wipe usable work.
 */
export function isResumableTopicSession(
  existing: TopicEngineSession | null,
  libraryId: string,
): existing is TopicEngineSession {
  if (!existing) return false;
  if (existing.libraryId !== libraryId) return false;
  if (existing.stage === "ready" && existing.packet) return true;
  if (existing.topics.length > 0) return true;
  if (existing.directions.length > 0) return true;
  return false;
}

export function topicSessionPromptVersionDiffers(
  session: TopicEngineSession,
): boolean {
  return session.promptVersion !== TOPICS_RUNTIME_PROMPT_VERSION;
}
