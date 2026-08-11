import type { FinalResearchPrompt } from "@/features/research-prompt-builder/schemas";

/**
 * Schema-valid AND prompt-contract-valid fixture: formatting this through
 * formatResearchPrompt must pass lintPromptContract with zero issues.
 * Control paragraphs are company-instantiated so anchored lint also passes
 * when ZYNAVA anchors are supplied.
 */
export function makeFinalPrompt(
  overrides: Partial<FinalResearchPrompt> = {},
): FinalResearchPrompt {
  return {
    title: "ZYNAVA US Supplement-Comparison Content Market Research Prompt",
    roleAndExpertise:
      "You are a senior US consumer-health market researcher, search-intent analyst, platform strategist, and compliance-aware content strategist. You produce evidence-labeled strategy reports for educational supplement-comparison products without giving medical advice.",
    companyContext:
      "ZYNAVA is a United States online AI-powered supplement search and price-comparison experience. It helps adult shoppers who are overwhelmed by conflicting supplement claims compare forms and relevant label details through education, guided comparison, a plan builder, and an AI advisor. It does not sell, manufacture, or distribute supplements; it routes shoppers to third-party retailers. Differentiator: independent ranking that is never paid, plus form-aware education such as glycinate vs oxide and D3 vs D2.",
    ownerConfirmedDecisions:
      "Owner-confirmed decisions: (1) Geography is United States online. (2) Primary customer moment is pre-purchase form and label comparison within a chosen supplement category. (3) Trust boundary: educational guidance only — never diagnose, treat, cure, prevent disease, or recommend dosages.",
    workingHypotheses:
      "Working hypotheses (not facts): shoppers stop for confusion and trust rather than feature lists; form-decoding education will out-perform generic wellness tips; YouTube is the primary platform hypothesis pending demand evidence.",
    researchQuestions:
      "Answer with labeled evidence: (1) What form- and label-comparison searches do US supplement shoppers perform, and at what volume (demand evidence)? Capture customer language and exact phrases shoppers use. (2) Which competitors and substitute alternatives publish content or tools for this audience — classify each as direct, adjacent, aspirational, or substitute. (3) What category conventions dominate wellness education, and where do content gaps versus business opportunities appear? (4) For each owner-selected strategic hypothesis, gather supporting evidence and disconfirming evidence, then give a pursue/reject/modify verdict. (5) What viewer reward keeps a confused shopper learning without medical promises?",
    evidenceAndRedTeamRequirements: [
      "Label every claim as observed fact, owner-confirmed decision, working hypothesis, or research question.",
      "Hypothesis-blind discovery: before evaluating the supplied hypotheses, run a neutral scan of dietary supplements comparison demand, US adult shoppers researching supplements, and Tampa / United States online market behavior, competitor positioning, and recurring form-label decision problems. Do not give supplied hypotheses preferential treatment.",
      "Quotation discipline for US adult shoppers at the form and label comparison moment: present language as a direct customer quote only when the exact words are present in a cited source; otherwise label it as a paraphrased language pattern. Never manufacture representative customer quotations.",
      "Evidence hierarchy for dietary supplements and AI-powered search / price-comparison offers: do not allow many weak commercial sources to outweigh one strong primary or authoritative source. Evidence quantity is not evidence quality. When sources disagree, explain the disagreement rather than averaging them.",
      "Demand triangulation for supplement form confusion and AI-powered comparison intent: treat demand as multi-signal evidence. Look for convergence among search behavior, recurring questions, marketplace behavior, survey/research evidence, competitor investment, community discussion, and commercial intent. A content gap alone is not demand. Search volume alone is not business opportunity.",
      "Red-team each selected strategic hypothesis: find supporting evidence and disconfirming evidence, then issue a pursue/reject/modify verdict. Cite sources and named sources for demand evidence and material claims. Classify every competitor found as direct, adjacent, aspirational, or substitute with reasoning. Separate content gaps from genuine business opportunities.",
    ].join(" "),
    requiredReportStructure: [
      "The report must contain: (1) Executive summary. (2) Demand evidence and customer language for the customer moment and audience. (3) Category conventions and content gaps versus business opportunities. (4) Competitor landscape with direct/adjacent/aspirational/substitute classification. (5) Per-hypothesis investigation with supporting evidence, disconfirming evidence, and pursue/reject/modify verdict.",
      "For every major conclusion about form decoding education, guided comparison intent, supplement category confusion, or conflicting claims at the label comparisons moment, assign High / Medium / Low confidence and state what additional evidence would most likely change the conclusion.",
      "Report up to 3–5 material surprising findings that contradict, complicate, or substantially expand the supplied assumptions (including hypothesis:contentHypothesis and hypothesis:challengeHypothesis about form decoding education and independent comparison tool risks). Do not manufacture surprising findings to satisfy a quota. If fewer than three are genuinely supported, report fewer and explain why. Each finding must name which supplied assumption id it affects.",
      "(6) One primary platform recommendation with rationale. (7) 3 content pillars, each with 2 experiments (6 experiments total). Treat each experiment as a selectable evidence-backed content opportunity: name the topic, the audience moment, the tension or unmet need (without inferring severity beyond the evidence), a planted question distinct from the topic, the viewer reward describing what the audience gains, the evidence basis distinguishing observed evidence from hypothesis, confidence, restrictions, a commercial bridge after value or none warranted, then success criteria and failure criteria. Six experiments does not imply six distinct customer problems — vary moment, planted question, or viewer reward when evidence supports fewer tensions. Do not require a second duplicative per-experiment CTA field. (8) One report-level CTA hypothesis derived from the research (linking viewer value to guided comparison or advisor use when warranted, or none/weak when unsupported). (9) Open unknowns that require owner input. Keep all restrictions: never position ZYNAVA as medical advice or an individual product recommender.",
    ].join(" "),
    qualityCheckBeforeSubmission:
      "Before submitting, verify: every claim is labeled by evidence type and citations are present; every competitor is classified including substitutes; customer language and category conventions are covered; each selected hypothesis has a pursue/reject/modify verdict; each of the 3 content pillars has 2 opportunity-shaped experiments with success criteria and failure criteria; the single primary platform is justified; the report-level CTA hypothesis is present or none/weak when unsupported. Return the completed research output only; do not propose additional workflows.",
    metadata: {
      promptVersion: "1.1.0",
      companyProfileVersion: "profile-v1",
      researchBriefVersion: "1.0.0",
      generatedAt: "2026-08-05T12:00:00.000Z",
      model: "gpt-5.6-terra",
    },
    ...overrides,
  };
}

/**
 * Mirrors formatResearchPrompt without importing application runtime code, so
 * Playwright mocks stay free of app internals. fixtures.schema.test.ts asserts
 * byte-equality with the real formatter to prevent drift.
 */
export function makeFormattedPrompt(prompt = makeFinalPrompt()): string {
  return [
    `# ${prompt.title}`,
    "",
    "## 1. ROLE AND EXPERTISE",
    prompt.roleAndExpertise,
    "",
    "## 2. COMPANY CONTEXT",
    prompt.companyContext,
    "",
    "## 3. OWNER-CONFIRMED DECISIONS",
    prompt.ownerConfirmedDecisions,
    "",
    "## 4. WORKING HYPOTHESES",
    prompt.workingHypotheses,
    "",
    "## 5. RESEARCH QUESTIONS",
    prompt.researchQuestions,
    "",
    "## 6. EVIDENCE AND RED-TEAM REQUIREMENTS",
    prompt.evidenceAndRedTeamRequirements,
    "",
    "## 7. REQUIRED REPORT STRUCTURE",
    prompt.requiredReportStructure,
    "",
    "## 8. QUALITY CHECK BEFORE SUBMISSION",
    prompt.qualityCheckBeforeSubmission,
    "",
  ].join("\n");
}
