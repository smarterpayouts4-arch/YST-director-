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
        updatedAt: now(),
      };
    case "SET_CONFIRMED_PROFILE":
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
        currentStage: "INTERVIEWING",
        currentQuestionIndex: 0,
        lastFailureCode: undefined,
        updatedAt: now(),
      };
    case "ADD_QUESTION":
      return {
        ...state,
        questions: [...state.questions, action.question],
        currentQuestionIndex: state.questions.length,
        currentStage: "INTERVIEWING",
        ...clearDownstream(state, ["researchBrief", "finalPrompt", "formattedPrompt"]),
        researchBrief: undefined,
        finalPrompt: undefined,
        formattedPrompt: undefined,
        updatedAt: now(),
      };
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
    case "INTERVIEW_COMPLETE":
      return {
        ...state,
        currentStage: "BRIEF_REVIEW",
        updatedAt: now(),
      };
    case "SET_BRIEF":
      return {
        ...state,
        researchBrief: action.brief,
        finalPrompt: undefined,
        formattedPrompt: undefined,
        currentStage: "BRIEF_REVIEW",
        lastFailureCode: undefined,
        updatedAt: now(),
      };
    case "EDIT_BRIEF":
      return {
        ...state,
        researchBrief: action.brief,
        finalPrompt: undefined,
        formattedPrompt: undefined,
        updatedAt: now(),
      };
    case "BEGIN_PROMPT_GENERATION":
      return {
        ...state,
        currentStage: "GENERATING_PROMPT",
        updatedAt: now(),
      };
    case "SET_FINAL_PROMPT":
      return {
        ...state,
        finalPrompt: action.prompt,
        formattedPrompt: action.formattedPrompt,
        currentStage: COMPLETE,
        lastFailureCode: undefined,
        updatedAt: now(),
      };
    case "SET_STAGE": {
      if (
        state.currentStage !== action.stage &&
        !canTransition(state.currentStage, action.stage)
      ) {
        // Soft-allow for recovery navigation from UI; still record the target.
      }
      return {
        ...state,
        currentStage: action.stage,
        updatedAt: now(),
      };
    }
    case "SET_FAILURE":
      return {
        ...state,
        currentStage: action.state,
        lastFailureCode: action.code,
        updatedAt: now(),
      };
    default:
      return state;
  }
}
