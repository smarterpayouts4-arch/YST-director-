import "server-only";

import { randomUUID } from "node:crypto";
import { redactDeep } from "@/ai/context/redact";
import { parseStructuredOutput } from "@/ai/structured-output/parse-structured-output";
import { getOpenAIModel } from "@/lib/openai";
import { MAX_RESEARCH_INPUT_CHARS } from "@/features/content-intelligence/library/config/research-input-limits";
import { ContentIntelligenceExtractSchema } from "@/features/content-intelligence/library/schemas/extract-draft";
import { ExtractRequestSchema } from "@/features/content-intelligence/library/schemas/extract-request";
import type { ExtractionRun } from "@/features/content-intelligence/library/schemas/extraction-run";
import type { LibraryItem } from "@/features/content-intelligence/library/schemas/library-item";
import { buildExtractContentIntelligencePrompt } from "@/features/content-intelligence/library/prompts/extract-content-intelligence";
import { LIBRARY_RUNTIME_PROMPT_VERSION } from "@/features/content-intelligence/library/prompts/prompt-version";
import { buildLibrarianRepairPrompt } from "@/features/content-intelligence/library/prompts/repair-output";
import { curateLibraryItems } from "@/features/content-intelligence/library/services/curate-library";

export async function extractContentIntelligence(input: {
  researchText: string;
  artifactId: string;
  projectId?: string;
}): Promise<{
  extractionRun: ExtractionRun;
  items: LibraryItem[];
}> {
  const parsed = ExtractRequestSchema.safeParse(input);
  if (!parsed.success) {
    throw Object.assign(
      new Error(
        `Completed research must be between 1 and ${MAX_RESEARCH_INPUT_CHARS.toLocaleString()} characters (no silent truncation).`,
      ),
      { code: "INVALID_INPUT" as const },
    );
  }

  if (parsed.data.researchText.length > MAX_RESEARCH_INPUT_CHARS) {
    throw Object.assign(
      new Error(
        `Completed research exceeds ${MAX_RESEARCH_INPUT_CHARS.toLocaleString()} characters. Shorten it before sending — the Librarian will not silently truncate.`,
      ),
      { code: "FILE_TOO_LARGE" as const },
    );
  }

  // Full text only — never truncate for the model.
  const redacted = redactDeep({ researchText: parsed.data.researchText });
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
    projectId: parsed.data.projectId,
    inputSchemaVersion: "1.0.0",
    outputSchemaVersion: "1.0.0",
    charBudgetUsed: prompt.input.length,
    truncationWarningCount: 0,
    meta: {
      redactionCount: redacted.redactions.length,
      extractTruncated: false,
      researchChars: parsed.data.researchText.length,
    },
  });

  const runId = `run_${randomUUID()}`;
  const extractedAt = new Date().toISOString();
  const { items, validationResult } = curateLibraryItems({
    draft,
    artifactId: parsed.data.artifactId,
    extractionRunId: runId,
    rawText: parsed.data.researchText,
    capturedAt: extractedAt,
  });

  const extractionRun: ExtractionRun = {
    runId,
    artifactId: parsed.data.artifactId,
    operationId: "extract-content-intelligence",
    model: getOpenAIModel(),
    promptVersion: LIBRARY_RUNTIME_PROMPT_VERSION,
    extractedAt,
    validationResult,
  };

  return { extractionRun, items };
}
