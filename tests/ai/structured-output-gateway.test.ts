import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

vi.mock("server-only", () => ({}));

const parseMock = vi.fn();
vi.mock("@/lib/openai", () => ({
  getOpenAIClient: () => ({ responses: { parse: parseMock } }),
  getOpenAIModel: () => "test-model",
  getReasoningEffort: () => "none",
}));

vi.mock("@/ai/traces/record-trace", () => ({
  recordTrace: vi.fn(),
}));

import { parseStructuredOutput } from "@/ai/structured-output/parse-structured-output";

const schema = z.object({ answer: z.string() });
const gatewaySourcePath = join(
  process.cwd(),
  "src/ai/structured-output/parse-structured-output.ts",
);

describe("shared structured-output gateway", () => {
  beforeEach(() => {
    parseMock.mockReset();
  });

  it("does not import research-prompt-builder product logic", () => {
    const source = readFileSync(gatewaySourcePath, "utf8");
    expect(source).not.toMatch(/research-prompt-builder/);
    expect(source).not.toMatch(/company-anchors/);
    expect(source).not.toMatch(/RUNTIME_PROMPT_VERSION/);
    expect(source).not.toMatch(/buildRepairPrompt/);
    expect(source).not.toMatch(/prompt-contract/);
  });

  it("requires feature-supplied primaryPromptVersion", async () => {
    parseMock.mockResolvedValue({ output_parsed: { answer: "ok" } });
    const value = await parseStructuredOutput({
      operation: "analyze-company",
      schemaName: "company_understanding",
      schema,
      instructions: "Return an answer.",
      input: "input",
      primaryPromptVersion: "ci-test-1.0.0",
    });
    expect(value).toEqual({ answer: "ok" });
  });

  it("skips repair when no repair builder is provided", async () => {
    parseMock.mockResolvedValue({ output_parsed: { answer: "bad" } });
    await expect(
      parseStructuredOutput({
        operation: "analyze-company",
        schemaName: "company_understanding",
        schema,
        instructions: "Return an answer.",
        input: "input",
        primaryPromptVersion: "ci-test-1.0.0",
        validate: () => ["always invalid"],
      }),
    ).rejects.toMatchObject({ code: "MODEL_OUTPUT_INVALID" });
    expect(parseMock).toHaveBeenCalledTimes(1);
  });

  it("uses injected repair builder without RPB coupling", async () => {
    parseMock
      .mockResolvedValueOnce({ output_parsed: { answer: "bad" } })
      .mockResolvedValueOnce({ output_parsed: { answer: "good" } });
    const value = await parseStructuredOutput({
      operation: "analyze-company",
      schemaName: "company_understanding",
      schema,
      instructions: "Return an answer.",
      input: "input",
      primaryPromptVersion: "feature-runtime-9.9.9",
      validate: (v) => (v.answer === "bad" ? ["bad"] : []),
      repair: {
        buildPrompt: () => ({
          instructions: "Prompt version: feature-runtime-9.9.9\nRepair.",
          input: "BEGIN_UNTRUSTED_REPAIR_PREVIOUS_OUTPUT\n{}",
          promptVersion: "feature-runtime-9.9.9",
        }),
      },
    });
    expect(value).toEqual({ answer: "good" });
    expect(parseMock).toHaveBeenCalledTimes(2);
  });
});
