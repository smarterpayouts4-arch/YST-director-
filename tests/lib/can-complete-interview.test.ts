import { describe, expect, it } from "vitest";
import { canCompleteInterview } from "@/features/research-prompt-builder/lib/can-complete-interview";
import { CORE_CATEGORIES } from "@/features/research-prompt-builder/lib/core-coverage";
import { MAX_TOTAL_QUESTIONS } from "@/features/research-prompt-builder/config/constants";
import { makeConfirmedProfile } from "../fixtures/api/confirmed-profile";
import {
  makeInterviewAnswer,
  makeInterviewQuestion,
} from "../fixtures/api/interview-question";

function coverAllCores() {
  const previousQuestions = CORE_CATEGORIES.map((decisionCategory, index) =>
    makeInterviewQuestion({
      questionId: `q-${decisionCategory}`,
      decisionCategory,
      sequenceNumber: index + 1,
    }),
  );
  const previousAnswers = previousQuestions.map((q) =>
    makeInterviewAnswer({ questionId: q.questionId }),
  );
  return { previousQuestions, previousAnswers };
}

describe("canCompleteInterview", () => {
  it("denies completion when cores are unresolved (including answers ≥ 3)", () => {
    const questions = [
      makeInterviewQuestion({ questionId: "q1", decisionCategory: "customer_moment" }),
      makeInterviewQuestion({ questionId: "q2", decisionCategory: "viewer_reward" }),
      makeInterviewQuestion({ questionId: "q3", decisionCategory: "business_bridge" }),
    ];
    const decision = canCompleteInterview({
      confirmedProfile: makeConfirmedProfile(),
      previousQuestions: questions,
      previousAnswers: questions.map((q) =>
        makeInterviewAnswer({ questionId: q.questionId }),
      ),
    });
    expect(decision.ok).toBe(false);
    if (!decision.ok) {
      expect(decision.unresolvedCoreCategories.length).toBeGreaterThan(0);
    }
  });

  it("allows completion when all cores are resolved", () => {
    const { previousQuestions, previousAnswers } = coverAllCores();
    const decision = canCompleteInterview({
      confirmedProfile: makeConfirmedProfile(),
      previousQuestions,
      previousAnswers,
    });
    expect(decision.ok).toBe(true);
    if (decision.ok) {
      expect(decision.reason).toBe("cores_resolved");
    }
  });

  it("allows completion at max questions even if cores remain open", () => {
    const previousQuestions = Array.from({ length: MAX_TOTAL_QUESTIONS }, (_, i) =>
      makeInterviewQuestion({
        questionId: `max-${i}`,
        decisionCategory: "customer_moment",
        sequenceNumber: i + 1,
        isConditional: i > 0,
      }),
    );
    const decision = canCompleteInterview({
      confirmedProfile: makeConfirmedProfile(),
      previousQuestions,
      previousAnswers: [],
    });
    expect(decision.ok).toBe(true);
    if (decision.ok) {
      expect(decision.reason).toBe("max_questions");
    }
  });

  it("does not allow cores_resolved with zero questions asked", () => {
    const decision = canCompleteInterview({
      confirmedProfile: makeConfirmedProfile(),
      previousQuestions: [],
      previousAnswers: [],
    });
    // Profile may satisfy trust_boundaries, but cores_resolved requires ≥1 question.
    expect(decision.ok).toBe(false);
  });
});
