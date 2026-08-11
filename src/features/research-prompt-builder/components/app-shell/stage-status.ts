export type InterviewStatus = "loading" | "blocked" | "idle";

export function getInterviewStatus(input: {
  awaitingQuestion: boolean;
  busy: boolean;
  needsNextQuestion: boolean;
  error: string | null;
}): InterviewStatus {
  if (input.awaitingQuestion || (input.busy && input.needsNextQuestion)) {
    return "loading";
  }
  if (input.error || input.needsNextQuestion) {
    return "blocked";
  }
  return "idle";
}

export function getInterviewStatusMessage(input: {
  interviewStatus: InterviewStatus;
  error: string | null;
  answerCount: number;
  needsNextQuestion: boolean;
}): string | null {
  if (input.interviewStatus === "loading") {
    return "Next question loading…";
  }
  if (input.error) {
    return input.answerCount === 0
      ? "Couldn’t start the interview. Retry."
      : "Couldn’t load the next question. Your last answer is saved.";
  }
  if (input.needsNextQuestion) {
    return "Waiting for the next question.";
  }
  return null;
}

export function interviewQuestionProgress(answerCount: number): string {
  if (answerCount === 0) return "Building research focus";
  return `${answerCount} decision${answerCount === 1 ? "" : "s"} locked`;
}
