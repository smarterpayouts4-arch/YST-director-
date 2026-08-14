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

/**
 * Envelope shell only. Session values stay unknown so one corrupt portfolio
 * cannot fail the whole key. Parse each id with YouTubeShortsSessionSchema.
 */
export const YouTubeShortsEnvelopeSchema = z
  .object({
    storageVersion: z.number().int().positive(),
    savedAt: z.string().min(1),
    sessionsByTopicPacketId: z.record(z.string(), z.unknown()),
  })
  .refine((envelope) => envelope.storageVersion <= CURRENT_SHORTS_STORAGE_VERSION, {
    message: "storageVersion newer than supported",
    path: ["storageVersion"],
  });

export type YouTubeShortsEnvelope = z.infer<typeof YouTubeShortsEnvelopeSchema>;
