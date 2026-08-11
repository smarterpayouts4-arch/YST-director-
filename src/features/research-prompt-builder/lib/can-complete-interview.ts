import type {
  ConfirmedCompanyProfile,
  InterviewAnswer,
  InterviewQuestion,
} from "@/features/research-prompt-builder/schemas";
import { MAX_TOTAL_QUESTIONS } from "@/features/research-prompt-builder/config/constants";
import {
  CORE_CATEGORIES,
  allCoreResolved,
  resolveCoreCoverage,
  type CoreCategory,
} from "@/features/research-prompt-builder/lib/core-coverage";

export type InterviewCompletionInput = {
  confirmedProfile: ConfirmedCompanyProfile;
  previousQuestions: InterviewQuestion[];
  previousAnswers: InterviewAnswer[];
};

export type InterviewCompletionDecision =
  | {
      ok: true;
      reason: "max_questions" | "cores_resolved";
      completionReason: string;
    }
  | {
      ok: false;
      reason: "cores_unresolved";
      unresolvedCoreCategories: CoreCategory[];
    };

/**
 * Single deterministic owner for interview → brief authorization.
 * Server validate, client `data.done`, and Build-brief UI must all use this.
 */
export function canCompleteInterview(
  input: InterviewCompletionInput,
): InterviewCompletionDecision {
  if (input.previousQuestions.length >= MAX_TOTAL_QUESTIONS) {
    return {
      ok: true,
      reason: "max_questions",
      completionReason: "Reached the maximum of seven interview questions.",
    };
  }

  const { covered } = resolveCoreCoverage(input);
  if (allCoreResolved(covered) && input.previousQuestions.length >= 1) {
    return {
      ok: true,
      reason: "cores_resolved",
      completionReason: "Required strategic decisions are resolved.",
    };
  }

  return {
    ok: false,
    reason: "cores_unresolved",
    unresolvedCoreCategories: CORE_CATEGORIES.filter((c) => !covered.has(c)),
  };
}
