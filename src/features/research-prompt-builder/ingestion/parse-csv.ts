import { parse } from "csv-parse/sync";
import { normalizeCell } from "@/features/research-prompt-builder/ingestion/normalize-cell";

export type ParsedCsv = {
  headers: string[];
  rows: Array<{ sourceRow: number; values: Record<string, string> }>;
  skippedRowCount: number;
  warnings: string[];
};

export function parseCsvText(
  text: string,
  options: { maxRows: number; maxColumns: number; maxCellChars: number },
): ParsedCsv {
  const cleaned = text.replace(/\u0000/g, "");
  let records: string[][];
  try {
    records = parse(cleaned, {
      bom: true,
      relax_column_count: true,
      skip_empty_lines: true,
      trim: false,
    }) as string[][];
  } catch (error) {
    throw Object.assign(
      new Error(
        error instanceof Error ? error.message : "CSV could not be parsed.",
      ),
      { code: "CSV_PARSE_FAILED" as const },
    );
  }

  if (!records.length) {
    throw Object.assign(new Error("CSV is empty."), {
      code: "CSV_PARSE_FAILED" as const,
    });
  }

  const warnings: string[] = [];
  const headerCells = records[0].map((h, i) => {
    const normalized = normalizeCell(h, options.maxCellChars);
    return normalized || `column_${i + 1}`;
  });

  let headers = headerCells;
  if (headers.length > options.maxColumns) {
    warnings.push(
      `CSV has ${headers.length} columns; only the first ${options.maxColumns} were retained.`,
    );
    headers = headers.slice(0, options.maxColumns);
  }

  const rows: ParsedCsv["rows"] = [];
  let skippedRowCount = 0;

  for (let i = 1; i < records.length; i += 1) {
    if (rows.length >= options.maxRows) {
      warnings.push(
        `CSV exceeded ${options.maxRows} data rows; remaining rows were skipped.`,
      );
      skippedRowCount += records.length - i;
      break;
    }

    const record = records[i];
    if (!record || record.every((cell) => !normalizeCell(cell))) {
      skippedRowCount += 1;
      continue;
    }

    const values: Record<string, string> = {};
    headers.forEach((header, colIdx) => {
      values[header] = normalizeCell(record[colIdx], options.maxCellChars);
    });
    rows.push({ sourceRow: i + 1, values });
  }

  return { headers, rows, skippedRowCount, warnings };
}
