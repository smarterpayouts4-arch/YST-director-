import { createHash } from "node:crypto";
import type { CsvEvidencePacket } from "@/features/research-prompt-builder/schemas";
import { parseCsvText } from "@/features/research-prompt-builder/ingestion/parse-csv";
import { EVIDENCE_PACKET_CHAR_BUDGET } from "@/features/research-prompt-builder/config/constants";

export function buildEvidencePacket(input: {
  fileName: string;
  bytes: Buffer;
  maxRows: number;
  maxColumns: number;
  maxCellChars: number;
}): CsvEvidencePacket {
  const text = input.bytes.toString("utf8");
  const parsed = parseCsvText(text, {
    maxRows: input.maxRows,
    maxColumns: input.maxColumns,
    maxCellChars: input.maxCellChars,
  });

  const seen = new Set<string>();
  const uniqueRows: Array<{ sourceRow: number; values: Record<string, string> }> =
    [];
  let duplicateCount = 0;
  for (const row of parsed.rows) {
    const key = JSON.stringify(row.values);
    if (seen.has(key)) {
      duplicateCount += 1;
      continue;
    }
    seen.add(key);
    uniqueRows.push(row);
  }

  const warnings = [...parsed.warnings];
  if (duplicateCount > 0) {
    warnings.push(`Removed ${duplicateCount} exact duplicate row(s).`);
  }

  const columnSummaries = parsed.headers.map((name) => {
    const values = uniqueRows
      .map((row) => row.values[name] ?? "")
      .filter(Boolean);
    const unique = new Set(values);
    return {
      name,
      nonEmptyCount: values.length,
      uniqueCount: unique.size,
      sampleValues: [...unique].slice(0, 5),
    };
  });

  const evidenceRows = [];
  let charBudget = 0;
  let wasTruncated = false;

  for (const row of uniqueRows) {
    const serialized = JSON.stringify(row.values);
    if (charBudget + serialized.length > EVIDENCE_PACKET_CHAR_BUDGET) {
      wasTruncated = true;
      break;
    }
    charBudget += serialized.length;
    evidenceRows.push({
      evidenceRef: `row-${row.sourceRow}`,
      sourceRow: row.sourceRow,
      values: row.values,
    });
  }

  if (wasTruncated) {
    warnings.push(
      "Evidence packet was truncated to stay within the character budget.",
    );
  }

  return {
    fileName: input.fileName,
    fileHash: createHash("sha256").update(input.bytes).digest("hex"),
    importedAt: new Date().toISOString(),
    rowCount: parsed.rows.length,
    retainedRowCount: evidenceRows.length,
    skippedRowCount: parsed.skippedRowCount + duplicateCount + (uniqueRows.length - evidenceRows.length),
    columnCount: parsed.headers.length,
    headers: parsed.headers,
    columnSummaries,
    evidenceRows,
    warnings,
    wasTruncated,
  };
}
