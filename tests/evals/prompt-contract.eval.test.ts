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

function makePrompt(
  company: string,
  extras: string,
  industryClauses: string[] = [],
): FinalResearchPrompt {
  const industryLine = industryClauses.length
    ? ` Industry cues: ${industryClauses.join("; ")}.`
    : "";
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
      "What audience questions create the strongest demand? Which competitor classes own attention? What evidence would disconfirm the primary hypothesis?".padEnd(
        220,
        " ",
      ),
    evidenceAndRedTeamRequirements:
      "Seek disconfirming evidence. Classify competitors into direct, adjacent, and aspirational classes, plus search and social-content competitors. Cite sources with publication dates and assess source quality. Preserve owner-confirmed restrictions.".padEnd(
        220,
        " ",
      ),
    requiredReportStructure:
      "Deliver 3 content pillars with 2 experiments per pillar, one primary platform, one CTA hypothesis, success and failure criteria, and unknowns requiring owner confirmation. Do not produce twenty generic topics.".padEnd(
        320,
        " ",
      ),
    qualityCheckBeforeSubmission:
      "Verify audience-first framing, restriction preservation, competitor classification, contradictory evidence, and definition of done before submission. Return the completed research output only; do not propose additional workflows.".padEnd(
        160,
        " ",
      ),
    metadata: {
      promptVersion: "1.0.0",
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
    );
    // Hostile CSV-like text must remain data; contract sections still required.
    const md = formatResearchPrompt(hostile);
    expect(lintPromptContract(md).ok).toBe(true);
    expect(md).toMatch(/disconfirm/i);
  });
});
