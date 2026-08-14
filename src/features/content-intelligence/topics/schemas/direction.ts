import { z } from "zod";
import { ConfidenceSchema } from "@/features/content-intelligence/library/schemas/enums";

/** Model draft for strategic directions (content lanes). */
export const TopicDirectionsDraftSchema = z.object({
  directions: z
    .array(
      z.object({
        name: z.string().min(1).max(120),
        description: z.string().min(1).max(400),
        decisionQuestion: z.string().min(1).max(240),
        primaryAudience: z.string().min(1).max(400),
        primaryMoment: z.string().min(1).max(400),
        primaryTension: z.string().min(1).max(400),
        primaryOpportunity: z.string().min(1).max(400),
        supportingItemIds: z.array(z.string().min(1).max(80)).min(2).max(24),
        confidence: ConfidenceSchema,
        priority: z.number().int().min(1).max(3),
        rationale: z.string().min(1).max(500),
        hypothesisDependent: z.boolean(),
        unresolvedDependent: z.boolean(),
      }),
    )
    .min(1)
    .max(3),
});

export type TopicDirectionsDraft = z.infer<typeof TopicDirectionsDraftSchema>;

export const TopicDirectionSchema = z.object({
  territoryId: z.string().min(1).max(80),
  name: z.string().min(1).max(120),
  description: z.string().min(1).max(400),
  decisionQuestion: z.string().min(1).max(240),
  primaryAudience: z.string().min(1).max(400),
  primaryMoment: z.string().min(1).max(400),
  primaryTension: z.string().min(1).max(400),
  primaryOpportunity: z.string().min(1).max(400),
  supportingItemIds: z.array(z.string().min(1).max(80)).min(2).max(24),
  confidence: ConfidenceSchema,
  priority: z.number().int().min(1).max(3),
  rationale: z.string().min(1).max(500),
  hypothesisDependent: z.boolean(),
  unresolvedDependent: z.boolean(),
});

export type TopicDirection = z.infer<typeof TopicDirectionSchema>;
