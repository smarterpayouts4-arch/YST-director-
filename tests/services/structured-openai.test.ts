import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

vi.mock("server-only", () => ({}));

const parseMock = vi.fn();
vi.mock("@/lib/openai", () => ({
  getOpenAIClient: () => ({ responses: { parse: parseMock } }),
  getOpenAIModel: () => "test-model",
  getReasoningEffort: () => "none",
}));

const recordTraceMock = vi.fn();
vi.mock("@/ai/traces/record-trace", () => ({
  recordTrace: (...args: unknown[]) => recordTraceMock(...args),
}));

import { parseStructuredOutput } from "@/features/research-prompt-builder/services/structured-openai";

const schema = z.object({ answer: z.string() });

function baseArgs(validate?: (value: { answer: string }) => string[]) {
  return {
    operation: "analyze-company" as const,
    schemaName: "company_understanding" as const,
    schema,
    instructions: "Return an answer.",
    input: "input",
    validate,
  };
}

beforeEach(() => {
  parseMock.mockReset();
  recordTraceMock.mockReset();
});

describe("parseStructuredOutput", () => {
  it("returns the parsed value when valid on first attempt", async () => {
    parseMock.mockResolvedValue({ output_parsed: { answer: "ok" } });
    const value = await parseStructuredOutput(baseArgs());
    expect(value).toEqual({ answer: "ok" });
    expect(parseMock).toHaveBeenCalledTimes(1);
    expect(recordTraceMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: "ok", repaired: false }),
    );
  });

  it("performs exactly one targeted repair when validation fails once", async () => {
    parseMock
      .mockResolvedValueOnce({ output_parsed: { answer: "bad" } })
      .mockResolvedValueOnce({ output_parsed: { answer: "good" } });
    const validate = (value: { answer: string }) =>
      value.answer === "bad" ? ["answer must not be bad"] : [];
    const value = await parseStructuredOutput(baseArgs(validate));
    expect(value).toEqual({ answer: "good" });
    expect(parseMock).toHaveBeenCalledTimes(2);
    const repairCall = parseMock.mock.calls[1]![0] as {
      instructions: string;
      input: string;
    };
    expect(repairCall.instructions).toMatch(/Prompt version:/);
    expect(repairCall.input).toContain("BEGIN_UNTRUSTED_REPAIR_PREVIOUS_OUTPUT");
    expect(recordTraceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "repaired",
        repaired: true,
        repairAttempts: 1,
        finalValidation: "passed",
      }),
    );
  });

  it("throws MODEL_OUTPUT_INVALID when repair also fails validation", async () => {
    parseMock.mockResolvedValue({ output_parsed: { answer: "bad" } });
    const validate = () => ["always invalid"];
    await expect(parseStructuredOutput(baseArgs(validate))).rejects.toMatchObject({
      code: "MODEL_OUTPUT_INVALID",
    });
    // Non-compiler schemas get exactly one repair attempt (initial + 1).
    expect(parseMock).toHaveBeenCalledTimes(2);
    expect(recordTraceMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: "validation_failed" }),
    );
  });

  it("allows two repair attempts for final_research_prompt", async () => {
    parseMock
      .mockResolvedValueOnce({ output_parsed: { answer: "bad1" } })
      .mockResolvedValueOnce({ output_parsed: { answer: "bad2" } })
      .mockResolvedValueOnce({ output_parsed: { answer: "good" } });
    const validate = (value: { answer: string }) =>
      value.answer === "good" ? [] : ["still invalid"];
    const value = await parseStructuredOutput({
      ...baseArgs(validate),
      schemaName: "final_research_prompt",
    });
    expect(value).toEqual({ answer: "good" });
    expect(parseMock).toHaveBeenCalledTimes(3);
    expect(recordTraceMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: "repaired", repaired: true }),
    );
  });

  it("throws MODEL_OUTPUT_INVALID when the model returns no structured output", async () => {
    parseMock.mockResolvedValue({ output_parsed: null });
    await expect(parseStructuredOutput(baseArgs())).rejects.toMatchObject({
      code: "MODEL_OUTPUT_INVALID",
    });
  });

  it("maps timeout messages to REQUEST_TIMEOUT", async () => {
    parseMock.mockRejectedValue(new Error("Connection timeout after 120000ms"));
    await expect(parseStructuredOutput(baseArgs())).rejects.toMatchObject({
      code: "REQUEST_TIMEOUT",
    });
    expect(recordTraceMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: "error", errorCode: "REQUEST_TIMEOUT" }),
    );
  });

  it("maps unknown provider failures to OPENAI_ERROR", async () => {
    parseMock.mockRejectedValue(new Error("provider exploded"));
    await expect(parseStructuredOutput(baseArgs())).rejects.toMatchObject({
      code: "OPENAI_ERROR",
    });
  });

  it("preserves explicit error codes thrown by the provider layer", async () => {
    parseMock.mockRejectedValue(
      Object.assign(new Error("refused"), { code: "MODEL_REFUSAL" }),
    );
    await expect(parseStructuredOutput(baseArgs())).rejects.toMatchObject({
      code: "MODEL_REFUSAL",
    });
  });
});
