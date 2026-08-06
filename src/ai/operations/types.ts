import type { ContractId } from "@/ai/contracts/types";

export type AiOperationId =
  | "analyze-company"
  | "generate-next-question"
  | "extract-supporting-context"
  | "build-research-brief"
  | "compile-research-prompt"
  | "repair-invalid-output";

export type AiOperationDefinition = {
  operationId: AiOperationId;
  displayName: string;
  description: string;
  inputContracts: ContractId[];
  outputContracts: ContractId[];
  promptModule:
    | "company-analyst"
    | "next-question"
    | "supporting-context"
    | "research-brief"
    | "research-prompt"
    | "repair-output";
  contextAssembler:
    | "assemble-company-analysis-context"
    | "assemble-interview-context"
    | "assemble-brief-context"
    | "assemble-prompt-context"
    | "none";
  retryable: boolean;
  failureStates: Array<
    | "INGESTION_FAILED"
    | "MODEL_OUTPUT_INVALID"
    | "DOCUMENT_EXTRACTION_FAILED"
    | "PROMPT_VALIDATION_FAILED"
  >;
};
