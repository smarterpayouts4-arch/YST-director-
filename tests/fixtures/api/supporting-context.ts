import type { SupportingContext } from "@/features/research-prompt-builder/schemas";

export function makeSupportingContext(
  overrides: Partial<SupportingContext> = {},
): SupportingContext {
  return {
    documentId: "doc-1",
    fileName: "zynava-trust-boundaries.pdf",
    documentType: "pdf",
    relevantFacts: [
      "ZYNAVA does not sell, manufacture, or distribute supplements.",
      "Guidance is educational only and cites public sources such as NIH ODS.",
    ],
    ownerStatements: [
      "We want content to decode form comparisons without telling anyone what to take.",
    ],
    assumptions: [
      "Form comparison is a common pre-purchase confusion point for US shoppers.",
    ],
    contradictions: [],
    risksOrRestrictions: [
      "Cannot diagnose, treat, cure, or prevent disease; cannot recommend dosages.",
    ],
    suggestedAnswerAdditions: [
      "Mention that education stops before medical recommendation.",
    ],
    warnings: [],
    ...overrides,
  };
}
