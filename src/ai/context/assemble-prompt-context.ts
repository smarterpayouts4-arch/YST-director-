import type {
  ConfirmedCompanyProfile,
  ResearchBrief,
} from "@/features/research-prompt-builder/schemas";
import { getContractSchemaVersion } from "@/ai/contracts/registry";
import {
  CONTEXT_BUDGETS,
  measureJsonChars,
  truncateString,
} from "@/ai/context/budgets";
import { redactDeep } from "@/ai/context/redact";

export type PromptContextPacket = {
  operationId: "compile-research-prompt";
  contractIds: Array<"confirmed-profile" | "research-brief">;
  schemaVersions: Record<string, string>;
  packet: {
    researchBrief: ResearchBrief;
    confirmedDecisions: Array<{
      key: string;
      value: string;
      status: string;
      classification: string;
    }>;
    restrictions: string[];
    metadataHints: {
      model: string;
      promptVersion: string;
      companyProfileVersion: string;
      researchBriefVersion: string;
      generatedAt: string;
    };
  };
  provenanceNotes: string[];
  truncationWarnings: string[];
  charCount: number;
};

export function assemblePromptContext(input: {
  confirmedProfile: ConfirmedCompanyProfile;
  researchBrief: ResearchBrief;
  model: string;
  promptVersion: string;
  companyProfileVersion: string;
}): PromptContextPacket {
  const truncationWarnings: string[] = [];
  const provenanceNotes = [
    "Source: approved research brief + confirmed decisions only (no raw CSV).",
    `profileVersion=${input.companyProfileVersion}`,
  ];

  const confirmedDecisions = Object.entries(input.confirmedProfile.fields)
    .filter(([, field]) => field.status === "confirmed" || field.status === "corrected")
    .slice(0, CONTEXT_BUDGETS.profileFieldsMax)
    .map(([key, field]) => ({
      key,
      value: truncateString(field.value, 400).value,
      status: field.status,
      classification: field.originalClassification,
    }));

  const restrictions = [
    ...input.researchBrief.trustBoundaries,
    ...Object.entries(input.confirmedProfile.fields)
      .filter(
        ([key, field]) =>
          /restrict|claim|regulat|compliance|disclaimer/i.test(key) ||
          /restrict|cannot|must not|prohibited/i.test(field.value),
      )
      .map(([, field]) => field.value),
  ]
    .slice(0, 30)
    .map((item) => truncateString(item, 400).value);

  let researchBrief = input.researchBrief;
  const packetBase = {
    researchBrief,
    confirmedDecisions,
    restrictions,
    metadataHints: {
      model: input.model,
      promptVersion: input.promptVersion,
      companyProfileVersion: input.companyProfileVersion,
      researchBriefVersion: "1.0.0",
      generatedAt: new Date().toISOString(),
    },
  };

  if (measureJsonChars(packetBase) > CONTEXT_BUDGETS.promptChars) {
    truncationWarnings.push("Trimmed evidenceSummary for prompt-compiler budget.");
    researchBrief = {
      ...researchBrief,
      evidenceSummary: researchBrief.evidenceSummary.slice(0, 20),
      executionContext: researchBrief.executionContext.slice(0, 12),
      unresolvedUnknowns: researchBrief.unresolvedUnknowns.slice(0, 8),
    };
  }

  const packet = {
    ...packetBase,
    researchBrief,
  };

  const redacted = redactDeep(packet);
  return {
    operationId: "compile-research-prompt",
    contractIds: ["confirmed-profile", "research-brief"],
    schemaVersions: {
      "confirmed-profile": getContractSchemaVersion("confirmed-profile"),
      "research-brief": getContractSchemaVersion("research-brief"),
    },
    packet: redacted.value,
    provenanceNotes: [
      ...provenanceNotes,
      ...redacted.redactions.map((r) => `redacted:${r}`),
    ],
    truncationWarnings: [...new Set(truncationWarnings)],
    charCount: measureJsonChars(redacted.value),
  };
}
