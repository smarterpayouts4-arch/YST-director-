import { describe, expect, it } from "vitest";
import {
  formatResearchPrompt,
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
    "Ask singular material research questions about the audience and customer moment. " +
    "E".repeat(160),
  evidenceAndRedTeamRequirements:
    "Seek disconfirming evidence and classify competitors as direct, adjacent, or aspirational. Challenge assumptions.",
  requiredReportStructure:
    "Include 3 content pillars with 2 experiments each (6 experiments), one primary platform, one CTA hypothesis, and clear success/failure criteria.",
  qualityCheckBeforeSubmission:
    "Return the completed research output only; do not propose additional workflows. " +
    "F".repeat(80),
  metadata: {
    promptVersion: "1.0.0",
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
});
