import type { TopicPacket } from "@/features/content-intelligence/contracts/topic-packet";
import type { YouTubeShortsSession } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-session";
import { loadShortsSession } from "@/features/social-media/youtube-shorts/state/shorts-storage";

export function ingestTopicPacket(input: {
  packet: TopicPacket;
  projectId: string;
  artifactId: string;
  existingSession?: YouTubeShortsSession | null;
}): YouTubeShortsSession {
  if (input.existingSession) {
    return input.existingSession;
  }

  const existing = loadShortsSession(input.packet.topicPacketId);
  if (existing.ok) {
    return existing.session;
  }

  const now = new Date().toISOString();
  const ingestedAtom = JSON.parse(JSON.stringify(input.packet)) as TopicPacket;

  return {
    topicPacketId: input.packet.topicPacketId,
    projectId: input.projectId,
    artifactId: input.artifactId,
    ingestedAtom,
    stage: "ready_for_storyboard",
    createdAt: now,
    updatedAt: now,
  };
}
