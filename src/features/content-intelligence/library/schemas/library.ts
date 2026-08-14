import { z } from "zod";
import { ResearchArtifactSchema } from "@/features/content-intelligence/library/schemas/artifact";
import { ExtractionRunSchema } from "@/features/content-intelligence/library/schemas/extraction-run";
import { LibraryItemSchema } from "@/features/content-intelligence/library/schemas/library-item";
import { PublishedLibraryDtoSchema } from "@/features/content-intelligence/contracts/published-library";

export const LibrarianStageSchema = z.enum([
  "idle",
  "pending_extract",
  "in_review",
  "published",
]);

/** Persisted library ceiling — not the extract draft cap (≤80). */
export const LIBRARY_ITEMS_MAX = 500;

export const ContentIntelligenceLibrarySchema = z.object({
  libraryId: z.string().min(1).max(80),
  stage: LibrarianStageSchema,
  projectId: z.string().min(1).max(80).optional(),
  artifacts: z.array(ResearchArtifactSchema).max(20),
  extractionRuns: z.array(ExtractionRunSchema).max(40),
  items: z.array(LibraryItemSchema).max(LIBRARY_ITEMS_MAX),
  publishedAt: z.string().datetime().nullable(),
  publishedDto: PublishedLibraryDtoSchema.nullable(),
});

export type LibrarianStage = z.infer<typeof LibrarianStageSchema>;
export type ContentIntelligenceLibrary = z.infer<
  typeof ContentIntelligenceLibrarySchema
>;
