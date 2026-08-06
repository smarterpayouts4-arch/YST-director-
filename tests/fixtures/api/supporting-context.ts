import type { SupportingContext } from "@/features/research-prompt-builder/schemas";

export function makeSupportingContext(
  overrides: Partial<SupportingContext> = {},
): SupportingContext {
  return {
    documentId: "doc-1",
    fileName: "service-area-notes.pdf",
    documentType: "pdf",
    relevantFacts: ["The company completed 1,214 emergency jobs last year."],
    ownerStatements: ["We answer emergency calls within 15 minutes, day or night."],
    assumptions: ["Emergency volume is assumed to peak in winter."],
    contradictions: [],
    risksOrRestrictions: ["Cannot claim to be the cheapest provider."],
    suggestedAnswerAdditions: [
      "Mention the 15-minute emergency response commitment.",
    ],
    warnings: [],
    ...overrides,
  };
}
