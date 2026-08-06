import type { AiOperationDefinition, AiOperationId } from "@/ai/operations/types";

export const operationRegistry: Record<AiOperationId, AiOperationDefinition> = {
  "analyze-company": {
    operationId: "analyze-company",
    displayName: "Analyze company CSV",
    description: "Convert a bounded evidence packet into classified company understanding.",
    inputContracts: ["evidence-packet"],
    outputContracts: ["company-understanding"],
    promptModule: "company-analyst",
    contextAssembler: "assemble-company-analysis-context",
    retryable: true,
    failureStates: ["INGESTION_FAILED", "MODEL_OUTPUT_INVALID"],
  },
  "generate-next-question": {
    operationId: "generate-next-question",
    displayName: "Generate next interview question",
    description: "Ask one material owner decision or signal interview completion.",
    inputContracts: ["confirmed-profile", "interview-question", "interview-answer"],
    outputContracts: ["interview-question"],
    promptModule: "next-question",
    contextAssembler: "assemble-interview-context",
    retryable: true,
    failureStates: ["MODEL_OUTPUT_INVALID"],
  },
  "extract-supporting-context": {
    operationId: "extract-supporting-context",
    displayName: "Extract supporting document context",
    description: "Pull facts, assumptions, and restrictions from an attached document.",
    inputContracts: ["interview-question"],
    outputContracts: ["supporting-context"],
    promptModule: "supporting-context",
    contextAssembler: "none",
    retryable: true,
    failureStates: ["DOCUMENT_EXTRACTION_FAILED", "MODEL_OUTPUT_INVALID"],
  },
  "build-research-brief": {
    operationId: "build-research-brief",
    displayName: "Build research brief",
    description: "Compile an owner-approvable research brief from confirmed answers.",
    inputContracts: ["confirmed-profile", "interview-question", "interview-answer"],
    outputContracts: ["research-brief"],
    promptModule: "research-brief",
    contextAssembler: "assemble-brief-context",
    retryable: true,
    failureStates: ["MODEL_OUTPUT_INVALID"],
  },
  "compile-research-prompt": {
    operationId: "compile-research-prompt",
    displayName: "Compile research prompt",
    description: "Compile typed Prompt IR and validate the formatted Markdown contract.",
    inputContracts: ["confirmed-profile", "research-brief"],
    outputContracts: ["final-research-prompt"],
    promptModule: "research-prompt",
    contextAssembler: "assemble-prompt-context",
    retryable: true,
    failureStates: ["MODEL_OUTPUT_INVALID", "PROMPT_VALIDATION_FAILED"],
  },
  "repair-invalid-output": {
    operationId: "repair-invalid-output",
    displayName: "Repair invalid model output",
    description: "Re-ask the model to fix schema/validation failures for a prior operation.",
    inputContracts: [],
    outputContracts: [],
    promptModule: "repair-output",
    contextAssembler: "none",
    retryable: false,
    failureStates: ["MODEL_OUTPUT_INVALID", "PROMPT_VALIDATION_FAILED"],
  },
};

export function getOperation(operationId: AiOperationId): AiOperationDefinition {
  return operationRegistry[operationId];
}

export function listOperations(): AiOperationDefinition[] {
  return Object.values(operationRegistry);
}
