import { z } from "zod";

export const ExtractionValidationResultSchema = z.object({
  ok: z.boolean(),
  issues: z.array(z.string().max(500)).max(40),
  itemCount: z.number().int().min(0).max(500),
  quoteMismatchCount: z.number().int().min(0).max(500),
});

export const ExtractionRunSchema = z.object({
  runId: z.string().min(1).max(80),
  artifactId: z.string().min(1).max(80),
  operationId: z.literal("extract-content-intelligence"),
  model: z.string().min(1).max(120),
  promptVersion: z.string().min(1).max(80),
  extractedAt: z.string().datetime(),
  validationResult: ExtractionValidationResultSchema,
});

export type ExtractionRun = z.infer<typeof ExtractionRunSchema>;
export type ExtractionValidationResult = z.infer<
  typeof ExtractionValidationResultSchema
>;
