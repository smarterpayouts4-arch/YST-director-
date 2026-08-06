import type {
  CompanyUnderstanding,
  ConfirmedCompanyProfile,
  FinalResearchPrompt,
  InterviewAnswer,
  InterviewQuestion,
  ResearchBrief,
  ResearchPromptProject,
} from "@/features/research-prompt-builder/types";
import {
  canTransition,
  COMPLETE,
  type FailureWorkflowState,
  type WorkflowDiagnostic,
  type WorkflowState,
} from "@/features/research-prompt-builder/state/workflow-states";

function now() {
  return new Date().toISOString();
}

function clearDownstream(
  state: ResearchPromptProject,
  keys: Array<keyof ResearchPromptProject>,
): Partial<ResearchPromptProject> {
  const patch: Partial<ResearchPromptProject> = {};
  for (const key of keys) {
    if (key === "questions") patch.questions = [];
    else if (key === "answers") patch.answers = [];
    else (patch as Record<string, unknown>)[key] = undefined;
  }
  return patch;
}

/**
 * Hard transition gate. Same-state moves are always legal; anything else must
 * be listed in TRANSITION_META.allowedNext. Illegal attempts keep the current
 * stage and project data untouched, recording only a WorkflowDiagnostic.
 */
function gateTransition(
  state: ResearchPromptProject,
  to: WorkflowState,
  action: string,
):
  | { ok: true; stage: WorkflowState }
  | { ok: false; rejected: ResearchPromptProject } {
  const from = state.currentStage;
  if (from === to || canTransition(from, to)) {
    return { ok: true, stage: to };
  }
  const diagnostic: WorkflowDiagnostic = {
    code: "ILLEGAL_TRANSITION",
    from,
    attemptedTo: to,
    action,
    occurredAt: now(),
  };
  return {
    ok: false,
    rejected: { ...state, lastDiagnostic: diagnostic, updatedAt: now() },
  };
}

export function createEmptyProject(): ResearchPromptProject {
  const stamp = now();
  return {
    version: 1,
    projectId: `proj_${Date.now().toString(36)}`,
    ingestion: {},
    questions: [],
    answers: [],
    currentStage: "INGESTING",
    currentQuestionIndex: 0,
    createdAt: stamp,
    updatedAt: stamp,
  };
}

export type ProjectAction =
  | {
      type: "INGESTION_SUCCESS";
      meta: NonNullable<ResearchPromptProject["ingestion"]["meta"]> & {
        fileName: string;
        fileHash: string;
        importedAt: string;
      };
      understanding: CompanyUnderstanding;
    }
  | { type: "SET_CONFIRMED_PROFILE"; profile: ConfirmedCompanyProfile }
  | { type: "ADD_QUESTION"; question: InterviewQuestion }
  | { type: "SAVE_ANSWER"; answer: InterviewAnswer }
  | { type: "SET_BRIEF"; brief: ResearchBrief }
  | { type: "EDIT_BRIEF"; brief: ResearchBrief }
  | {
      type: "SET_FINAL_PROMPT";
      prompt: FinalResearchPrompt;
      formattedPrompt: string;
    }
  | { type: "SET_STAGE"; stage: WorkflowState }
  | { type: "SET_FAILURE"; state: FailureWorkflowState; code?: string }
  | { type: "BEGIN_PROMPT_GENERATION" }
  | { type: "INTERVIEW_COMPLETE" }
  | { type: "RESET" }
  | { type: "HYDRATE"; project: ResearchPromptProject };

export function projectReducer(
  state: ResearchPromptProject,
  action: ProjectAction,
): ResearchPromptProject {
  switch (action.type) {
    case "HYDRATE":
      return action.project;
    case "RESET":
      return createEmptyProject();
    case "INGESTION_SUCCESS":
      // A successful upload starts a fresh project (RESET semantics), so the
      // effective transition is always INGESTING → UNDERSTANDING_REVIEW.
      return {
        ...createEmptyProject(),
        projectId: state.projectId,
        createdAt: state.createdAt,
        ingestion: {
          fileName: action.meta.fileName,
          fileHash: action.meta.fileHash,
          importedAt: action.meta.importedAt,
          meta: {
            rowCount: action.meta.rowCount,
            retainedRowCount: action.meta.retainedRowCount,
            warnings: action.meta.warnings,
            wasTruncated: action.meta.wasTruncated,
          },
        },
        companyUnderstanding: action.understanding,
        currentStage: "UNDERSTANDING_REVIEW",
        lastFailureCode: undefined,
        lastDiagnostic: undefined,
        updatedAt: now(),
      };
    case "SET_CONFIRMED_PROFILE": {
      const gate = gateTransition(state, "INTERVIEWING", action.type);
      if (!gate.ok) return gate.rejected;
      return {
        ...state,
        confirmedProfile: action.profile,
        ...clearDownstream(state, [
          "questions",
          "answers",
          "researchBrief",
          "finalPrompt",
          "formattedPrompt",
        ]),
        questions: [],
        answers: [],
        currentStage: gate.stage,
        currentQuestionIndex: 0,
        lastFailureCode: undefined,
        lastDiagnostic: undefined,
        updatedAt: now(),
      };
    }
    case "ADD_QUESTION": {
      const gate = gateTransition(state, "INTERVIEWING", action.type);
      if (!gate.ok) return gate.rejected;
      return {
        ...state,
        questions: [...state.questions, action.question],
        currentQuestionIndex: state.questions.length,
        currentStage: gate.stage,
        ...clearDownstream(state, ["researchBrief", "finalPrompt", "formattedPrompt"]),
        researchBrief: undefined,
        finalPrompt: undefined,
        formattedPrompt: undefined,
        lastDiagnostic: undefined,
        updatedAt: now(),
      };
    }
    case "SAVE_ANSWER": {
      const answers = [
        ...state.answers.filter((a) => a.questionId !== action.answer.questionId),
        action.answer,
      ];
      return {
        ...state,
        answers,
        ...clearDownstream(state, ["researchBrief", "finalPrompt", "formattedPrompt"]),
        researchBrief: undefined,
        finalPrompt: undefined,
        formattedPrompt: undefined,
        updatedAt: now(),
      };
    }
    case "INTERVIEW_COMPLETE": {
      const gate = gateTransition(state, "BRIEF_REVIEW", action.type);
      if (!gate.ok) return gate.rejected;
      return {
        ...state,
        currentStage: gate.stage,
        lastDiagnostic: undefined,
        updatedAt: now(),
      };
    }
    case "SET_BRIEF": {
      const gate = gateTransition(state, "BRIEF_REVIEW", action.type);
      if (!gate.ok) return gate.rejected;
      return {
        ...state,
        researchBrief: action.brief,
        finalPrompt: undefined,
        formattedPrompt: undefined,
        currentStage: gate.stage,
        lastFailureCode: undefined,
        lastDiagnostic: undefined,
        updatedAt: now(),
      };
    }
    case "EDIT_BRIEF":
      return {
        ...state,
        researchBrief: action.brief,
        finalPrompt: undefined,
        formattedPrompt: undefined,
        updatedAt: now(),
      };
    case "BEGIN_PROMPT_GENERATION": {
      const gate = gateTransition(state, "GENERATING_PROMPT", action.type);
      if (!gate.ok) return gate.rejected;
      return {
        ...state,
        currentStage: gate.stage,
        lastDiagnostic: undefined,
        updatedAt: now(),
      };
    }
    case "SET_FINAL_PROMPT": {
      const gate = gateTransition(state, COMPLETE, action.type);
      if (!gate.ok) return gate.rejected;
      return {
        ...state,
        finalPrompt: action.prompt,
        formattedPrompt: action.formattedPrompt,
        currentStage: gate.stage,
        lastFailureCode: undefined,
        lastDiagnostic: undefined,
        updatedAt: now(),
      };
    }
    case "SET_STAGE": {
      const gate = gateTransition(state, action.stage, action.type);
      if (!gate.ok) return gate.rejected;
      return {
        ...state,
        currentStage: gate.stage,
        lastDiagnostic: undefined,
        updatedAt: now(),
      };
    }
    case "SET_FAILURE": {
      const gate = gateTransition(state, action.state, action.type);
      if (!gate.ok) return gate.rejected;
      return {
        ...state,
        currentStage: gate.stage,
        lastFailureCode: action.code,
        lastDiagnostic: undefined,
        updatedAt: now(),
      };
    }
    default:
      return state;
  }
}
