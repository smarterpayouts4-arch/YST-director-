import { describe, expect, it } from "vitest";
import {
  createEmptyProject,
  projectReducer,
  type ProjectAction,
} from "@/features/research-prompt-builder/state/project-reducer";
import type {
  ConfirmedCompanyProfile,
  FinalResearchPrompt,
  InterviewQuestion,
  ResearchBrief,
} from "@/features/research-prompt-builder/schemas";
import type { ResearchPromptProject } from "@/features/research-prompt-builder/types";

const brief = {
  companyTruth: "x".repeat(60),
  customerMoment: "y".repeat(40),
  viewerReward: "z".repeat(40),
  businessBridge: "a".repeat(40),
  primaryPlatform: {
    value: "YouTube",
    rationale: "r".repeat(30),
  },
  contentHypothesis: "c".repeat(60),
  challengeHypothesis: "h".repeat(60),
  trustBoundaries: ["no medical advice"],
  executionContext: ["owner can film weekly"],
  unresolvedUnknowns: ["ideal CTA"],
  evidenceSummary: [],
  fieldProvenance: {
    customerMoment: { origin: "model_hypothesis", sourceRefs: [] },
    viewerReward: { origin: "model_hypothesis", sourceRefs: [] },
    challengeHypothesis: { origin: "model_hypothesis", sourceRefs: [] },
    contentHypothesis: { origin: "model_hypothesis", sourceRefs: [] },
    executionContext: { origin: "model_hypothesis", sourceRefs: [] },
    companyTruth: { origin: "model_hypothesis", sourceRefs: [] },
    businessBridge: { origin: "model_hypothesis", sourceRefs: [] },
    primaryPlatform: { origin: "model_hypothesis", sourceRefs: [] },
    trustBoundaries: { origin: "model_hypothesis", sourceRefs: [] },
    unresolvedUnknowns: { origin: "model_hypothesis", sourceRefs: [] },
  },
} satisfies ResearchBrief;

const finalPrompt = {
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
} satisfies FinalResearchPrompt;

const profile = {
  profileVersion: "p1",
  confirmedAt: new Date().toISOString(),
  fields: {},
} as unknown as ConfirmedCompanyProfile;

const question = {
  questionId: "q1",
  sequenceNumber: 1,
  category: "customer_moment",
  observation: "o".repeat(40),
  question: "What single customer moment matters most?",
  whyThisMatters: "w".repeat(30),
  suggestedAnswer: "s".repeat(40),
  isConditional: false,
} as unknown as InterviewQuestion;

function atStage(
  stage: ResearchPromptProject["currentStage"],
  extra: Partial<ResearchPromptProject> = {},
): ResearchPromptProject {
  return { ...createEmptyProject(), currentStage: stage, ...extra };
}

function apply(state: ResearchPromptProject, action: ProjectAction) {
  return projectReducer(state, action);
}

describe("hard workflow transition enforcement", () => {
  it("rejects SET_BRIEF from INGESTING, keeps stage and data, records diagnostic", () => {
    const start = createEmptyProject();
    const next = apply(start, { type: "SET_BRIEF", brief });
    expect(next.currentStage).toBe("INGESTING");
    expect(next.researchBrief).toBeUndefined();
    expect(next.lastDiagnostic).toMatchObject({
      code: "ILLEGAL_TRANSITION",
      from: "INGESTING",
      attemptedTo: "BRIEF_REVIEW",
      action: "SET_BRIEF",
    });
    expect(next.lastFailureCode).toBeUndefined();
  });

  it("rejects illegal SET_STAGE jumps and preserves failure code separation", () => {
    const start = atStage("INGESTING", { lastFailureCode: "INGESTION_FAILED" });
    const next = apply(start, { type: "SET_STAGE", stage: "PROMPT_EXPORTED" });
    expect(next.currentStage).toBe("INGESTING");
    expect(next.lastDiagnostic?.code).toBe("ILLEGAL_TRANSITION");
    // Diagnostics must not overwrite real operation failures.
    expect(next.lastFailureCode).toBe("INGESTION_FAILED");
  });

  it("rejects SET_FAILURE targets not reachable from the current state", () => {
    const start = atStage("PROMPT_EXPORTED");
    const next = apply(start, {
      type: "SET_FAILURE",
      state: "DOCUMENT_EXTRACTION_FAILED",
      code: "DOCUMENT_EXTRACTION_FAILED",
    });
    expect(next.currentStage).toBe("PROMPT_EXPORTED");
    expect(next.lastFailureCode).toBeUndefined();
    expect(next.lastDiagnostic?.attemptedTo).toBe("DOCUMENT_EXTRACTION_FAILED");
  });

  it("allows the full legal happy path and clears diagnostics on legal moves", () => {
    let state = createEmptyProject();
    state = apply(state, {
      type: "INGESTION_SUCCESS",
      meta: {
        fileName: "sample.csv",
        fileHash: "hash",
        importedAt: new Date().toISOString(),
        rowCount: 10,
        retainedRowCount: 10,
        warnings: [],
        wasTruncated: false,
      },
      understanding: { fields: {} } as never,
    });
    expect(state.currentStage).toBe("UNDERSTANDING_REVIEW");

    state = apply(state, { type: "SET_CONFIRMED_PROFILE", profile });
    expect(state.currentStage).toBe("INTERVIEWING");

    state = apply(state, { type: "ADD_QUESTION", question });
    expect(state.currentStage).toBe("INTERVIEWING");

    state = apply(state, { type: "INTERVIEW_COMPLETE" });
    expect(state.currentStage).toBe("BRIEF_REVIEW");

    state = apply(state, { type: "SET_BRIEF", brief });
    expect(state.currentStage).toBe("BRIEF_REVIEW");

    state = apply(state, { type: "BEGIN_PROMPT_GENERATION" });
    expect(state.currentStage).toBe("GENERATING_PROMPT");

    state = apply(state, {
      type: "SET_FINAL_PROMPT",
      prompt: finalPrompt,
      formattedPrompt: "# Prompt",
    });
    expect(state.currentStage).toBe("PROMPT_EXPORTED");
    expect(state.lastDiagnostic).toBeUndefined();
  });

  it("allows legal failure entry and recovery", () => {
    let state = atStage("GENERATING_PROMPT", { researchBrief: brief });
    state = apply(state, {
      type: "SET_FAILURE",
      state: "PROMPT_VALIDATION_FAILED",
      code: "PROMPT_VALIDATION_FAILED",
    });
    expect(state.currentStage).toBe("PROMPT_VALIDATION_FAILED");
    expect(state.lastFailureCode).toBe("PROMPT_VALIDATION_FAILED");

    state = apply(state, { type: "BEGIN_PROMPT_GENERATION" });
    expect(state.currentStage).toBe("GENERATING_PROMPT");
    expect(state.lastDiagnostic).toBeUndefined();
  });
});

describe("project reducer invalidation", () => {
  it("editing the brief clears the final prompt", () => {
    let state = atStage("BRIEF_REVIEW");
    state = apply(state, { type: "SET_BRIEF", brief });
    state = apply(state, { type: "BEGIN_PROMPT_GENERATION" });
    state = apply(state, {
      type: "SET_FINAL_PROMPT",
      prompt: finalPrompt,
      formattedPrompt: "# Prompt",
    });
    expect(state.finalPrompt).toBeTruthy();
    expect(state.currentStage).toBe("PROMPT_EXPORTED");
    state = apply(state, {
      type: "EDIT_BRIEF",
      brief: { ...brief, companyTruth: "updated company truth that is long enough" },
    });
    expect(state.finalPrompt).toBeUndefined();
    expect(state.formattedPrompt).toBeUndefined();
  });

  it("saving an answer clears brief and final prompt without changing stage", () => {
    let state = atStage("INTERVIEWING", {
      researchBrief: brief,
      formattedPrompt: "# Prompt",
    });
    state = apply(state, {
      type: "SAVE_ANSWER",
      answer: {
        questionId: "q1",
        answer: "Our best customers are new parents researching sleep.",
        usedSuggestion: false,
        answeredAt: new Date().toISOString(),
      } as never,
    });
    expect(state.currentStage).toBe("INTERVIEWING");
    expect(state.researchBrief).toBeUndefined();
    expect(state.formattedPrompt).toBeUndefined();
  });

  it("reopening an earlier Decide turn drops later questions and that answer", () => {
    const q1 = { ...question, questionId: "q1", sequenceNumber: 1 } as InterviewQuestion;
    const q2 = {
      ...question,
      questionId: "q2",
      sequenceNumber: 2,
    } as InterviewQuestion;
    let state = atStage("INTERVIEWING", {
      questions: [q1, q2],
      answers: [
        {
          questionId: "q1",
          answerText: "Prior strategic choice.",
          usedSuggestion: false,
          selectedSuggestionIds: ["a"],
          customDirection: null,
          supportingDocuments: [],
          answeredAt: new Date().toISOString(),
        },
      ],
      currentQuestionIndex: 1,
      researchBrief: brief,
    });
    state = apply(state, { type: "REOPEN_QUESTION", questionIndex: 0 });
    expect(state.questions).toHaveLength(1);
    expect(state.questions[0]?.questionId).toBe("q1");
    expect(state.answers).toHaveLength(0);
    expect(state.currentQuestionIndex).toBe(0);
    expect(state.researchBrief).toBeUndefined();
    expect(state.currentStage).toBe("INTERVIEWING");
  });
});
