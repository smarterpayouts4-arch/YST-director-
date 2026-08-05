import "server-only";

import { randomUUID } from "node:crypto";
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

export async function extractSupportingContext(input: {
  file: File;
  questionId: string;
  question: string;
}) {
  const limits = getUploadLimits();
  const safeName = sanitizeFileName(input.file.name);
  const bytes = Buffer.from(await input.file.arrayBuffer());
  assertSupportingUpload(safeName, bytes.byteLength, limits.maxSupportingFileBytes);

  const extracted = await extractDocumentText(safeName, bytes);
  const prompt = buildSupportingContextPrompt({
    fileName: safeName,
    documentType: getExtension(safeName).replace(".", "") || "unknown",
    question: input.question,
    extractedText: extracted.text,
  });

  const supportingContext = await parseStructuredOutput({
    operation: "documents.extract",
    schemaName: "supporting_context",
    schema: SupportingContextSchema,
    instructions: prompt.instructions,
    input: prompt.input,
  });

  return {
    supportingContext: {
      ...supportingContext,
      documentId: supportingContext.documentId || randomUUID(),
      fileName: safeName,
      warnings: [...supportingContext.warnings, ...extracted.warnings].slice(0, 12),
    },
    extractedCharCount: extracted.text.length,
    questionId: input.questionId,
  };
}
