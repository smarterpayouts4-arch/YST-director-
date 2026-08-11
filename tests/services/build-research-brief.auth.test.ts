import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/features/research-prompt-builder/services/structured-openai", () => ({
  parseStructuredOutput: vi.fn(),
}));

import { parseStructuredOutput } from "@/features/research-prompt-builder/services/structured-openai";
import { buildResearchBrief } from "@/features/research-prompt-builder/services/build-research-brief";
import { CORE_CATEGORIES } from "@/features/research-prompt-builder/lib/core-coverage";
import { makeConfirmedProfile } from "../fixtures/api/confirmed-profile";
import {
  makeInterviewAnswer,
  makeInterviewQuestion,
} from "../fixtures/api/interview-question";

const mockedParse = vi.mocked(parseStructuredOutput);

function coverAllCores() {
  const questions = CORE_CATEGORIES.map((decisionCategory, index) =>
    makeInterviewQuestion({
      questionId: `q-${decisionCategory}`,
      decisionCategory,
      sequenceNumber: index + 1,
    }),
  );
  const answers = questions.map((q) =>
    makeInterviewAnswer({ questionId: q.questionId }),
  );
  return { questions, answers };
}

describe("buildResearchBrief server authority", () => {
  it("rejects brief construction when cores are unresolved (UI bypass)", async () => {
    mockedParse.mockClear();
    const question = makeInterviewQuestion({
      questionId: "q1",
      decisionCategory: "customer_moment",
    });

    await expect(
      buildResearchBrief({
        confirmedProfile: makeConfirmedProfile(),
        questions: [question],
        answers: [makeInterviewAnswer({ questionId: question.questionId })],
      }),
    ).rejects.toMatchObject({ code: "INVALID_INPUT" });

    expect(mockedParse).not.toHaveBeenCalled();
  });

  it("allows brief construction when canCompleteInterview is true", async () => {
    mockedParse.mockResolvedValue({ title: "ok" } as never);
    const { questions, answers } = coverAllCores();

    await buildResearchBrief({
      confirmedProfile: makeConfirmedProfile(),
      questions,
      answers,
    });

    expect(mockedParse).toHaveBeenCalledTimes(1);
  });
});
