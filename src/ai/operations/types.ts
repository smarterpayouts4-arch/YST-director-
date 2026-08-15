import type { ContractId } from "@/ai/contracts/types";
import type { AiSchemaName } from "@/ai/operations/schema-names";

export type { AiSchemaName } from "@/ai/operations/schema-names";

/**
 * Relationship fields for one AI operation.
 * `operationId` is the registry key (see AiOperationId derived from operationRegistry).
 */
export type AiOperationDefinition = {
  displayName: string;
  description: string;
  /** public = product route; nested = internal helper (e.g. repair under parent op). */
  visibility: "public" | "nested";
  inputContracts: ContractId[];
  outputContracts: ContractId[];
  promptModule:
    | "company-analyst"
    | "next-question"
    | "supporting-context"
    | "research-brief"
    | "research-prompt"
    | "repair-output"
    | "extract-content-intelligence"
    | "propose-directions"
    | "propose-topics"
    | "generate-storyboard"
    | "expand-production";
  contextAssembler:
    | "assemble-company-analysis-context"
    | "assemble-interview-context"
    | "assemble-brief-context"
    | "assemble-prompt-context"
    | "none";
  /** Relative path from repo root for mechanical doctor checks. */
  promptModulePath: string;
  /**
   * OpenAI structured schema name for public ops.
   * Null for nested helpers that inherit the parent call's schema.
   */
  schemaName: AiSchemaName | null;
  /** Primary eval file path (public ops) or null for nested helpers. */
  evalPath: string | null;
  retryable: boolean;
  failureStates: Array<
    | "INGESTION_FAILED"
    | "MODEL_OUTPUT_INVALID"
    | "DOCUMENT_EXTRACTION_FAILED"
    | "PROMPT_VALIDATION_FAILED"
  >;
};
