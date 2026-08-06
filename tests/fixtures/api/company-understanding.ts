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
    companyName: field("Bluebird Plumbing Co."),
    industry: field("Residential plumbing services"),
    offer: field("Emergency and scheduled plumbing repair for homeowners"),
    customerProblem: field(
      "Homeowners face urgent leaks and outdated fixtures with no trusted local plumber",
    ),
    likelyAudience: field(
      "Homeowners aged 30-65 in the Austin metro area",
      "working_assumption",
      "medium",
    ),
    websiteAction: field("Call or book an appointment online"),
    geography: field("Austin, Texas metro area"),
    differentiators: [
      field("Licensed master plumbers on every job"),
      field("Flat-rate pricing published upfront", "working_assumption", "medium"),
    ],
    expertiseSignals: [field("22 years in business with 4.9-star average review score")],
    claimsAndRestrictions: [
      field("Cannot claim to be the cheapest provider in the market"),
    ],
    confirmedFacts: [field("Serves the Austin metro area only")],
    workingAssumptions: [
      field(
        "Most demand comes from emergency calls rather than planned remodels",
        "working_assumption",
        "medium",
      ),
    ],
    importantUnknowns: [
      field(
        "Which customer segment produces the highest lifetime value",
        "important_unknown",
        "low",
      ),
    ],
    ingestionSummary:
      "The CSV describes Bluebird Plumbing Co., a residential plumbing company serving the Austin metro area, offering emergency and scheduled repair with licensed master plumbers and flat-rate pricing.",
    ingestionWarnings: [],
    ...overrides,
  };
}
