import { z } from "zod";
import { TopicPacketSchema } from "@/features/content-intelligence/contracts/topic-packet";
import { CURRENT_SHORTS_STORAGE_VERSION } from "@/features/social-media/youtube-shorts/config/constants";

export const YouTubeShortsSessionSchema = z.object({
  topicPacketId: z.string().min(1),
  projectId: z.string().min(1),
  artifactId: z.string().min(1),
  ingestedAtom: TopicPacketSchema,
  stage: z.literal("ready_for_storyboard"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type YouTubeShortsSession = z.infer<typeof YouTubeShortsSessionSchema>;

export const YouTubeShortsEnvelopeSchema = z.object({
  storageVersion: z.literal(CURRENT_SHORTS_STORAGE_VERSION),
  savedAt: z.string(),
  sessionsByTopicPacketId: z.record(z.string(), YouTubeShortsSessionSchema),
});

export type YouTubeShortsEnvelope = z.infer<typeof YouTubeShortsEnvelopeSchema>;
