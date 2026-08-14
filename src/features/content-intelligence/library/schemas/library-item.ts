import { z } from "zod";
import {
  ConfidenceSchema,
  IntelligenceKindSchema,
  ItemOriginSchema,
  ReviewStatusSchema,
} from "@/features/content-intelligence/library/schemas/enums";

export const LibraryItemSchema = z.object({
  itemId: z.string().min(1).max(80),
  artifactId: z.string().min(1).max(80),
  extractionRunId: z.string().min(1).max(80).nullable(),
  kind: IntelligenceKindSchema,
  statement: z.string().min(1).max(2000),
  provenance: z.string().min(1).max(800),
  origin: ItemOriginSchema,
  reviewStatus: ReviewStatusSchema,
  confidence: ConfidenceSchema,
  evidenceQuote: z.string().max(2000).nullable(),
  /** True when a model quote was stripped because it was not a verbatim span in raw research. */
  quoteCleared: z.boolean().default(false),
  sourceRefs: z.array(z.string().max(200)).max(12),
  tags: z.array(z.string().max(64)).max(12),
  isHypothesis: z.boolean(),
  capturedAt: z.string().datetime(),
});

export type LibraryItem = z.infer<typeof LibraryItemSchema>;
