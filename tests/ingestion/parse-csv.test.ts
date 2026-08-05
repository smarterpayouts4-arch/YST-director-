import { describe, expect, it } from "vitest";
import { parseCsvText } from "@/features/research-prompt-builder/ingestion/parse-csv";
import { buildEvidencePacket } from "@/features/research-prompt-builder/ingestion/build-evidence-packet";

describe("CSV ingestion", () => {
  it("parses a valid CSV and creates stable evidence refs", () => {
    const csv = "name,offer\nZYNAVA,Compare supplements\n";
    const parsed = parseCsvText(csv, {
      maxRows: 100,
      maxColumns: 20,
      maxCellChars: 2000,
    });
    expect(parsed.headers).toEqual(["name", "offer"]);
    expect(parsed.rows[0].values.offer).toContain("Compare");

    const packet = buildEvidencePacket({
      fileName: "sample.csv",
      bytes: Buffer.from(csv, "utf8"),
      maxRows: 100,
      maxColumns: 20,
      maxCellChars: 2000,
    });
    expect(packet.evidenceRows[0].evidenceRef).toBe("row-2");
    expect(packet.wasTruncated).toBe(false);
  });

  it("strips null bytes and reports oversized row limits", () => {
    const rows = Array.from({ length: 5 }, (_, i) => `r${i},v${i}`).join("\n");
    const csv = `a,b\n${rows}`;
    const packet = buildEvidencePacket({
      fileName: "sample.csv",
      bytes: Buffer.from(`\u0000${csv}`, "utf8"),
      maxRows: 2,
      maxColumns: 10,
      maxCellChars: 2000,
    });
    expect(packet.retainedRowCount).toBeLessThanOrEqual(2);
    expect(packet.warnings.some((w) => /exceeded/i.test(w))).toBe(true);
  });

  it("rejects empty CSV", () => {
    expect(() =>
      parseCsvText("", { maxRows: 10, maxColumns: 10, maxCellChars: 100 }),
    ).toThrow(/empty|parse/i);
  });
});
