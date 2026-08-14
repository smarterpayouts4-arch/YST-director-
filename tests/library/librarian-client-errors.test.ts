import { describe, expect, it } from "vitest";
import { formatLibrarianClientError } from "@/features/content-intelligence/library/services/librarian-client-errors";

describe("formatLibrarianClientError", () => {
  it("humanizes Zod too_big on items without leaking JSON", () => {
    const zodJson = JSON.stringify([
      {
        code: "too_big",
        maximum: 500,
        type: "array",
        inclusive: true,
        exact: false,
        message: "Array must contain at most 500 element(s)",
        path: ["items"],
      },
    ]);
    const msg = formatLibrarianClientError(new Error(zodJson));
    expect(msg).toMatch(/fresh Library/i);
    expect(msg).not.toContain("too_big");
    expect(msg).not.toContain('"path"');
  });

  it("masks other raw JSON error payloads", () => {
    const msg = formatLibrarianClientError(new Error('[{"code":"invalid_type"}]'));
    expect(msg).toMatch(/Try sending again/i);
    expect(msg).not.toContain("invalid_type");
  });

  it("passes through ordinary human messages", () => {
    expect(formatLibrarianClientError(new Error("Extraction failed."))).toBe(
      "Extraction failed.",
    );
  });
});
