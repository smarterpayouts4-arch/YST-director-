import "server-only";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { truncateString } from "@/ai/context/budgets";
import { redactDeep } from "@/ai/context/redact";
import { parseStructuredOutput } from "@/ai/structured-output/parse-structured-output";
import { getOpenAIModel } from "@/lib/openai";
import { EXTRACT_RESEARCH_CHARS, MAX_RESEARCH_PASTE_CHARS } from "@/features/content-intelligence/library/config/constants";
import { ContentIntelligenceExtractSchema } from "@/features/content-intelligence/library/schemas/extract-draft";
import type { ExtractionRun } from "@/features/content-intelligence/library/schemas/extraction-run";
import type { LibraryItem } from "@/features/content-intelligence/library/schemas/library-item";
import { buildExtractContentIntelligencePrompt } from "@/features/content-intelligence/library/prompts/extract-content-intelligence";
import { LIBRARY_RUNTIME_PROMPT_VERSION } from "@/features/content-intelligence/library/prompts/prompt-version";
import { buildLibrarianRepairPrompt } from "@/features/content-intelligence/library/prompts/repair-output";
import { curateLibraryItems } from "@/features/content-intelligence/library/services/curate-library";

const ExtractRequestSchema = z.object({
  researchText: z.string().min(1).max(MAX_RESEARCH_PASTE_CHARS),
  artifactId: z.string().min(1).max(80),
  projectId: z.string().min(1).max(80).optional(),
});

export async function extractContentIntelligence(input: {
  researchText: string;
  artifactId: string;
  projectId?: string;
}): Promise<{
  extractionRun: ExtractionRun;
  items: LibraryItem[];
}> {
  const parsed = ExtractRequestSchema.parse(input);
  if (parsed.researchText.length > MAX_RESEARCH_PASTE_CHARS) {
    throw Object.assign(new Error("Completed research text is too large."), {
      code: "FILE_TOO_LARGE" as const,
    });
  }

  const truncated = truncateString(parsed.researchText, EXTRACT_RESEARCH_CHARS);
  const redacted = redactDeep({ researchText: truncated.value });
  const prompt = buildExtractContentIntelligencePrompt({
    researchText: redacted.value.researchText,
  });

  const draft = await parseStructuredOutput({
    operation: "extract-content-intelligence",
    schemaName: "content_intelligence_extract",
    schema: ContentIntelligenceExtractSchema,
    instructions: prompt.instructions,
    input: prompt.input,
    primaryPromptVersion: LIBRARY_RUNTIME_PROMPT_VERSION,
    repair: {
      buildPrompt: buildLibrarianRepairPrompt,
    },
    projectId: parsed.projectId,
    inputSchemaVersion: "1.0.0",
    outputSchemaVersion: "1.0.0",
    charBudgetUsed: prompt.input.length,
    truncationWarningCount: truncated.truncated ? 1 : 0,
    meta: {
      redactionCount: redacted.redactions.length,
      extractTruncated: truncated.truncated,
    },
  });

  const runId = `run_${randomUUID()}`;
  const extractedAt = new Date().toISOString();
  const { items, validationResult } = curateLibraryItems({
    draft,
    artifactId: parsed.artifactId,
    extractionRunId: runId,
    rawText: parsed.researchText,
    capturedAt: extractedAt,
  });

  const extractionRun: ExtractionRun = {
    runId,
    artifactId: parsed.artifactId,
    operationId: "extract-content-intelligence",
    model: getOpenAIModel(),
    promptVersion: LIBRARY_RUNTIME_PROMPT_VERSION,
    extractedAt,
    validationResult,
  };

  return { extractionRun, items };
}
