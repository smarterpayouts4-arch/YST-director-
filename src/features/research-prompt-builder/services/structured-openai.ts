import "server-only";

import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
import {
  getOpenAIClient,
  getOpenAIModel,
  getReasoningEffort,
} from "@/lib/openai";
import { buildRepairPrompt } from "@/features/research-prompt-builder/prompts/repair-output";
import type { CompanyAnchors } from "@/features/research-prompt-builder/lib/company-anchors";
import { safeLog } from "@/lib/safe-log";
import { recordTrace } from "@/ai/traces/record-trace";
import { RUNTIME_PROMPT_VERSION } from "@/features/research-prompt-builder/prompts/prompt-version";
import { CONTRACT_SCHEMA_VERSION } from "@/ai/contracts/registry";
import type { AiOperationId } from "@/ai/operations/registry";
import type { AiSchemaName } from "@/ai/operations/schema-names";
import {
  getRepairPolicy,
  isRepairableFailure,
} from "@/ai/operations/repair-policy";

type ParseArgs<T extends z.ZodTypeAny> = {
  operation: AiOperationId;
  schemaName: AiSchemaName;
  schema: T;
  instructions: string;
  input: string;
  validate?: (value: z.infer<T>) => string[];
  /** Optional diagnostics attached to validation_failed traces (e.g. anchorCoverage). */
  validationDiagnostics?: (
    value: z.infer<T>,
    issues: string[],
  ) => Record<string, unknown>;
  /** Concrete anchors for final_research_prompt repair hints. */
  anchors?: CompanyAnchors;
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
  let repairAttempts = 0;
  let validationIssueCount = 0;
  let lastIssues: string[] = [];
  let lastValue: z.infer<T> | null = null;
  let lastRepairPromptVersion: string | null = null;
  // op → schemaName → repair policy (structural conform only; not task change)
  const repairPolicy = getRepairPolicy(args.schemaName);
  const primaryPromptVersion = RUNTIME_PROMPT_VERSION;

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
      // Null parse is not a repairable failure class.
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

  const diagnosticMeta = () => ({
    ...args.meta,
    primaryPromptVersion,
    repairPromptVersion: lastRepairPromptVersion,
    repairMaxAttempts: repairPolicy.maxAttempts,
    repairPromptModule: repairPolicy.repairPromptModule,
  });

  try {
    let value = await runOnce(args.instructions, args.input);
    lastValue = value;
    let issues = args.validate?.(value) ?? [];
    lastIssues = issues;
    validationIssueCount = issues.length;
    const canRepairValidation = isRepairableFailure(
      repairPolicy,
      "validation_issues",
    );

    while (
      issues.length &&
      canRepairValidation &&
      repairAttempts < repairPolicy.maxAttempts
    ) {
      const repair = buildRepairPrompt({
        schemaName: args.schemaName,
        validationErrors: issues,
        previousOutput: value,
        anchors: args.anchors,
      });
      lastRepairPromptVersion = repair.promptVersion;
      value = await runOnce(repair.instructions, repair.input);
      lastValue = value;
      repaired = true;
      repairAttempts += 1;
      issues = args.validate?.(value) ?? [];
      lastIssues = issues;
      validationIssueCount = issues.length;
    }

    if (issues.length) {
      const diagnostics =
        lastValue != null
          ? args.validationDiagnostics?.(lastValue, issues) ?? {}
          : {};
      recordTrace({
        operationId: args.operation,
        model,
        promptVersion: primaryPromptVersion,
        inputSchemaVersion: args.inputSchemaVersion ?? CONTRACT_SCHEMA_VERSION,
        outputSchemaVersion: args.outputSchemaVersion ?? CONTRACT_SCHEMA_VERSION,
        input: inputFingerprint,
        output: {
          validationIssues: issues.length,
          issues,
          repairAttempts,
          primaryPromptVersion,
          repairPromptVersion: lastRepairPromptVersion,
          ...diagnostics,
        },
        startedAt,
        status: "validation_failed",
        repaired,
        validationIssueCount,
        repairAttempts,
        finalValidation: "failed",
        charBudgetUsed: args.charBudgetUsed,
        truncationWarningCount: args.truncationWarningCount,
        errorCode: "MODEL_OUTPUT_INVALID",
        projectId: args.projectId,
        meta: diagnosticMeta(),
      });
      throw Object.assign(
        new Error(`Structured output failed validation: ${issues.join("; ")}`),
        { code: "MODEL_OUTPUT_INVALID" as const },
      );
    }

    recordTrace({
      operationId: args.operation,
      model,
      promptVersion: primaryPromptVersion,
      inputSchemaVersion: args.inputSchemaVersion ?? CONTRACT_SCHEMA_VERSION,
      outputSchemaVersion: args.outputSchemaVersion ?? CONTRACT_SCHEMA_VERSION,
      input: inputFingerprint,
      output: {
        schemaName: args.schemaName,
        repairAttempts,
        primaryPromptVersion,
        repairPromptVersion: lastRepairPromptVersion,
      },
      startedAt,
      status: repaired ? "repaired" : "ok",
      repaired,
      validationIssueCount,
      repairAttempts,
      finalValidation: "passed",
      charBudgetUsed: args.charBudgetUsed,
      truncationWarningCount: args.truncationWarningCount,
      projectId: args.projectId,
      meta: diagnosticMeta(),
    });

    safeLog("openai.structured.ok", {
      operation: args.operation,
      model,
      latencyMs: Date.now() - started,
      repaired,
      repairAttempts,
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
        promptVersion: primaryPromptVersion,
        inputSchemaVersion: args.inputSchemaVersion ?? CONTRACT_SCHEMA_VERSION,
        outputSchemaVersion: args.outputSchemaVersion ?? CONTRACT_SCHEMA_VERSION,
        input: inputFingerprint,
        startedAt,
        status: "error",
        repaired,
        validationIssueCount,
        repairAttempts,
        finalValidation: "n/a",
        charBudgetUsed: args.charBudgetUsed,
        truncationWarningCount: args.truncationWarningCount,
        errorCode: code,
        projectId: args.projectId,
        meta: diagnosticMeta(),
      });
    } else if (lastIssues.length) {
      safeLog("openai.structured.validation_failed", {
        operation: args.operation,
        model,
        latencyMs: Date.now() - started,
        issueCount: lastIssues.length,
        issues: lastIssues.join("; ").slice(0, 2000),
        repairAttempts,
        primaryPromptVersion,
        repairPromptVersion: lastRepairPromptVersion,
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
