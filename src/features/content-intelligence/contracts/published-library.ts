import { z } from "zod";
import {
  ConfidenceSchema,
  IntelligenceKindSchema,
  ItemOriginSchema,
} from "@/features/content-intelligence/library/schemas/enums";

/**
 * Public handoff DTO for Topic Engine (later).
 * Accepted items only; never includes raw artifact body.
 */
export const PublishedLibraryItemSchema = z.object({
  itemId: z.string().min(1).max(80),
  artifactId: z.string().min(1).max(80),
  kind: IntelligenceKindSchema,
  statement: z.string().min(1).max(2000),
  provenance: z.string().min(1).max(800),
  origin: ItemOriginSchema,
  confidence: ConfidenceSchema,
  evidenceQuote: z.string().max(2000).nullable(),
  sourceRefs: z.array(z.string().max(200)).max(12),
  tags: z.array(z.string().max(64)).max(12),
  isHypothesis: z.boolean(),
});

export const PublishedLibraryDtoSchema = z.object({
  libraryId: z.string().min(1).max(80),
  projectId: z.string().min(1).max(80).optional(),
  publishedAt: z.string().datetime(),
  items: z.array(PublishedLibraryItemSchema).max(500),
});

export type PublishedLibraryDto = z.infer<typeof PublishedLibraryDtoSchema>;
export type PublishedLibraryItem = z.infer<typeof PublishedLibraryItemSchema>;
