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
import { ContentIntelligenceExtractSchema } from "@/features/content-intelligence/library/schemas/extract-draft";
import { PublishedLibraryDtoSchema } from "@/features/content-intelligence/contracts/published-library";
import { TopicDirectionsDraftSchema } from "@/features/content-intelligence/topics/schemas/direction";
import { TopicOpportunitiesDraftSchema } from "@/features/content-intelligence/topics/schemas/topic-opportunity";
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
    // 1.1.0: raised §6/§7 max lengths; Prompt Contract 1.1 research controls.
    schemaVersion: "1.1.0",
    owner: "ai-control-plane",
    producer: "compile-research-prompt",
    consumers: ["ui-prompt-export", "prompt-contract-lint"],
    description: "Typed Prompt IR for the copy-ready ChatGPT research prompt.",
    schema: FinalResearchPromptSchema,
  },
  "content-intelligence-extract": {
    contractId: "content-intelligence-extract",
    schemaVersion: "1.0.0",
    owner: "ai-control-plane",
    producer: "extract-content-intelligence",
    consumers: ["extract-content-intelligence", "ui-content-intelligence-review"],
    description:
      "Structured Librarian extract draft from completed external research (pre-curation).",
    schema: ContentIntelligenceExtractSchema,
  },
  "published-library": {
    contractId: "published-library",
    schemaVersion: "1.0.0",
    owner: "product-plane",
    producer: "extract-content-intelligence",
    consumers: [
      "propose-topic-directions",
      "propose-topic-opportunities",
      "ui-topic-engine",
    ],
    description:
      "Accepted-only PublishedLibraryDto handoff from Librarian to Topic Engine (no raw research).",
    schema: PublishedLibraryDtoSchema,
  },
  "topic-directions": {
    contractId: "topic-directions",
    // 1.1.0: content-lane Directions + required decisionQuestion
    schemaVersion: "1.1.0",
    owner: "ai-control-plane",
    producer: "propose-topic-directions",
    consumers: ["propose-topic-opportunities", "ui-topic-engine"],
    description:
      "Draft content-lane directions (normally up to 3) from PublishedLibraryDto.",
    schema: TopicDirectionsDraftSchema,
  },
  "topic-opportunities": {
    contractId: "topic-opportunities",
    schemaVersion: "1.0.0",
    owner: "ai-control-plane",
    producer: "propose-topic-opportunities",
    consumers: ["ui-topic-engine"],
    description: "Exactly six grounded topic opportunities inside a selected direction.",
    schema: TopicOpportunitiesDraftSchema,
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
