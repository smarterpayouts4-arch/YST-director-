import type { AiOperationId } from "@/ai/operations/types";

export type AiTraceStatus = "ok" | "validation_failed" | "error" | "repaired";

/**
 * Behavioral tuple versions for an AI call.
 * Never store raw secrets, API keys, or full untrusted CSV dumps here.
 */
export type AiTrace = {
  traceId: string;
  projectId?: string;
  operationId: AiOperationId | string;
  model: string;
  promptVersion: string;
  inputSchemaVersion: string;
  outputSchemaVersion: string;
  inputHash: string;
  outputHash?: string;
  startedAt: string;
  endedAt: string;
  latencyMs: number;
  status: AiTraceStatus;
  repaired: boolean;
  validationIssueCount: number;
  charBudgetUsed?: number;
  truncationWarningCount?: number;
  errorCode?: string;
  /** Safe metadata only — no prompt bodies or PII dumps. */
  meta?: Record<string, string | number | boolean | null>;
};

export type TraceRecordInput = {
  operationId: AiOperationId | string;
  model: string;
  promptVersion: string;
  inputSchemaVersion: string;
  outputSchemaVersion: string;
  input: unknown;
  output?: unknown;
  startedAt: string;
  status: AiTraceStatus;
  repaired?: boolean;
  validationIssueCount?: number;
  charBudgetUsed?: number;
  truncationWarningCount?: number;
  errorCode?: string;
  projectId?: string;
  meta?: Record<string, string | number | boolean | null>;
};
