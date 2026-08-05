import "server-only";

import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
import {
  getOpenAIClient,
  getOpenAIModel,
  getReasoningEffort,
} from "@/lib/openai";
import { buildRepairPrompt } from "@/features/research-prompt-builder/prompts/repair-output";
import { safeLog } from "@/lib/safe-log";

type ParseArgs<T extends z.ZodTypeAny> = {
  operation: string;
  schemaName: string;
  schema: T;
  instructions: string;
  input: string;
  validate?: (value: z.infer<T>) => string[];
};

export async function parseStructuredOutput<T extends z.ZodTypeAny>(
  args: ParseArgs<T>,
): Promise<z.infer<T>> {
  const client = getOpenAIClient();
  const model = getOpenAIModel();
  const started = Date.now();

  const runOnce = async (instructions: string, input: string) => {
    const effort = getReasoningEffort();
    const request: Record<string, unknown> = {
      model,
      store: false,
      instructions,
      input,
      text: {
        format: zodTextFormat(args.schema, args.schemaName),
      },
    };
    if (effort && effort !== "none") {
      request.reasoning = { effort };
    }

    const response = await client.responses.parse(request as never);
    const parsed = response.output_parsed;
    if (parsed == null) {
      throw Object.assign(new Error("Model returned no structured output."), {
        code: "MODEL_OUTPUT_INVALID" as const,
      });
    }
    return parsed as z.infer<T>;
  };

  try {
    let value = await runOnce(args.instructions, args.input);
    let issues = args.validate?.(value) ?? [];
    if (issues.length) {
      const repair = buildRepairPrompt({
        schemaName: args.schemaName,
        validationErrors: issues,
        previousOutput: value,
      });
      value = await runOnce(repair.instructions, repair.input);
      issues = args.validate?.(value) ?? [];
      if (issues.length) {
        throw Object.assign(
          new Error(`Structured output failed validation: ${issues.join("; ")}`),
          { code: "MODEL_OUTPUT_INVALID" as const },
        );
      }
    }

    safeLog("openai.structured.ok", {
      operation: args.operation,
      model,
      latencyMs: Date.now() - started,
    });
    return value;
  } catch (error) {
    const message = error instanceof Error ? error.message : "OpenAI request failed";
    const code =
      typeof error === "object" &&
      error &&
      "code" in error &&
      typeof (error as { code?: unknown }).code === "string"
        ? (error as { code: string }).code
        : message.toLowerCase().includes("timeout")
          ? "REQUEST_TIMEOUT"
          : "OPENAI_ERROR";
    safeLog("openai.structured.error", {
      operation: args.operation,
      model,
      latencyMs: Date.now() - started,
      code,
    });
    throw Object.assign(new Error(message), { code });
  }
}
