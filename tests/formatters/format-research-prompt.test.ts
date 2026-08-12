import { describe, expect, it } from "vitest";
import {
  formatResearchPrompt,
  RESEARCH_PROMPT_EXECUTE_PREAMBLE,
  RESEARCH_PROMPT_STOP_FOOTER,
  validateFormattedPrompt,
} from "@/features/research-prompt-builder/formatters/format-research-prompt";
import type { FinalResearchPrompt } from "@/features/research-prompt-builder/schemas";

const sample: FinalResearchPrompt = {
  title: "ZYNAVA Research Prompt",
  roleAndExpertise: "A".repeat(120),
  companyContext:
    "Open with the customer moment and audience tension before any company promotion. " +
    "B".repeat(200),
  ownerConfirmedDecisions:
    "Label each item as observed fact, owner-confirmed decision, or restriction. " +
    "C".repeat(80),
  workingHypotheses:
    "Keep working hypotheses separate from research questions. " + "D".repeat(80),
  researchQuestions:
    "Ask singular material research questions about the audience and customer moment, customer language, category conventions, demand evidence, and content gaps versus business opportunities. " +
    "E".repeat(160),
  evidenceAndRedTeamRequirements:
    "Hypothesis-blind discovery: before evaluating the supplied hypotheses, run a neutral scan. Quotation discipline: never manufacture quotes; use a paraphrased language pattern unless the exact words are present in a cited source. Evidence hierarchy: quantity is not evidence quality; weak commercial sources must not outweigh primary authoritative sources; explain the disagreement. Demand triangulation: multi-signal convergence; a content gap alone is not demand. Require demand evidence. Seek disconfirming evidence and classify competitors as direct, adjacent, aspirational, or substitute. Challenge assumptions. Cite sources. For each selected hypothesis give a pursue/reject/modify verdict.",
  requiredReportStructure:
    "For every major conclusion assign High / Medium / Low confidence and state what additional evidence would most likely change the conclusion. Report up to 3–5 surprising findings against supplied assumptions; do not manufacture surprising findings to satisfy a quota; name each supplied assumption id. Include 3 content pillars with 2 experiments each (6 experiments). Each experiment must establish an audience moment, tension or curiosity question, viewer reward for what the audience gains, evidence-backed research support, success criteria, and failure criteria. Also require one primary platform, one CTA hypothesis, substitute competitors, and demand evidence with citations.",
  qualityCheckBeforeSubmission:
    "Return the completed research output only; do not propose additional workflows. " +
    "F".repeat(80),
  metadata: {
    promptVersion: "1.1.0",
    companyProfileVersion: "p1",
    researchBriefVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    model: "gpt-5.6-terra",
  },
};

describe("final prompt formatter", () => {
  it("emits exact heading order", () => {
    const md = formatResearchPrompt(sample);
    const idx = [
      "## 1. ROLE AND EXPERTISE",
      "## 2. COMPANY CONTEXT",
      "## 3. OWNER-CONFIRMED DECISIONS",
      "## 4. WORKING HYPOTHESES",
      "## 5. RESEARCH QUESTIONS",
      "## 6. EVIDENCE AND RED-TEAM REQUIREMENTS",
      "## 7. REQUIRED REPORT STRUCTURE",
      "## 8. QUALITY CHECK BEFORE SUBMISSION",
    ].map((h) => md.indexOf(h));
    expect(idx.every((n) => n >= 0)).toBe(true);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
    expect(validateFormattedPrompt(md)).toEqual([]);
  });

  it("frames clipboard for immediate execution (ask-first regression)", () => {
    const formatted = formatResearchPrompt(sample);

    expect(formatted.startsWith("EXECUTE THIS RESEARCH NOW.")).toBe(true);
    expect(formatted.indexOf("EXECUTE THIS RESEARCH NOW.")).toBeLessThan(
      formatted.indexOf("## 1. ROLE AND EXPERTISE"),
    );
    expect(formatted.indexOf("EXECUTE THIS RESEARCH NOW.")).toBeLessThan(
      formatted.indexOf(`# ${sample.title}`),
    );

    expect(formatted).toContain("Do not ask clarifying questions.");
    expect(formatted).toContain("Do not ask what I want you to do with this brief.");
    expect(formatted).toContain(RESEARCH_PROMPT_EXECUTE_PREAMBLE);
    expect(formatted).toContain("Return the completed research output only.");
    expect(formatted).toContain(RESEARCH_PROMPT_STOP_FOOTER);
    expect(formatted.indexOf("## 8. QUALITY CHECK BEFORE SUBMISSION")).toBeLessThan(
      formatted.indexOf(RESEARCH_PROMPT_STOP_FOOTER),
    );

    expect(formatted).not.toMatch(/48,?000/);
    expect(formatted).not.toMatch(/ask follow-up questions if needed/i);
    expect(formatted).not.toMatch(/ask clarifying questions if needed/i);
  });
});
