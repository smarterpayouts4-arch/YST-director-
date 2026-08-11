import type { AiSchemaName } from "@/ai/operations/schema-names";

/**
 * Per-schema repair policy — first-class, not buried gateway magic.
 *
 * Repair may make an output *conform* to schema/validation constraints.
 * Repair must not change the requested task (not semantic regeneration).
 * Null/schema parse failures and provider errors are intentionally not repairable.
 * No recursive repair-of-repair; same repair module each attempt.
 */
export type RepairableFailureClass = "validation_issues";

export type RepairPolicy = {
  maxAttempts: number;
  repairPromptModule: "repair-output";
  repairableFailures: readonly RepairableFailureClass[];
};

const DEFAULT_REPAIR_POLICY: RepairPolicy = {
  maxAttempts: 1,
  repairPromptModule: "repair-output",
  repairableFailures: ["validation_issues"],
};

const FINAL_PROMPT_REPAIR_POLICY: RepairPolicy = {
  maxAttempts: 2,
  repairPromptModule: "repair-output",
  repairableFailures: ["validation_issues"],
};

/** Chain: operation → schemaName → getRepairPolicy(schemaName). */
export function getRepairPolicy(schemaName: AiSchemaName): RepairPolicy {
  if (schemaName === "final_research_prompt") {
    return FINAL_PROMPT_REPAIR_POLICY;
  }
  return DEFAULT_REPAIR_POLICY;
}

export function isRepairableFailure(
  policy: RepairPolicy,
  failureClass: RepairableFailureClass,
): boolean {
  return policy.repairableFailures.includes(failureClass);
}
