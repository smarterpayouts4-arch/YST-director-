import { z } from "zod";
import { MAX_RESEARCH_INPUT_CHARS } from "@/features/content-intelligence/library/config/research-input-limits";

/** Research text budget at the extract API / service request boundary. */
export const ExtractResearchTextSchema = z
  .string()
  .min(1)
  .max(MAX_RESEARCH_INPUT_CHARS);

export const ExtractRequestSchema = z.object({
  researchText: ExtractResearchTextSchema,
  artifactId: z.string().min(1).max(80),
  projectId: z.string().min(1).max(80).optional(),
});
