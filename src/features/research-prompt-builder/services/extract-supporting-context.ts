import "server-only";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { CONTEXT_BUDGETS, truncateString } from "@/ai/context/budgets";
import { redactDeep } from "@/ai/context/redact";
import {
  assertSupportingUpload,
  getExtension,
  sanitizeFileName,
} from "@/features/research-prompt-builder/ingestion/sanitize-upload";
import { extractDocumentText } from "@/features/research-prompt-builder/ingestion/extract-document-text";
import { getUploadLimits } from "@/features/research-prompt-builder/config/limits";
import { SupportingContextSchema } from "@/features/research-prompt-builder/schemas";
import { buildSupportingContextPrompt } from "@/features/research-prompt-builder/prompts/supporting-context";
import { parseStructuredOutput } from "@/features/research-prompt-builder/services/structured-openai";
import { getContractSchemaVersion } from "@/ai/contracts/registry";

const ExtractInputSchema = z.object({
  questionId: z.string().min(1).max(120),
  question: z.string().min(1).max(2000),
});

export async function extractSupportingContext(input: {
  file: File;
  questionId: string;
  question: string;
}) {
  const { questionId, question } = ExtractInputSchema.parse({
    questionId: input.questionId,
    question: input.question,
  });

  const limits = getUploadLimits();
  const safeName = sanitizeFileName(input.file.name);
  const bytes = Buffer.from(await input.file.arrayBuffer());
  assertSupportingUpload(safeName, bytes.byteLength, limits.maxSupportingFileBytes);

  const extracted = await extractDocumentText(safeName, bytes);
  const truncated = truncateString(
    extracted.text,
    CONTEXT_BUDGETS.supportingExtractChars,
  );
  const redactedPayload = redactDeep({
    question,
    fileName: safeName,
    documentType: getExtension(safeName).replace(".", "") || "unknown",
    extractedText: truncated.value,
  });

  const prompt = buildSupportingContextPrompt({
    fileName: redactedPayload.value.fileName,
    documentType: redactedPayload.value.documentType,
    question: redactedPayload.value.question,
    extractedText: redactedPayload.value.extractedText,
  });

  const supportingContext = await parseStructuredOutput({
    operation: "extract-supporting-context",
    schemaName: "supporting_context",
    schema: SupportingContextSchema,
    instructions: prompt.instructions,
    input: prompt.input,
    inputSchemaVersion: getContractSchemaVersion("interview-question"),
    outputSchemaVersion: getContractSchemaVersion("supporting-context"),
    charBudgetUsed: prompt.input.length,
    truncationWarningCount: truncated.truncated ? 1 : 0,
    meta: {
      redactionCount: redactedPayload.redactions.length,
      extractTruncated: truncated.truncated,
    },
  });

  return {
    supportingContext: {
      ...supportingContext,
      documentId: supportingContext.documentId || randomUUID(),
      fileName: safeName,
      warnings: [
        ...supportingContext.warnings,
        ...extracted.warnings,
        ...(truncated.truncated
          ? ["Supporting document text was truncated to the context budget."]
          : []),
        ...(redactedPayload.redactions.length
          ? [`Redacted sensitive patterns: ${redactedPayload.redactions.join(", ")}`]
          : []),
      ].slice(0, 12),
    },
    extractedCharCount: extracted.text.length,
    questionId,
  };
}
