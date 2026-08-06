import { beforeEach, describe, expect, it, vi } from "vitest";
import { formRequest, codedError } from "./helpers";
import { makeSupportingContext } from "../fixtures/api/supporting-context";

vi.mock(
  "@/features/research-prompt-builder/services/extract-supporting-context",
  () => ({ extractSupportingContext: vi.fn() }),
);

import { POST } from "@/app/api/documents/extract/route";
import { extractSupportingContext } from "@/features/research-prompt-builder/services/extract-supporting-context";

const mockedExtract = vi.mocked(extractSupportingContext);

beforeEach(() => {
  mockedExtract.mockReset();
});

const validEntries = () => ({
  file: new File(["notes"], "service-area-notes.pdf", { type: "application/pdf" }),
  questionId: "q1",
  question: "When do customers call you first?",
});

describe("POST /api/documents/extract", () => {
  it("returns supporting context for a valid upload", async () => {
    mockedExtract.mockResolvedValue({
      supportingContext: makeSupportingContext(),
      extractedCharCount: 512,
      questionId: "q1",
    } as never);
    const res = await POST(formRequest(validEntries()));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.supportingContext.fileName).toBe("service-area-notes.pdf");
    expect(body.questionId).toBe("q1");
  });

  it("rejects missing fields with INVALID_INPUT", async () => {
    const res = await POST(formRequest({ questionId: "q1" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("INVALID_INPUT");
    expect(mockedExtract).not.toHaveBeenCalled();
  });

  it("maps unsupported file types to 400 UNSUPPORTED_FILE", async () => {
    mockedExtract.mockRejectedValue(
      codedError("Unsupported supporting file type.", "UNSUPPORTED_FILE"),
    );
    const res = await POST(formRequest(validEntries()));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("UNSUPPORTED_FILE");
  });

  it("maps extraction failures to 400 DOCUMENT_EXTRACTION_FAILED", async () => {
    mockedExtract.mockRejectedValue(
      codedError("PDF text extraction failed.", "DOCUMENT_EXTRACTION_FAILED"),
    );
    const res = await POST(formRequest(validEntries()));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("DOCUMENT_EXTRACTION_FAILED");
  });

  it("falls back to DOCUMENT_EXTRACTION_FAILED for uncoded errors", async () => {
    mockedExtract.mockRejectedValue(new Error("boom"));
    const res = await POST(formRequest(validEntries()));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("DOCUMENT_EXTRACTION_FAILED");
  });
});
