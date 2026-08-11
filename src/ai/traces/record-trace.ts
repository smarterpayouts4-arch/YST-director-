import { createHash, randomUUID } from "node:crypto";
import type { AiTrace, TraceRecordInput } from "@/ai/traces/types";

const MAX_MEMORY_TRACES = 200;
const memoryStore: AiTrace[] = [];

function stableHash(value: unknown): string {
  const json = JSON.stringify(value, (_key, v) => {
    if (typeof v === "string" && /(api[_-]?key|authorization|password|secret|sk-)/i.test(v)) {
      return "[REDACTED]";
    }
    return v;
  });
  return createHash("sha256").update(json ?? "null").digest("hex").slice(0, 16);
}

export function recordTrace(input: TraceRecordInput): AiTrace {
  const endedAt = new Date().toISOString();
  const startedMs = Date.parse(input.startedAt);
  const latencyMs = Number.isFinite(startedMs)
    ? Math.max(0, Date.now() - startedMs)
    : 0;

  const trace: AiTrace = {
    traceId: randomUUID(),
    projectId: input.projectId,
    operationId: input.operationId,
    model: input.model,
    promptVersion: input.promptVersion,
    inputSchemaVersion: input.inputSchemaVersion,
    outputSchemaVersion: input.outputSchemaVersion,
    inputHash: stableHash(input.input),
    outputHash: input.output === undefined ? undefined : stableHash(input.output),
    startedAt: input.startedAt,
    endedAt,
    latencyMs,
    status: input.status,
    repaired: input.repaired ?? false,
    validationIssueCount: input.validationIssueCount ?? 0,
    repairAttempts: input.repairAttempts,
    finalValidation: input.finalValidation,
    charBudgetUsed: input.charBudgetUsed,
    truncationWarningCount: input.truncationWarningCount,
    errorCode: input.errorCode,
    meta: input.meta,
  };

  memoryStore.push(trace);
  if (memoryStore.length > MAX_MEMORY_TRACES) {
    memoryStore.splice(0, memoryStore.length - MAX_MEMORY_TRACES);
  }

  return trace;
}

export function listRecentTraces(limit = 50): AiTrace[] {
  return memoryStore.slice(-limit);
}

export function clearTracesForTests(): void {
  memoryStore.length = 0;
}
