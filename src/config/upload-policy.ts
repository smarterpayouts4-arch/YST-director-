import { getEnv } from "@/lib/env";

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
    allowedCsvExtensions: [".csv"],
    allowedSupportingExtensions: [".pdf", ".docx", ".txt", ".md"],
  };
}
