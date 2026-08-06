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
import { recordTrace } from "@/ai/traces/record-trace";
import { RUNTIME_PROMPT_VERSION } from "@/features/research-prompt-builder/prompts/prompt-version";
import { CONTRACT_SCHEMA_VERSION } from "@/ai/contracts/registry";

type ParseArgs<T extends z.ZodTypeAny> = {
  operation: string;
  schemaName: string;
  schema: T;
  instructions: string;
  input: string;
  validate?: (value: z.infer<T>) => string[];
  projectId?: string;
  inputSchemaVersion?: string;
  outputSchemaVersion?: string;
  charBudgetUsed?: number;
  truncationWarningCount?: number;
  meta?: Record<string, string | number | boolean | null>;
};

export async function parseStructuredOutput<T extends z.ZodTypeAny>(
  args: ParseArgs<T>,
): Promise<z.infer<T>> {
  const client = getOpenAIClient();
  const model = getOpenAIModel();
  const started = Date.now();
  const startedAt = new Date(started).toISOString();
  let repaired = false;
  let validationIssueCount = 0;

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

  const inputFingerprint = {
    operation: args.operation,
    schemaName: args.schemaName,
    inputChars: args.input.length,
    instructionChars: args.instructions.length,
  };

  try {
    let value = await runOnce(args.instructions, args.input);
    let issues = args.validate?.(value) ?? [];
    validationIssueCount = issues.length;
    if (issues.length) {
      const repair = buildRepairPrompt({
        schemaName: args.schemaName,
        validationErrors: issues,
        previousOutput: value,
      });
      value = await runOnce(repair.instructions, repair.input);
      repaired = true;
      issues = args.validate?.(value) ?? [];
      validationIssueCount = issues.length;
      if (issues.length) {
        recordTrace({
          operationId: args.operation,
          model,
          promptVersion: RUNTIME_PROMPT_VERSION,
          inputSchemaVersion: args.inputSchemaVersion ?? CONTRACT_SCHEMA_VERSION,
          outputSchemaVersion: args.outputSchemaVersion ?? CONTRACT_SCHEMA_VERSION,
          input: inputFingerprint,
          output: { validationIssues: issues.length },
          startedAt,
          status: "validation_failed",
          repaired,
          validationIssueCount,
          charBudgetUsed: args.charBudgetUsed,
          truncationWarningCount: args.truncationWarningCount,
          errorCode: "MODEL_OUTPUT_INVALID",
          projectId: args.projectId,
          meta: args.meta,
        });
        throw Object.assign(
          new Error(`Structured output failed validation: ${issues.join("; ")}`),
          { code: "MODEL_OUTPUT_INVALID" as const },
        );
      }
    }

    recordTrace({
      operationId: args.operation,
      model,
      promptVersion: RUNTIME_PROMPT_VERSION,
      inputSchemaVersion: args.inputSchemaVersion ?? CONTRACT_SCHEMA_VERSION,
      outputSchemaVersion: args.outputSchemaVersion ?? CONTRACT_SCHEMA_VERSION,
      input: inputFingerprint,
      output: { schemaName: args.schemaName },
      startedAt,
      status: repaired ? "repaired" : "ok",
      repaired,
      validationIssueCount,
      charBudgetUsed: args.charBudgetUsed,
      truncationWarningCount: args.truncationWarningCount,
      projectId: args.projectId,
      meta: args.meta,
    });

    safeLog("openai.structured.ok", {
      operation: args.operation,
      model,
      latencyMs: Date.now() - started,
      repaired,
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

    if (code !== "MODEL_OUTPUT_INVALID") {
      recordTrace({
        operationId: args.operation,
        model,
        promptVersion: RUNTIME_PROMPT_VERSION,
        inputSchemaVersion: args.inputSchemaVersion ?? CONTRACT_SCHEMA_VERSION,
        outputSchemaVersion: args.outputSchemaVersion ?? CONTRACT_SCHEMA_VERSION,
        input: inputFingerprint,
        startedAt,
        status: "error",
        repaired,
        validationIssueCount,
        charBudgetUsed: args.charBudgetUsed,
        truncationWarningCount: args.truncationWarningCount,
        errorCode: code,
        projectId: args.projectId,
        meta: args.meta,
      });
    }

    safeLog("openai.structured.error", {
      operation: args.operation,
      model,
      latencyMs: Date.now() - started,
      code,
    });
    throw Object.assign(new Error(message), { code });
  }
}
