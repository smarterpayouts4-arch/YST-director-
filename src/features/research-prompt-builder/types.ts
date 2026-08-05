export type {
  ApiError,
  ClassifiedField,
  CompanyUnderstanding,
  ConfirmedCompanyProfile,
  CsvEvidencePacket,
  FinalResearchPrompt,
  InterviewAnswer,
  InterviewQuestion,
  ResearchBrief,
  SupportingContext,
} from "@/features/research-prompt-builder/schemas";

export type {
  AppStage,
} from "@/features/research-prompt-builder/config/constants";

export type FieldStatus = "confirmed" | "corrected" | "rejected" | "unresolved";

export type ResearchPromptProject = {
  version: 1;
  projectId: string;
  ingestion: {
    fileName?: string;
    fileHash?: string;
    importedAt?: string;
    meta?: {
      rowCount: number;
      retainedRowCount: number;
      warnings: string[];
      wasTruncated: boolean;
    };
  };
  companyUnderstanding?: import("@/features/research-prompt-builder/schemas").CompanyUnderstanding;
  confirmedProfile?: import("@/features/research-prompt-builder/schemas").ConfirmedCompanyProfile;
  questions: import("@/features/research-prompt-builder/schemas").InterviewQuestion[];
  answers: import("@/features/research-prompt-builder/schemas").InterviewAnswer[];
  researchBrief?: import("@/features/research-prompt-builder/schemas").ResearchBrief;
  finalPrompt?: import("@/features/research-prompt-builder/schemas").FinalResearchPrompt;
  formattedPrompt?: string;
  currentStage: import("@/features/research-prompt-builder/config/constants").AppStage;
  currentQuestionIndex: number;
  createdAt: string;
  updatedAt: string;
};
