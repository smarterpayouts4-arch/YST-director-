import "server-only";

import { buildEvidencePacket } from "@/features/research-prompt-builder/ingestion/build-evidence-packet";
import { assertCsvUpload, sanitizeFileName } from "@/features/research-prompt-builder/ingestion/sanitize-upload";
import { getUploadLimits } from "@/features/research-prompt-builder/config/limits";
import { CompanyUnderstandingSchema } from "@/features/research-prompt-builder/schemas";
import { buildCompanyAnalystPrompt } from "@/features/research-prompt-builder/prompts/company-analyst";
import { parseStructuredOutput } from "@/features/research-prompt-builder/services/structured-openai";
import { RUNTIME_PROMPT_VERSION } from "@/features/research-prompt-builder/prompts/prompt-version";

export async function analyzeCompanyFromCsv(file: File) {
  const limits = getUploadLimits();
  const safeName = sanitizeFileName(file.name);
  const bytes = Buffer.from(await file.arrayBuffer());
  assertCsvUpload(safeName, bytes.byteLength, limits.maxCsvBytes);

  const evidencePacket = buildEvidencePacket({
    fileName: safeName,
    bytes,
    maxRows: limits.maxCsvRows,
    maxColumns: limits.maxCsvColumns,
    maxCellChars: limits.maxCellChars,
  });

  const prompt = buildCompanyAnalystPrompt(evidencePacket);
  const companyUnderstanding = await parseStructuredOutput({
    operation: "company.understand",
    schemaName: "company_understanding",
    schema: CompanyUnderstandingSchema,
    instructions: prompt.instructions,
    input: prompt.input,
  });

  return {
    evidencePacketMeta: {
      fileName: evidencePacket.fileName,
      fileHash: evidencePacket.fileHash,
      importedAt: evidencePacket.importedAt,
      rowCount: evidencePacket.rowCount,
      retainedRowCount: evidencePacket.retainedRowCount,
      warnings: evidencePacket.warnings,
      wasTruncated: evidencePacket.wasTruncated,
    },
    // Keep packet server-side only for this response path's model call;
    // client receives metadata + understanding.
    companyUnderstanding,
    promptVersion: RUNTIME_PROMPT_VERSION,
    evidencePacket,
  };
}
