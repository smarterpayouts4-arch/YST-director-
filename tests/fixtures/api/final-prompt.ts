import type { FinalResearchPrompt } from "@/features/research-prompt-builder/schemas";

/**
 * Schema-valid AND prompt-contract-valid fixture: formatting this through
 * formatResearchPrompt must pass lintPromptContract with zero issues.
 */
export function makeFinalPrompt(
  overrides: Partial<FinalResearchPrompt> = {},
): FinalResearchPrompt {
  return {
    title: "Bluebird Plumbing Co. — YouTube Strategy Research Prompt",
    roleAndExpertise:
      "You are a senior market researcher specializing in local home-services businesses. You combine demand analysis, competitor intelligence, and audience research to produce evidence-labeled strategy reports for small business owners.",
    companyContext:
      "Bluebird Plumbing Co. is a licensed residential plumbing company serving the Austin, Texas metro area. It offers emergency and scheduled plumbing repair for homeowners, with licensed master plumbers on every job and flat-rate pricing published upfront. The company has 22 years in business and a 4.9-star average review score. The primary customer moment is a homeowner discovering an active leak or burst pipe and urgently searching for a trustworthy local plumber.",
    ownerConfirmedDecisions:
      "Owner-confirmed decisions: (1) Service area is the Austin metro only. (2) Target customer is homeowners aged 30-65 needing urgent repair. (3) Restriction: the company cannot claim to be the cheapest provider in the market.",
    workingHypotheses:
      "Working hypotheses (not facts): most demand comes from emergency calls rather than planned remodels; calm step-by-step emergency triage content will out-perform generic promos; YouTube is the primary platform hypothesis pending demand evidence.",
    researchQuestions:
      "Answer with labeled evidence: (1) What emergency plumbing searches do Austin homeowners perform, and at what volume? (2) Which competitors publish content for this audience — classify each competitor as direct, adjacent, or aspirational. (3) What viewer reward keeps a panicked homeowner watching? (4) Does content influence the emergency call decision at all, or do searchers convert on speed alone? Actively seek disconfirming evidence for each working hypothesis.",
    evidenceAndRedTeamRequirements:
      "Label every claim as observed fact, owner-confirmed decision, working hypothesis, or research question. Red-team the content hypothesis: find at least three pieces of evidence that could contradict it. Cite sources for demand evidence. Classify every competitor found as direct, adjacent, or aspirational with reasoning.",
    requiredReportStructure:
      "The report must contain: (1) Executive summary. (2) Demand evidence for the customer moment and audience. (3) Competitor landscape with direct/adjacent/aspirational classification. (4) One primary platform recommendation with rationale. (5) 3 content pillars, each with 2 experiments (6 experiments total), each experiment with success/failure criteria. (6) A CTA hypothesis linking viewer value to booked service calls. (7) Open unknowns that require owner input. Keep all restrictions: never position the company as the cheapest provider.",
    qualityCheckBeforeSubmission:
      "Before submitting, verify: every claim is labeled by evidence type; every competitor is classified; each of the 3 content pillars has 2 experiments with success/failure criteria; the single primary platform is justified; the CTA hypothesis is present. Return the completed research output only; do not propose additional workflows.",
    metadata: {
      promptVersion: "1.0.0",
      companyProfileVersion: "profile-v1",
      researchBriefVersion: "1.0.0",
      generatedAt: "2026-08-05T12:00:00.000Z",
      model: "gpt-5.6-terra",
    },
    ...overrides,
  };
}
