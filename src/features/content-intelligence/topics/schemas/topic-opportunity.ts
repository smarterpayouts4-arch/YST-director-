import { z } from "zod";
import { ConfidenceSchema } from "@/features/content-intelligence/library/schemas/enums";

export const TopicOpportunitiesDraftSchema = z.object({
  topics: z
    .array(
      z.object({
        title: z.string().min(1).max(160),
        premise: z.string().min(1).max(400),
        audience: z.string().min(1).max(400),
        customerMoment: z.string().min(1).max(400),
        primaryTension: z.string().min(1).max(400),
        opportunity: z.string().min(1).max(400),
        whyItMatters: z.string().min(1).max(400),
        desiredTakeaway: z.string().min(1).max(400),
        priority: z.number().int().min(1).max(6),
        confidence: ConfidenceSchema,
        supportingItemIds: z.array(z.string().min(1).max(80)).min(2).max(24),
        hypothesisDependencies: z.array(z.string().max(400)).max(8),
        unresolvedAssumptions: z.array(z.string().max(400)).max(8),
        restrictionItemIds: z.array(z.string().min(1).max(80)).max(24),
        limitationItemIds: z.array(z.string().min(1).max(80)).max(24),
      }),
    )
    .length(6),
});

export type TopicOpportunitiesDraft = z.infer<typeof TopicOpportunitiesDraftSchema>;

export const TopicOpportunitySchema = z.object({
  topicId: z.string().min(1).max(80),
  territoryId: z.string().min(1).max(80),
  title: z.string().min(1).max(160),
  premise: z.string().min(1).max(400),
  audience: z.string().min(1).max(400),
  customerMoment: z.string().min(1).max(400),
  primaryTension: z.string().min(1).max(400),
  opportunity: z.string().min(1).max(400),
  whyItMatters: z.string().min(1).max(400),
  desiredTakeaway: z.string().min(1).max(400),
  priority: z.number().int().min(1).max(6),
  confidence: ConfidenceSchema,
  supportingItemIds: z.array(z.string().min(1).max(80)).min(2).max(24),
  hypothesisDependencies: z.array(z.string().max(400)).max(8),
  unresolvedAssumptions: z.array(z.string().max(400)).max(8),
  restrictionItemIds: z.array(z.string().min(1).max(80)).max(24),
  limitationItemIds: z.array(z.string().min(1).max(80)).max(24),
});

export type TopicOpportunity = z.infer<typeof TopicOpportunitySchema>;
