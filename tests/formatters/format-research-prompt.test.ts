import { describe, expect, it } from "vitest";
import {
  formatResearchPrompt,
  validateFormattedPrompt,
} from "@/features/research-prompt-builder/formatters/format-research-prompt";
import type { FinalResearchPrompt } from "@/features/research-prompt-builder/schemas";

const sample: FinalResearchPrompt = {
  title: "ZYNAVA Research Prompt",
  roleAndExpertise: "A".repeat(120),
  companyContext: "B".repeat(220),
  ownerConfirmedDecisions: "C".repeat(120),
  workingHypotheses: "D".repeat(120),
  researchQuestions: "E".repeat(220),
  evidenceAndRedTeamRequirements:
    "Seek disconfirming evidence and classify competitors carefully. Challenge assumptions.",
  requiredReportStructure:
    "Include 3 content pillars and 2 experiments per pillar with one primary platform.",
  qualityCheckBeforeSubmission: "F".repeat(160),
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
