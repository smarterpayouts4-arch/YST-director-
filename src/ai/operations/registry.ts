import type { AiOperationDefinition } from "@/ai/operations/types";

/**
 * Single declare-site for valid operations.
 * AiOperationId is derived from these keys — do not maintain a parallel union.
 */
export const operationRegistry = {
  "analyze-company": {
    displayName: "Analyze company CSV",
    description: "Convert a bounded evidence packet into classified company understanding.",
    visibility: "public",
    inputContracts: ["evidence-packet"],
    outputContracts: ["company-understanding"],
    promptModule: "company-analyst",
    promptModulePath:
      "src/features/research-prompt-builder/prompts/company-analyst.ts",
    contextAssembler: "assemble-company-analysis-context",
    schemaName: "company_understanding",
    evalPath: "tests/evals/company-analyst-contract.test.ts",
    retryable: true,
    failureStates: ["INGESTION_FAILED", "MODEL_OUTPUT_INVALID"],
  },
  "generate-next-question": {
    displayName: "Generate next interview question",
    description: "Ask one material owner decision or signal interview completion.",
    visibility: "public",
    inputContracts: ["confirmed-profile", "interview-question", "interview-answer"],
    outputContracts: ["interview-question"],
    promptModule: "next-question",
    promptModulePath:
      "src/features/research-prompt-builder/prompts/next-question.ts",
    contextAssembler: "assemble-interview-context",
    schemaName: "next_interview_question",
    evalPath: "tests/evals/next-question-contract.test.ts",
    retryable: true,
    failureStates: ["MODEL_OUTPUT_INVALID"],
  },
  "extract-supporting-context": {
    displayName: "Extract supporting document context",
    description: "Pull facts, assumptions, and restrictions from an attached document.",
    visibility: "public",
    inputContracts: ["interview-question"],
    outputContracts: ["supporting-context"],
    promptModule: "supporting-context",
    promptModulePath:
      "src/features/research-prompt-builder/prompts/supporting-context.ts",
    contextAssembler: "none",
    schemaName: "supporting_context",
    evalPath: "tests/evals/supporting-context-contract.test.ts",
    retryable: true,
    failureStates: ["DOCUMENT_EXTRACTION_FAILED", "MODEL_OUTPUT_INVALID"],
  },
  "build-research-brief": {
    displayName: "Build research brief",
    description: "Compile an owner-approvable research brief from confirmed answers.",
    visibility: "public",
    inputContracts: ["confirmed-profile", "interview-question", "interview-answer"],
    outputContracts: ["research-brief"],
    promptModule: "research-brief",
    promptModulePath:
      "src/features/research-prompt-builder/prompts/research-brief.ts",
    contextAssembler: "assemble-brief-context",
    schemaName: "research_brief",
    evalPath: "tests/evals/research-brief-contract.test.ts",
    retryable: true,
    failureStates: ["MODEL_OUTPUT_INVALID"],
  },
  "compile-research-prompt": {
    displayName: "Compile research prompt",
    description: "Compile typed Prompt IR and validate the formatted Markdown contract.",
    visibility: "public",
    inputContracts: ["confirmed-profile", "research-brief"],
    outputContracts: ["final-research-prompt"],
    promptModule: "research-prompt",
    promptModulePath:
      "src/features/research-prompt-builder/prompts/research-prompt.ts",
    contextAssembler: "assemble-prompt-context",
    schemaName: "final_research_prompt",
    evalPath: "tests/evals/prompt-contract.eval.test.ts",
    retryable: true,
    failureStates: ["MODEL_OUTPUT_INVALID", "PROMPT_VALIDATION_FAILED"],
  },
  "extract-content-intelligence": {
    displayName: "Extract content intelligence",
    description:
      "Extract governed intelligence items from completed external research for Librarian review.",
    visibility: "public",
    inputContracts: ["content-intelligence-extract"],
    outputContracts: ["content-intelligence-extract"],
    promptModule: "extract-content-intelligence",
    promptModulePath:
      "src/features/content-intelligence/library/prompts/extract-content-intelligence.ts",
    contextAssembler: "none",
    schemaName: "content_intelligence_extract",
    evalPath: "tests/evals/content-intelligence-contract.test.ts",
    retryable: true,
    failureStates: ["MODEL_OUTPUT_INVALID", "INGESTION_FAILED"],
  },
  "propose-topic-directions": {
    displayName: "Propose topic directions",
    description:
      "Propose up to 3 strategic content directions from PublishedLibraryDto for Topic Engine.",
    visibility: "public",
    inputContracts: ["published-library"],
    outputContracts: ["topic-directions"],
    promptModule: "propose-directions",
    promptModulePath:
      "src/features/content-intelligence/topics/prompts/propose-directions.ts",
    contextAssembler: "none",
    schemaName: "topic_directions",
    evalPath: "tests/evals/propose-directions-contract.test.ts",
    retryable: true,
    failureStates: ["MODEL_OUTPUT_INVALID"],
  },
  "propose-topic-opportunities": {
    displayName: "Propose topic opportunities",
    description:
      "Propose exactly 6 grounded topic opportunities inside a selected direction.",
    visibility: "public",
    inputContracts: ["published-library", "topic-directions"],
    outputContracts: ["topic-opportunities"],
    promptModule: "propose-topics",
    promptModulePath:
      "src/features/content-intelligence/topics/prompts/propose-topics.ts",
    contextAssembler: "none",
    schemaName: "topic_opportunities",
    evalPath: "tests/evals/propose-topics-contract.test.ts",
    retryable: true,
    failureStates: ["MODEL_OUTPUT_INVALID"],
  },
  "repair-invalid-output": {
    displayName: "Repair invalid model output",
    description:
      "Nested repair helper used inside parseStructuredOutput under the parent operation — not a public product route.",
    visibility: "nested",
    inputContracts: [],
    outputContracts: [],
    promptModule: "repair-output",
    promptModulePath:
      "src/features/research-prompt-builder/prompts/repair-output.ts",
    contextAssembler: "none",
    schemaName: null,
    evalPath: "tests/evals/repair-output-contract.test.ts",
    retryable: false,
    failureStates: ["MODEL_OUTPUT_INVALID", "PROMPT_VALIDATION_FAILED"],
  },
} as const satisfies Record<string, AiOperationDefinition>;

/** Derived from operationRegistry keys — the only enumeration of valid operations. */
export type AiOperationId = keyof typeof operationRegistry;

export type RegisteredOperation = (typeof operationRegistry)[AiOperationId] & {
  operationId: AiOperationId;
};

export function getOperation(operationId: AiOperationId): RegisteredOperation {
  return { operationId, ...operationRegistry[operationId] };
}

export function listOperations(): RegisteredOperation[] {
  return (Object.keys(operationRegistry) as AiOperationId[]).map(getOperation);
}

export function listPublicOperations(): RegisteredOperation[] {
  return listOperations().filter((op) => op.visibility === "public");
}

/** Operation ids allowed on AiTrace.operationId (public + nested). */
export function isRegisteredOperationId(
  operationId: string,
): operationId is AiOperationId {
  return Object.prototype.hasOwnProperty.call(operationRegistry, operationId);
}
