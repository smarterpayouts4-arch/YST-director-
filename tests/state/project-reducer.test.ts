import { describe, expect, it } from "vitest";
import {
  createEmptyProject,
  projectReducer,
} from "@/features/research-prompt-builder/state/project-reducer";
import type { ResearchBrief } from "@/features/research-prompt-builder/schemas";

const brief = {
  companyTruth: "x".repeat(60),
  customerMoment: "y".repeat(40),
  viewerReward: "z".repeat(40),
  businessBridge: "a".repeat(40),
  primaryPlatform: {
    value: "YouTube",
    rationale: "r".repeat(30),
    status: "working_hypothesis" as const,
  },
  contentHypothesis: "c".repeat(60),
  challengeHypothesis: "h".repeat(60),
  trustBoundaries: ["no medical advice"],
  executionContext: ["owner can film weekly"],
  unresolvedUnknowns: ["ideal CTA"],
  evidenceSummary: [],
} satisfies ResearchBrief;

describe("project reducer invalidation", () => {
  it("editing the brief clears the final prompt", () => {
    let state = createEmptyProject();
    state = projectReducer(state, { type: "SET_BRIEF", brief });
    state = projectReducer(state, {
      type: "SET_FINAL_PROMPT",
      prompt: {
        title: "Prompt",
        roleAndExpertise: "A".repeat(120),
        companyContext: "B".repeat(220),
        ownerConfirmedDecisions: "C".repeat(120),
        workingHypotheses: "D".repeat(120),
        researchQuestions: "E".repeat(220),
        evidenceAndRedTeamRequirements: "F".repeat(220),
        requiredReportStructure: "G".repeat(320),
        qualityCheckBeforeSubmission: "H".repeat(160),
        metadata: {
          promptVersion: "1.0.0",
          companyProfileVersion: "p1",
          researchBriefVersion: "1.0.0",
          generatedAt: new Date().toISOString(),
          model: "gpt-5.6-terra",
        },
      },
      formattedPrompt: "# Prompt",
    });
    expect(state.finalPrompt).toBeTruthy();
    state = projectReducer(state, {
      type: "EDIT_BRIEF",
      brief: { ...brief, companyTruth: "updated company truth that is long enough" },
    });
    expect(state.finalPrompt).toBeUndefined();
    expect(state.formattedPrompt).toBeUndefined();
  });
});
