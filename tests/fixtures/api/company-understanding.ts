import type {
  ClassifiedField,
  CompanyUnderstanding,
} from "@/features/research-prompt-builder/schemas";

function field(
  value: string,
  classification: ClassifiedField["classification"] = "observed_fact",
  confidence: ClassifiedField["confidence"] = "high",
): ClassifiedField {
  return {
    value,
    classification,
    confidence,
    evidence: [
      { ref: "row:2", explanation: "Stated directly in the company CSV export." },
    ],
  };
}

export function makeCompanyUnderstanding(
  overrides: Partial<CompanyUnderstanding> = {},
): CompanyUnderstanding {
  return {
    companyName: field("ZYNAVA"),
    industry: field("Dietary supplements / AI-powered search and price comparison"),
    offer: field(
      "Free tools to search and compare supplements by ingredient, form, dietary needs, and budget; build a personalized plan; and ask non-medical educational questions via an AI advisor",
    ),
    customerProblem: field(
      "The supplement market offers more options than ever, yet shoppers often feel more confused amid conflicting claims and aggressive marketing",
    ),
    likelyAudience: field(
      "US adult shoppers researching supplements, including newcomers seeking clarity and experienced buyers comparing preferred forms and prices",
      "working_assumption",
      "medium",
    ),
    websiteAction: field(
      "Start Saving, Explore Options, or Get Started to search, compare prices, build a plan, or ask the Supplement Advisor",
    ),
    geography: field("United States online (Tampa, FL business address)"),
    differentiators: [
      field(
        "Independent search and comparison — ranking within results is never paid; affiliate commissions do not affect placement",
      ),
      field(
        "Form-aware education that compares ingredient forms such as glycinate vs oxide and D3 vs D2",
        "working_assumption",
        "medium",
      ),
    ],
    expertiseSignals: [
      field(
        "Evidence-informed guides with editorial and advisory oversight; sources include NIH ODS, PubMed, and NCCIH",
      ),
    ],
    claimsAndRestrictions: [
      field(
        "Educational guidance only — not medical advice; do not diagnose, treat, cure, or prevent disease; do not recommend dosages",
      ),
    ],
    confirmedFacts: [
      field("Does not sell, manufacture, or distribute supplements; routes to third-party retailers"),
    ],
    workingAssumptions: [
      field(
        "Shoppers stop for confusion and trust, not feature lists",
        "working_assumption",
        "medium",
      ),
    ],
    importantUnknowns: [
      field(
        "Which supplement categories produce the highest guided-comparison intent",
        "important_unknown",
        "low",
      ),
    ],
    ingestionSummary:
      "The CSV describes ZYNAVA, a United States online AI-powered supplement search and price-comparison platform with educational tools, a plan builder, and an AI advisor; it does not sell supplements and emphasizes form-aware, non-medical guidance.",
    ingestionWarnings: [],
    ...overrides,
  };
}
