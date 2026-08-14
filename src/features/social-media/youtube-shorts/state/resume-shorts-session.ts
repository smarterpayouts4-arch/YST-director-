import type { TopicPacket } from "@/features/content-intelligence/contracts/topic-packet";
import { loadTopicSession } from "@/features/content-intelligence/topics/state/topic-storage";
import {
  loadShortsSession,
  type LoadShortsSessionResult,
} from "@/features/social-media/youtube-shorts/state/shorts-storage";

/** Shorts storage first — never scan TE for “latest”. */
export function loadShortsSessionForPage(
  topicPacketId: string,
): LoadShortsSessionResult {
  return loadShortsSession(topicPacketId);
}

/**
 * TE one-time seed helper: packet only when topicPacketId matches expected.
 * Mismatch / missing / wiped TE → null (empty-state path).
 */
export function loadTeSeedPacket(input: {
  expectedTopicPacketId: string;
  artifactId: string;
}): TopicPacket | null {
  const te = loadTopicSession(input.artifactId);
  if (!te?.packet) return null;
  if (te.packet.topicPacketId !== input.expectedTopicPacketId) return null;
  return te.packet;
}
