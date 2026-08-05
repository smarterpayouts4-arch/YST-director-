import type { InterviewQuestion } from "@/features/research-prompt-builder/schemas";

export function validateInterviewQuestion(question: InterviewQuestion): string[] {
  const issues: string[] = [];
  const scores = Object.values(question.qualityScores);
  if (scores.some((score) => score < 4)) {
    issues.push("All quality scores must be at least 4.");
  }
  const marks = (question.question.match(/\?/g) ?? []).length;
  if (marks > 1) {
    issues.push("Question must ask one decision only.");
  }
  if (/\band\b.+\?/i.test(question.question) && /,\s*and\b/i.test(question.question)) {
    issues.push("Question appears multi-part.");
  }
  if (/be specific|describe your|what are your goals/i.test(question.suggestedAnswer)) {
    issues.push("Suggested answer is too generic.");
  }
  return issues;
}

export function coreCategoriesCovered(
  questions: InterviewQuestion[],
): Set<string> {
  return new Set(questions.map((q) => q.decisionCategory));
}
