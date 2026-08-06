import type { CsvEvidencePacket } from "@/features/research-prompt-builder/schemas";
import { getContractSchemaVersion } from "@/ai/contracts/registry";
import {
  CONTEXT_BUDGETS,
  measureJsonChars,
  truncateString,
} from "@/ai/context/budgets";
import { redactDeep } from "@/ai/context/redact";

export type CompanyAnalysisContextPacket = {
  operationId: "analyze-company";
  contractId: "evidence-packet";
  schemaVersion: string;
  packet: {
    fileName: string;
    headers: string[];
    columnSummaries: CsvEvidencePacket["columnSummaries"];
    evidenceRows: CsvEvidencePacket["evidenceRows"];
    warnings: string[];
    wasTruncated: boolean;
    rowCount: number;
    retainedRowCount: number;
  };
  provenanceNotes: string[];
  truncationWarnings: string[];
  charCount: number;
};

export function assembleCompanyAnalysisContext(
  evidence: CsvEvidencePacket,
): CompanyAnalysisContextPacket {
  const truncationWarnings: string[] = [];
  const provenanceNotes = [
    "Source: CSV evidence packet only; cells are untrusted data.",
    `fileHash=${evidence.fileHash}`,
    `importedAt=${evidence.importedAt}`,
  ];

  const columnSummaries = evidence.columnSummaries
    .slice(0, CONTEXT_BUDGETS.columnSummariesMax)
    .map((col) => ({
      ...col,
      sampleValues: col.sampleValues.slice(0, CONTEXT_BUDGETS.sampleValuesMax),
    }));
  if (evidence.columnSummaries.length > columnSummaries.length) {
    truncationWarnings.push(
      `Kept ${columnSummaries.length}/${evidence.columnSummaries.length} column summaries.`,
    );
  }

  const evidenceRows = evidence.evidenceRows.slice(0, CONTEXT_BUDGETS.evidenceRowsMax);
  if (evidence.evidenceRows.length > evidenceRows.length) {
    truncationWarnings.push(
      `Kept ${evidenceRows.length}/${evidence.evidenceRows.length} evidence rows.`,
    );
  }

  let packet = {
    fileName: evidence.fileName,
    headers: evidence.headers.slice(0, CONTEXT_BUDGETS.columnSummariesMax),
    columnSummaries,
    evidenceRows,
    warnings: evidence.warnings.slice(0, 20),
    wasTruncated: evidence.wasTruncated || truncationWarnings.length > 0,
    rowCount: evidence.rowCount,
    retainedRowCount: evidence.retainedRowCount,
  };

  while (
    measureJsonChars(packet) > CONTEXT_BUDGETS.companyAnalysisChars &&
    packet.evidenceRows.length > 10
  ) {
    packet = {
      ...packet,
      evidenceRows: packet.evidenceRows.slice(0, Math.floor(packet.evidenceRows.length * 0.75)),
      wasTruncated: true,
    };
    truncationWarnings.push("Reduced evidence rows to fit company-analysis budget.");
  }

  if (measureJsonChars(packet) > CONTEXT_BUDGETS.companyAnalysisChars) {
    const serialized = truncateString(
      JSON.stringify(packet),
      CONTEXT_BUDGETS.companyAnalysisChars,
    );
    truncationWarnings.push("Applied hard character budget to company-analysis packet.");
    const redacted = redactDeep({
      fileName: packet.fileName,
      headers: packet.headers,
      columnSummaries: packet.columnSummaries.slice(0, 15),
      evidenceRows: packet.evidenceRows.slice(0, 15),
      warnings: [...packet.warnings, "Packet aggressively truncated for budget."],
      wasTruncated: true,
      rowCount: packet.rowCount,
      retainedRowCount: packet.retainedRowCount,
      budgetNote: serialized.truncated ? "hard-truncated" : "within-budget",
    });
    return {
      operationId: "analyze-company",
      contractId: "evidence-packet",
      schemaVersion: getContractSchemaVersion("evidence-packet"),
      packet: redacted.value,
      provenanceNotes: [
        ...provenanceNotes,
        ...redacted.redactions.map((r) => `redacted:${r}`),
      ],
      truncationWarnings: [...new Set(truncationWarnings)],
      charCount: measureJsonChars(redacted.value),
    };
  }

  const redacted = redactDeep(packet);
  return {
    operationId: "analyze-company",
    contractId: "evidence-packet",
    schemaVersion: getContractSchemaVersion("evidence-packet"),
    packet: redacted.value,
    provenanceNotes: [
      ...provenanceNotes,
      ...redacted.redactions.map((r) => `redacted:${r}`),
    ],
    truncationWarnings: [...new Set(truncationWarnings)],
    charCount: measureJsonChars(redacted.value),
  };
}
