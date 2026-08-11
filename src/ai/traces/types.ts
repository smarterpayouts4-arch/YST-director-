import type { AiOperationId } from "@/ai/operations/registry";

export type AiTraceStatus = "ok" | "validation_failed" | "error" | "repaired";

export type FinalValidation = "passed" | "failed" | "n/a";

/**
 * Behavioral tuple for an AI call.
 * Never store raw secrets, API keys, or full untrusted CSV dumps here.
 */
export type AiTrace = {
  traceId: string;
  projectId?: string;
  operationId: AiOperationId;
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
  /** Architecturally meaningful — not buried in meta. */
  repairAttempts?: number;
  finalValidation?: FinalValidation;
  charBudgetUsed?: number;
  truncationWarningCount?: number;
  errorCode?: string;
  /** Optional diagnostic leftovers only — not hidden architecture. */
  meta?: Record<string, string | number | boolean | null>;
};

export type TraceRecordInput = {
  operationId: AiOperationId;
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
  repairAttempts?: number;
  finalValidation?: FinalValidation;
  charBudgetUsed?: number;
  truncationWarningCount?: number;
  errorCode?: string;
  projectId?: string;
  meta?: Record<string, string | number | boolean | null>;
};
