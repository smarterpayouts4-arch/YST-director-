import {
  CompanyUnderstandingSchema,
  ConfirmedCompanyProfileSchema,
  CsvEvidencePacketSchema,
  FinalResearchPromptSchema,
  InterviewAnswerSchema,
  InterviewQuestionSchema,
  ResearchBriefSchema,
  SupportingContextSchema,
} from "@/features/research-prompt-builder/schemas";
import type { ContractDefinition, ContractId, ContractRegistry } from "@/ai/contracts/types";

export const CONTRACT_SCHEMA_VERSION = "1.0.0";

export const contractRegistry: ContractRegistry = {
  "evidence-packet": {
    contractId: "evidence-packet",
    schemaVersion: CONTRACT_SCHEMA_VERSION,
    owner: "ai-control-plane",
    producer: "ingestion",
    consumers: ["analyze-company", "context-compiler"],
    description: "Bounded CSV evidence packet with row refs and truncation warnings.",
    schema: CsvEvidencePacketSchema,
  },
  "company-understanding": {
    contractId: "company-understanding",
    schemaVersion: CONTRACT_SCHEMA_VERSION,
    owner: "ai-control-plane",
    producer: "analyze-company",
    consumers: ["ui-understanding-review", "context-compiler", "decision-ledger"],
    description: "Classified company understanding prior to owner confirmation.",
    schema: CompanyUnderstandingSchema,
  },
  "confirmed-profile": {
    contractId: "confirmed-profile",
    schemaVersion: CONTRACT_SCHEMA_VERSION,
    owner: "product-plane",
    producer: "owner-confirmation",
    consumers: [
      "generate-next-question",
      "build-research-brief",
      "compile-research-prompt",
      "decision-ledger",
      "context-compiler",
      "ui-interview",
    ],
    description: "Owner-confirmed company profile with field status provenance.",
    schema: ConfirmedCompanyProfileSchema,
  },
  "interview-question": {
    contractId: "interview-question",
    schemaVersion: CONTRACT_SCHEMA_VERSION,
    owner: "ai-control-plane",
    producer: "generate-next-question",
    consumers: ["ui-interview", "build-research-brief", "decision-ledger", "context-compiler"],
    description: "Single adaptive interview question with quality scores.",
    schema: InterviewQuestionSchema,
  },
  "interview-answer": {
    contractId: "interview-answer",
    schemaVersion: CONTRACT_SCHEMA_VERSION,
    owner: "product-plane",
    producer: "interview-answer",
    consumers: [
      "generate-next-question",
      "build-research-brief",
      "decision-ledger",
      "context-compiler",
    ],
    description: "Owner answer plus optional supporting document summaries.",
    schema: InterviewAnswerSchema,
  },
  "supporting-context": {
    contractId: "supporting-context",
    schemaVersion: CONTRACT_SCHEMA_VERSION,
    owner: "ai-control-plane",
    producer: "extract-supporting-context",
    consumers: ["ui-interview", "context-compiler"],
    description: "Extracted facts/assumptions/restrictions from a supporting document.",
    schema: SupportingContextSchema,
  },
  "research-brief": {
    contractId: "research-brief",
    schemaVersion: CONTRACT_SCHEMA_VERSION,
    owner: "ai-control-plane",
    producer: "build-research-brief",
    consumers: [
      "ui-brief-review",
      "compile-research-prompt",
      "context-compiler",
      "prompt-contract-lint",
    ],
    description: "Owner-approvable research brief used as prompt compiler input.",
    schema: ResearchBriefSchema,
  },
  "final-research-prompt": {
    contractId: "final-research-prompt",
    schemaVersion: CONTRACT_SCHEMA_VERSION,
    owner: "ai-control-plane",
    producer: "compile-research-prompt",
    consumers: ["ui-prompt-export", "prompt-contract-lint"],
    description: "Typed Prompt IR for the copy-ready ChatGPT research prompt.",
    schema: FinalResearchPromptSchema,
  },
};

export function getContract(contractId: ContractId): ContractDefinition {
  return contractRegistry[contractId];
}

export function listContracts(): ContractDefinition[] {
  return Object.values(contractRegistry);
}

export function getContractSchemaVersion(contractId: ContractId): string {
  return contractRegistry[contractId].schemaVersion;
}
