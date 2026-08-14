import { z } from "zod";
import { MAX_RESEARCH_INPUT_CHARS } from "@/features/content-intelligence/library/config/research-input-limits";

/** Immutable raw research source. Never attach extract-run metadata here. */
export const ResearchArtifactSchema = z.object({
  artifactId: z.string().min(1).max(80),
  rawText: z.string().min(1).max(MAX_RESEARCH_INPUT_CHARS),
  contentHash: z.string().min(8).max(128),
  capturedAt: z.string().datetime(),
  projectId: z.string().min(1).max(80).optional(),
});

export type ResearchArtifact = z.infer<typeof ResearchArtifactSchema>;
