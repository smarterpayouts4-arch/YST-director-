import { z } from "zod";
import { TopicPacketSchema } from "@/features/content-intelligence/contracts/topic-packet";
import { TopicDirectionSchema } from "@/features/content-intelligence/topics/schemas/direction";
import { TopicOpportunitySchema } from "@/features/content-intelligence/topics/schemas/topic-opportunity";

export const TopicEngineStageSchema = z.enum([
  "directions",
  "topics",
  "ready",
]);

export const TopicEngineSessionSchema = z.object({
  libraryId: z.string().min(1).max(80),
  projectId: z.string().min(1).max(80).optional(),
  artifactId: z.string().min(1).max(80),
  basedOnLabel: z.string().min(1).max(200),
  /** Active Topic Engine prompt version that produced this session's generated state. */
  promptVersion: z.string().min(1).max(80),
  /** Last propose-directions diagnostic counts (no raw model output). */
  lastDirectionsDiagnostics: z
    .object({
      draftCount: z.number().int().min(0).max(3),
      keptCount: z.number().int().min(0).max(3),
      droppedCount: z.number().int().min(0).max(3),
      droppedReasons: z.array(z.string().min(1).max(400)).max(6).optional(),
      model: z.string().min(1).max(80).optional(),
    })
    .optional(),
  stage: TopicEngineStageSchema,
  directions: z.array(TopicDirectionSchema).max(3),
  selectedTerritoryId: z.string().min(1).max(80).nullable(),
  topics: z.array(TopicOpportunitySchema).max(6),
  selectedTopicId: z.string().min(1).max(80).nullable(),
  packet: TopicPacketSchema.nullable(),
});

export type TopicEngineSession = z.infer<typeof TopicEngineSessionSchema>;
export type TopicEngineStage = z.infer<typeof TopicEngineStageSchema>;
