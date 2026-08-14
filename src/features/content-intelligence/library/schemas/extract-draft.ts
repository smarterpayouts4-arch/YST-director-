import { z } from "zod";
import {
  ConfidenceSchema,
  IntelligenceKindSchema,
} from "@/features/content-intelligence/library/schemas/enums";

/** Structured model output before deterministic curation. */
export const EXTRACT_DRAFT_ITEMS_MAX = 80;

export const ContentIntelligenceExtractSchema = z.object({
  items: z
    .array(
      z.object({
        kind: IntelligenceKindSchema,
        statement: z.string().min(1).max(2000),
        provenance: z.string().min(1).max(800),
        confidence: ConfidenceSchema,
        evidenceQuote: z.string().max(2000).nullable(),
        sourceRefs: z.array(z.string().max(200)).max(12),
        tags: z.array(z.string().max(64)).max(12),
        isHypothesis: z.boolean(),
      }),
    )
    .max(EXTRACT_DRAFT_ITEMS_MAX),
});

export type ContentIntelligenceExtract = z.infer<
  typeof ContentIntelligenceExtractSchema
>;
