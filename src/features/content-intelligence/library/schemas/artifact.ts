import { z } from "zod";

/** Immutable raw research source. Never attach extract-run metadata here. */
export const ResearchArtifactSchema = z.object({
  artifactId: z.string().min(1).max(80),
  rawText: z.string().min(1).max(200_000),
  contentHash: z.string().min(8).max(128),
  capturedAt: z.string().datetime(),
  projectId: z.string().min(1).max(80).optional(),
});

export type ResearchArtifact = z.infer<typeof ResearchArtifactSchema>;
