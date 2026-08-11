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
import {
  buildDecisionLedger,
  decisionsByOrigin,
  summarizeDecisionLedger,
  type DecisionOrigin,
} from "@/features/research-prompt-builder/state/decision-ledger";

export type SuppliedAssumption = {
  id: string;
  text: string;
  origin: "model_hypothesis" | "owner_selected_hypothesis";
};

const HYPOTHESIS_FIELDS = [
  "contentHypothesis",
  "challengeHypothesis",
] as const;

export function buildSuppliedAssumptions(
  researchBrief: ResearchBrief,
): SuppliedAssumption[] {
  const out: SuppliedAssumption[] = [];
  for (const key of HYPOTHESIS_FIELDS) {
    const origin = researchBrief.fieldProvenance[key]?.origin;
    if (origin !== "model_hypothesis" && origin !== "owner_selected_hypothesis") {
      continue;
    }
    const text = researchBrief[key]?.trim();
    if (!text) continue;
    out.push({
      id: `hypothesis:${key}`,
      text: truncateString(text, 400).value,
      origin,
    });
  }
  return out;
}

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
    /** Deterministic targets for surprising-findings / red-team (stable ids). */
    suppliedAssumptions: SuppliedAssumption[];
    /** Derived provenance (rebuild-on-read; never persisted separately). */
    decisionProvenance: {
      profileVersion: string;
      counts: Record<DecisionOrigin, number>;
      records: Array<{
        decisionId: string;
        category: string;
        origin: DecisionOrigin;
        confidence: string;
      }>;
    };
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

  const ledger = buildDecisionLedger({
    confirmedProfile: input.confirmedProfile,
  });
  const ledgerSummary = summarizeDecisionLedger(ledger);
  provenanceNotes.push(
    `decisionLedger: ${ledgerSummary.total} records (restriction=${ledgerSummary.byOrigin.restriction})`,
  );
  const restrictions = [
    ...new Set([
      ...input.researchBrief.trustBoundaries,
      ...decisionsByOrigin(ledger, "restriction").map((record) => record.value),
    ]),
  ]
    .slice(0, 30)
    .map((item) => truncateString(item, 400).value);

  const suppliedAssumptions = buildSuppliedAssumptions(input.researchBrief);
  provenanceNotes.push(`suppliedAssumptions: ${suppliedAssumptions.length}`);

  let researchBrief = input.researchBrief;
  const packetBase = {
    researchBrief,
    confirmedDecisions,
    restrictions,
    suppliedAssumptions,
    decisionProvenance: {
      profileVersion: ledger.profileVersion,
      counts: ledgerSummary.byOrigin,
      records: ledger.records.slice(0, 40).map((record) => ({
        decisionId: record.decisionId,
        category: record.category,
        origin: record.origin,
        confidence: record.confidence,
      })),
    },
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
    suppliedAssumptions: buildSuppliedAssumptions(researchBrief),
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
