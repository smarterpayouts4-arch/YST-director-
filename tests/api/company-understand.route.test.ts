import { beforeEach, describe, expect, it, vi } from "vitest";
import { formRequest, codedError } from "./helpers";
import { makeCompanyUnderstanding } from "../fixtures/api/company-understanding";

vi.mock("@/features/research-prompt-builder/services/analyze-company", () => ({
  analyzeCompanyFromCsv: vi.fn(),
}));

import { POST } from "@/app/api/company/understand/route";
import { analyzeCompanyFromCsv } from "@/features/research-prompt-builder/services/analyze-company";

const mockedAnalyze = vi.mocked(analyzeCompanyFromCsv);

const serviceResult = {
  evidencePacketMeta: {
    fileName: "company.csv",
    fileHash: "abc123",
    importedAt: "2026-08-05T12:00:00.000Z",
    rowCount: 12,
    retainedRowCount: 12,
    warnings: [],
    wasTruncated: false,
  },
  companyUnderstanding: makeCompanyUnderstanding(),
  promptVersion: "1.0.0",
};

beforeEach(() => {
  mockedAnalyze.mockReset();
});

describe("POST /api/company/understand", () => {
  it("returns understanding for a valid CSV upload", async () => {
    mockedAnalyze.mockResolvedValue(serviceResult as never);
    const file = new File(["name,industry\nZYNAVA,Supplements"], "company.csv", {
      type: "text/csv",
    });
    const res = await POST(formRequest({ file }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.companyUnderstanding.companyName.value).toBe("ZYNAVA");
    expect(body.promptVersion).toBe("1.0.0");
    expect(mockedAnalyze).toHaveBeenCalledWith(file);
  });

  it("rejects a missing file with INVALID_INPUT and 400", async () => {
    const res = await POST(formRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("INVALID_INPUT");
    expect(body.error.requestId).toBeTruthy();
    expect(mockedAnalyze).not.toHaveBeenCalled();
  });

  it("maps model refusal to 400 MODEL_REFUSAL", async () => {
    mockedAnalyze.mockRejectedValue(codedError("Refused.", "MODEL_REFUSAL"));
    const file = new File(["a,b"], "company.csv");
    const res = await POST(formRequest({ file }));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("MODEL_REFUSAL");
  });

  it("maps invalid structured output to 400 MODEL_OUTPUT_INVALID", async () => {
    mockedAnalyze.mockRejectedValue(
      codedError("Structured output failed validation.", "MODEL_OUTPUT_INVALID"),
    );
    const res = await POST(formRequest({ file: new File(["a"], "c.csv") }));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("MODEL_OUTPUT_INVALID");
  });

  it("maps timeouts to 400 REQUEST_TIMEOUT", async () => {
    mockedAnalyze.mockRejectedValue(codedError("Request timeout.", "REQUEST_TIMEOUT"));
    const res = await POST(formRequest({ file: new File(["a"], "c.csv") }));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("REQUEST_TIMEOUT");
  });

  it("maps unknown errors to the safe 500 fallback without leaking internals", async () => {
    mockedAnalyze.mockRejectedValue(new Error("boom"));
    const res = await POST(formRequest({ file: new File(["a"], "c.csv") }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.code).toBe("OPENAI_ERROR");
    expect(JSON.stringify(body)).not.toContain("stack");
  });
});
