import mammoth from "mammoth";
import { getExtension } from "@/features/research-prompt-builder/ingestion/sanitize-upload";
import { normalizeCell } from "@/features/research-prompt-builder/ingestion/normalize-cell";

const MAX_EXTRACTED_CHARS = 20_000;

export async function extractDocumentText(
  fileName: string,
  bytes: Buffer,
): Promise<{ text: string; warnings: string[] }> {
  const ext = getExtension(fileName);
  const warnings: string[] = [];
  let raw = "";

  if (ext === ".txt" || ext === ".md" || ext === ".csv" || ext === ".json") {
    raw = bytes.toString("utf8");
  } else if (ext === ".docx") {
    const result = await mammoth.extractRawText({ buffer: bytes });
    raw = result.value;
    if (result.messages?.length) {
      warnings.push(...result.messages.map((m) => m.message).slice(0, 5));
    }
  } else if (ext === ".pdf") {
    try {
      const { extractText } = await import("unpdf");
      const result = await extractText(new Uint8Array(bytes));
      raw = Array.isArray(result.text) ? result.text.join("\n") : String(result.text ?? "");
    } catch {
      throw Object.assign(new Error("PDF text extraction failed."), {
        code: "DOCUMENT_EXTRACTION_FAILED" as const,
      });
    }
  } else {
    throw Object.assign(new Error("Unsupported document type."), {
      code: "UNSUPPORTED_FILE" as const,
    });
  }

  const text = normalizeCell(raw, MAX_EXTRACTED_CHARS);
  if (!text) {
    warnings.push("No extractable text was found in the document.");
  }
  if (raw.length > MAX_EXTRACTED_CHARS) {
    warnings.push("Extracted text was truncated for safety.");
  }

  return { text, warnings };
}
