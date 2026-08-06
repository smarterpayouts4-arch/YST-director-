import "server-only";

import { assembleCompanyAnalysisContext } from "@/ai/context";
import { getContractSchemaVersion } from "@/ai/contracts/registry";
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

  const contextPacket = assembleCompanyAnalysisContext(evidencePacket);
  const prompt = buildCompanyAnalystPrompt(contextPacket);
  const companyUnderstanding = await parseStructuredOutput({
    operation: "analyze-company",
    schemaName: "company_understanding",
    schema: CompanyUnderstandingSchema,
    instructions: prompt.instructions,
    input: prompt.input,
    inputSchemaVersion: getContractSchemaVersion("evidence-packet"),
    outputSchemaVersion: getContractSchemaVersion("company-understanding"),
    charBudgetUsed: contextPacket.charCount,
    truncationWarningCount: contextPacket.truncationWarnings.length,
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
    companyUnderstanding,
    promptVersion: RUNTIME_PROMPT_VERSION,
    evidencePacket,
    contextMeta: {
      provenanceNotes: contextPacket.provenanceNotes,
      truncationWarnings: contextPacket.truncationWarnings,
      charCount: contextPacket.charCount,
    },
  };
}
