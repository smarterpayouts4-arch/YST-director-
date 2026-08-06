import { getEnv } from "@/lib/env";

/**
 * Single source of truth for upload allowlists. The dropzone `accept`
 * attribute, sanitize-upload assertions, and extract-document-text handlers
 * must all derive from these lists.
 */
export const ALLOWED_CSV_EXTENSIONS = [".csv"] as const;
export const ALLOWED_SUPPORTING_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".txt",
  ".md",
  ".csv",
  ".json",
] as const;

export const SUPPORTING_ACCEPT_ATTR = ALLOWED_SUPPORTING_EXTENSIONS.join(",");

export type UploadPolicy = {
  maxCsvBytes: number;
  maxCsvRows: number;
  maxCsvColumns: number;
  maxSupportingFileBytes: number;
  maxSupportingFilesPerQuestion: number;
  maxCellChars: number;
  allowedCsvExtensions: string[];
  allowedSupportingExtensions: string[];
};

export function getUploadPolicy(): UploadPolicy {
  const env = getEnv();
  return {
    maxCsvBytes: env.MAX_CSV_BYTES,
    maxCsvRows: env.MAX_CSV_ROWS,
    maxCsvColumns: env.MAX_CSV_COLUMNS,
    maxSupportingFileBytes: env.MAX_SUPPORTING_FILE_BYTES,
    maxSupportingFilesPerQuestion: env.MAX_SUPPORTING_FILES_PER_QUESTION,
    maxCellChars: 2000,
    allowedCsvExtensions: [...ALLOWED_CSV_EXTENSIONS],
    allowedSupportingExtensions: [...ALLOWED_SUPPORTING_EXTENSIONS],
  };
}
