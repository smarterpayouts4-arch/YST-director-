import type { z } from "zod";

export type ContractOwner =
  | "product-plane"
  | "ai-control-plane"
  | "engineering-intelligence-plane";

export type ContractProducer =
  | "ingestion"
  | "analyze-company"
  | "owner-confirmation"
  | "generate-next-question"
  | "interview-answer"
  | "build-research-brief"
  | "compile-research-prompt"
  | "extract-supporting-context"
  | "extract-content-intelligence"
  | "propose-topic-directions"
  | "propose-topic-opportunities";

export type ContractConsumer =
  | "analyze-company"
  | "generate-next-question"
  | "build-research-brief"
  | "compile-research-prompt"
  | "extract-supporting-context"
  | "extract-content-intelligence"
  | "propose-topic-directions"
  | "propose-topic-opportunities"
  | "ui-understanding-review"
  | "ui-interview"
  | "ui-brief-review"
  | "ui-prompt-export"
  | "ui-content-intelligence-review"
  | "ui-topic-engine"
  | "decision-ledger"
  | "context-compiler"
  | "prompt-contract-lint";

export type ContractId =
  | "evidence-packet"
  | "company-understanding"
  | "confirmed-profile"
  | "interview-question"
  | "interview-answer"
  | "supporting-context"
  | "research-brief"
  | "final-research-prompt"
  | "content-intelligence-extract"
  | "published-library"
  | "topic-directions"
  | "topic-opportunities";

export type ContractDefinition<TSchema extends z.ZodTypeAny = z.ZodTypeAny> = {
  contractId: ContractId;
  schemaVersion: string;
  owner: ContractOwner;
  producer: ContractProducer;
  consumers: ContractConsumer[];
  description: string;
  schema: TSchema;
};

export type ContractRegistry = Record<ContractId, ContractDefinition>;
