import { z } from "zod";
import { TopicPacketSchema } from "@/features/content-intelligence/contracts/topic-packet";
import { CURRENT_SHORTS_STORAGE_VERSION } from "@/features/social-media/youtube-shorts/config/constants";
import { YouTubeShortsProductionSchema } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-production";
import { YouTubeShortsStoryboardSchema } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-storyboard";

export const YouTubeShortsStageSchema = z.enum([
  "ready_for_storyboard",
  "storyboard_draft",
  "storyboard_approved",
]);

export const YouTubeShortsSessionSchema = z.object({
  topicPacketId: z.string().min(1),
  projectId: z.string().min(1),
  artifactId: z.string().min(1),
  ingestedAtom: TopicPacketSchema,
  stage: YouTubeShortsStageSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  promptVersion: z.string().min(1).max(80).optional(),
  generatedStoryboard: YouTubeShortsStoryboardSchema.nullable().optional(),
  workingStoryboard: YouTubeShortsStoryboardSchema.nullable().optional(),
  approvedStoryboard: YouTubeShortsStoryboardSchema.nullable().optional(),
  /** P1C — immutable model expansion result. */
  generatedProduction: YouTubeShortsProductionSchema.nullable().optional(),
  /** P1C — owner-editable production specification. */
  workingProduction: YouTubeShortsProductionSchema.nullable().optional(),
  productionPromptVersion: z.string().min(1).max(80).optional(),
  productionGeneratedAt: z.string().datetime().optional(),
});

export type YouTubeShortsStage = z.infer<typeof YouTubeShortsStageSchema>;
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
