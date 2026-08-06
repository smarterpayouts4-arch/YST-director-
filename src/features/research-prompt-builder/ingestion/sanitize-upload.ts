import {
  ALLOWED_CSV_EXTENSIONS,
  ALLOWED_SUPPORTING_EXTENSIONS,
} from "@/config/upload-policy";

const CSV_EXTENSIONS = new Set<string>(ALLOWED_CSV_EXTENSIONS);
const SUPPORTING_EXTENSIONS = new Set<string>(ALLOWED_SUPPORTING_EXTENSIONS);

export function getExtension(fileName: string): string {
  const idx = fileName.lastIndexOf(".");
  if (idx < 0) return "";
  return fileName.slice(idx).toLowerCase();
}

export function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^\w.\- ()[\]]+/g, "_").slice(0, 180);
}

export function assertCsvUpload(fileName: string, byteLength: number, maxBytes: number) {
  const ext = getExtension(fileName);
  if (!CSV_EXTENSIONS.has(ext)) {
    throw Object.assign(new Error("Only .csv files are accepted for company ingestion."), {
      code: "UNSUPPORTED_FILE" as const,
    });
  }
  if (byteLength > maxBytes) {
    throw Object.assign(new Error(`CSV exceeds the ${maxBytes} byte limit.`), {
      code: "FILE_TOO_LARGE" as const,
    });
  }
}

export function assertSupportingUpload(
  fileName: string,
  byteLength: number,
  maxBytes: number,
) {
  const ext = getExtension(fileName);
  if (!SUPPORTING_EXTENSIONS.has(ext)) {
    throw Object.assign(
      new Error("Unsupported supporting file type. Use PDF, DOCX, TXT, MD, CSV, or JSON."),
      { code: "UNSUPPORTED_FILE" as const },
    );
  }
  if (byteLength > maxBytes) {
    throw Object.assign(new Error(`Supporting file exceeds the ${maxBytes} byte limit.`), {
      code: "FILE_TOO_LARGE" as const,
    });
  }
}
