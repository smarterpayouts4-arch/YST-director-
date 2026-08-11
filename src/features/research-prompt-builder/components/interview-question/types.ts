import type {
  InterviewAnswer,
  InterviewQuestion,
  SupportingContext,
} from "@/features/research-prompt-builder/types";

export type ViewProps = {
  question: InterviewQuestion;
  /** Prefill when reopening a prior Decide turn (answer was cleared from store). */
  seedAnswer?: InterviewAnswer | null;
  busy: boolean;
  error?: string | null;
  locked?: boolean;
  statusMessage?: string | null;
  onRetry?: () => void;
  canBuildBrief?: boolean;
  onBuildBrief?: () => void;
  onSave: (answer: InterviewAnswer) => void;
  onExtract: (file: File) => Promise<SupportingContext & { extractedCharCount?: number }>;
};
