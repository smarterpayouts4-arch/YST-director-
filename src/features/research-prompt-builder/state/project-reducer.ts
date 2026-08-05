import type {
  CompanyUnderstanding,
  ConfirmedCompanyProfile,
  FinalResearchPrompt,
  InterviewAnswer,
  InterviewQuestion,
  ResearchBrief,
  ResearchPromptProject,
} from "@/features/research-prompt-builder/types";

function now() {
  return new Date().toISOString();
}

export function createEmptyProject(): ResearchPromptProject {
  const stamp = now();
  return {
    version: 1,
    projectId: `proj_${Date.now().toString(36)}`,
    ingestion: {},
    questions: [],
    answers: [],
    currentStage: "ingestion",
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
  | { type: "SET_STAGE"; stage: ResearchPromptProject["currentStage"] }
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
        currentStage: "understanding",
        updatedAt: now(),
      };
    case "SET_CONFIRMED_PROFILE":
      return {
        ...state,
        confirmedProfile: action.profile,
        questions: [],
        answers: [],
        researchBrief: undefined,
        finalPrompt: undefined,
        formattedPrompt: undefined,
        currentStage: "interview",
        currentQuestionIndex: 0,
        updatedAt: now(),
      };
    case "ADD_QUESTION":
      return {
        ...state,
        questions: [...state.questions, action.question],
        currentQuestionIndex: state.questions.length,
        currentStage: "interview",
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
        researchBrief: undefined,
        finalPrompt: undefined,
        formattedPrompt: undefined,
        updatedAt: now(),
      };
    }
    case "INTERVIEW_COMPLETE":
      return {
        ...state,
        currentStage: "brief",
        updatedAt: now(),
      };
    case "SET_BRIEF":
      return {
        ...state,
        researchBrief: action.brief,
        finalPrompt: undefined,
        formattedPrompt: undefined,
        currentStage: "brief",
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
    case "SET_FINAL_PROMPT":
      return {
        ...state,
        finalPrompt: action.prompt,
        formattedPrompt: action.formattedPrompt,
        currentStage: "prompt",
        updatedAt: now(),
      };
    case "SET_STAGE":
      return {
        ...state,
        currentStage: action.stage,
        updatedAt: now(),
      };
    default:
      return state;
  }
}
