import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonRequest, codedError } from "./helpers";
import { makeConfirmedProfile } from "../fixtures/api/confirmed-profile";
import { makeResearchBrief } from "../fixtures/api/research-brief";
import { makeFinalPrompt } from "../fixtures/api/final-prompt";

vi.mock(
  "@/features/research-prompt-builder/services/generate-research-prompt",
  () => ({ generateResearchPrompt: vi.fn() }),
);

import { POST } from "@/app/api/research-prompt/route";
import { generateResearchPrompt } from "@/features/research-prompt-builder/services/generate-research-prompt";

const mockedGenerate = vi.mocked(generateResearchPrompt);

beforeEach(() => {
  mockedGenerate.mockReset();
});

const validBody = () => ({
  confirmedProfile: makeConfirmedProfile(),
  researchBrief: makeResearchBrief(),
});

describe("POST /api/research-prompt", () => {
  it("returns the structured and formatted prompt", async () => {
    mockedGenerate.mockResolvedValue({
      structuredPrompt: makeFinalPrompt(),
      formattedPrompt: "# ZYNAVA US Supplement-Comparison Content Market Research Prompt",
      promptVersion: "1.0.0",
    } as never);
    const res = await POST(jsonRequest(validBody()));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.structuredPrompt.metadata.promptVersion).toBe("1.1.0");
    expect(body.formattedPrompt).toContain("# ZYNAVA");
  });

  it("maps prompt-contract validation failures to 400 MODEL_OUTPUT_INVALID", async () => {
    mockedGenerate.mockRejectedValue(
      codedError(
        "Structured output failed validation: Missing required section.",
        "MODEL_OUTPUT_INVALID",
      ),
    );
    const res = await POST(jsonRequest(validBody()));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("MODEL_OUTPUT_INVALID");
  });

  it("maps model refusal to 400 MODEL_REFUSAL", async () => {
    mockedGenerate.mockRejectedValue(codedError("Refused.", "MODEL_REFUSAL"));
    const res = await POST(jsonRequest(validBody()));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("MODEL_REFUSAL");
  });

  it("maps timeouts to REQUEST_TIMEOUT", async () => {
    mockedGenerate.mockRejectedValue(codedError("Request timeout.", "REQUEST_TIMEOUT"));
    const res = await POST(jsonRequest(validBody()));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("REQUEST_TIMEOUT");
  });

  it("maps unknown errors to 500 OPENAI_ERROR", async () => {
    mockedGenerate.mockRejectedValue(new Error("boom"));
    const res = await POST(jsonRequest(validBody()));
    expect(res.status).toBe(500);
    expect((await res.json()).error.code).toBe("OPENAI_ERROR");
  });
});
