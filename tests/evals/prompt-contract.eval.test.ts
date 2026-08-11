import { describe, expect, it } from "vitest";
import { lintPromptContract } from "@/features/research-prompt-builder/validation/prompt-contract";
import { formatResearchPrompt } from "@/features/research-prompt-builder/formatters/format-research-prompt";
import type { FinalResearchPrompt } from "@/features/research-prompt-builder/schemas";
import { supplementFixture } from "./fixtures/supplement";
import { restaurantFixture } from "./fixtures/restaurant";
import { contractorFixture } from "./fixtures/contractor";
import { professionalServiceFixture } from "./fixtures/professional-service";
import { ecommerceFixture } from "./fixtures/ecommerce";
import { b2bSoftwareFixture } from "./fixtures/b2b-software";

const fixtures = [
  supplementFixture,
  restaurantFixture,
  contractorFixture,
  professionalServiceFixture,
  ecommerceFixture,
  b2bSoftwareFixture,
];

/** Company-instantiated research-control paragraphs (phrase gates without anchors). */
function controlParagraphs(company: string, industry: string): {
  evidence: string;
  report: string;
} {
  return {
    evidence: [
      `Hypothesis-blind discovery: before evaluating the supplied hypotheses, run a neutral scan of ${industry} demand, ${company} audience language, search behavior, competitor positioning, and recurring decision problems. Do not give supplied hypotheses preferential treatment.`,
      `Quotation discipline for the ${company} ${industry} audience: present language as a direct customer quote only when the exact words are present in a cited source; otherwise label it as a paraphrased language pattern. Never manufacture representative customer quotations.`,
      `Evidence hierarchy for ${industry}: do not allow many weak commercial sources to outweigh one strong primary or authoritative source. Evidence quantity is not evidence quality. When sources disagree, explain the disagreement rather than averaging them.`,
      `Demand triangulation for ${company} in ${industry}: treat demand as multi-signal evidence. Look for convergence among search behavior, recurring questions, marketplace behavior, survey/research evidence, competitor investment, community discussion, and commercial intent. A content gap alone is not demand. Search volume alone is not business opportunity.`,
    ].join(" "),
    report: [
      `For every major conclusion about ${company} in ${industry}, assign High / Medium / Low confidence and state what additional evidence would most likely change the conclusion.`,
      `Report up to 3–5 material surprising findings that contradict, complicate, or substantially expand the supplied assumptions (name each affected supplied assumption id such as hypothesis:contentHypothesis). Do not manufacture surprising findings to satisfy a quota. If fewer than three are genuinely supported, report fewer and explain why.`,
    ].join(" "),
  };
}

function makePrompt(
  company: string,
  extras: string,
  industryClauses: string[] = [],
  industry = "general market",
): FinalResearchPrompt {
  const industryLine = industryClauses.length
    ? ` Industry cues: ${industryClauses.join("; ")}.`
    : "";
  const controls = controlParagraphs(company, industry);
  return {
    title: `${company} Market Research Prompt`,
    roleAndExpertise:
      "Act as a senior audience strategist, market researcher, competitive analyst, and educational marketing director with deep industry judgment.".padEnd(
        120,
        " ",
      ),
    companyContext: `${company} helps a specific audience solve a concrete problem. ${extras}${industryLine}`.padEnd(
      220,
      " ",
    ),
    ownerConfirmedDecisions:
      "Owner confirmed the primary customer moment, trust boundaries, and business bridge.".padEnd(
        120,
        " ",
      ),
    workingHypotheses:
      "Primary hypothesis: educational content about the customer moment will outperform feature promotion. Alternative hypothesis: price transparency may convert better. Research must compare evidence for both.".padEnd(
        120,
        " ",
      ),
    researchQuestions:
      "What audience questions create the strongest demand evidence? Capture customer language and exact phrases. Which competitor and substitute classes own attention? What category conventions dominate, and where do content gaps versus business opportunities appear? For each selected strategic hypothesis, what pursue/reject/modify verdict does the evidence support? What evidence would disconfirm the primary hypothesis?".padEnd(
        220,
        " ",
      ),
    evidenceAndRedTeamRequirements:
      `${controls.evidence} Seek disconfirming evidence. Classify competitors into direct, adjacent, aspirational, and substitute classes, plus search and social-content competitors. Cite sources with publication dates and assess source quality. Require demand evidence and a pursue/reject/modify verdict per selected hypothesis. Preserve owner-confirmed restrictions.`.padEnd(
        220,
        " ",
      ),
    requiredReportStructure:
      `${controls.report} Deliver 3 content pillars with 2 experiments per pillar. Each experiment is an evidence-backed content opportunity: state the topic, audience moment, tension or unmet need without overstating severity, a planted question distinct from the topic, the viewer reward for what the audience gains, evidence basis or research support, confidence, restrictions, commercial bridge or none warranted, success criteria, and failure criteria. Also require one primary platform, one report-level CTA hypothesis, customer language, category conventions, content gaps versus business opportunities, and unknowns requiring owner confirmation. Six experiments does not imply six distinct customer problems. Do not produce twenty generic topics.`.padEnd(
        320,
        " ",
      ),
    qualityCheckBeforeSubmission:
      "Verify audience-first framing, restriction preservation, competitor classification including substitutes, contradictory evidence, citations, and definition of done before submission. Return the completed research output only; do not propose additional workflows.".padEnd(
        160,
        " ",
      ),
    metadata: {
      promptVersion: "1.1.0",
      companyProfileVersion: "p1",
      researchBriefVersion: "1.0.0",
      generatedAt: new Date().toISOString(),
      model: "gpt-5.6-terra",
    },
  };
}

describe("prompt contract eval fixtures", () => {
  it("covers six industries", () => {
    expect(fixtures).toHaveLength(6);
  });

  it.each(fixtures)("$id formatted prompt passes structural contract", (fixture) => {
    const md = formatResearchPrompt(
      makePrompt(
        fixture.companyName,
        `Industry focus: ${fixture.industry}.`,
        fixture.requiredFinalPromptClauses,
        fixture.industry,
      ),
    );
    const result = lintPromptContract(md);
    expect(result.issues).toEqual([]);
    expect(result.ok).toBe(true);
    for (const clause of fixture.requiredFinalPromptClauses) {
      expect(md.toLowerCase()).toContain(clause.toLowerCase());
    }
  });

  it("keeps structural contract even when company context includes injection text", () => {
    const hostile = makePrompt(
      supplementFixture.companyName,
      supplementFixture.injectionCell ?? "",
      [],
      supplementFixture.industry,
    );
    const md = formatResearchPrompt(hostile);
    expect(lintPromptContract(md).ok).toBe(true);
    expect(md).toMatch(/disconfirm/i);
  });

  it("accepts synonym/window variants for pillars, platform, and success criteria", () => {
    const prompt = makePrompt(
      "Synonym Co",
      "Customer moment: shoppers pause at label confusion.",
      [],
      "consumer products",
    );
    prompt.requiredReportStructure =
      `${controlParagraphs("Synonym Co", "consumer products").report} Deliver three educational pillars with two experiments each (six experiments total). For every experiment establish the decision moment shoppers face, the friction that creates curiosity, a curiosity question, educational value describing what the audience gains, supporting evidence or confidence, success criteria, and failure criteria. Also require one recommended platform, one call-to-action hypothesis, customer language, category conventions, content gaps versus business opportunities, substitute competitors, demand evidence, citations, and a pursue/reject/modify verdict per hypothesis.`.padEnd(
        320,
        " ",
      );
    const result = lintPromptContract(formatResearchPrompt(prompt));
    expect(result.issues).toEqual([]);
    expect(result.ok).toBe(true);
  });
});
