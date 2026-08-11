import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/features/research-prompt-builder/services/structured-openai", () => ({
  parseStructuredOutput: vi.fn(),
}));

vi.mock("@/ai/context", async () => {
  const actual = await vi.importActual<typeof import("@/ai/context")>("@/ai/context");
  return {
    ...actual,
    assembleInterviewContext: vi.fn(() => ({
      operationId: "generate-next-question",
      contractIds: ["confirmed-profile", "interview-question", "interview-answer"],
      schemaVersions: {},
      packet: {
        profileSummary: [],
        evidenceAllowlist: [],
        priorQa: [],
        unresolvedUnknowns: [],
        remainingSlots: 6,
        requireStrategicDirection: false,
        coreResolutions: [],
        unresolvedCoreCategories: ["customer_moment"],
      },
      provenanceNotes: [],
      truncationWarnings: [],
      charCount: 100,
    })),
    evidenceAllowlistKeySet: vi.fn(() => new Set<string>()),
  };
});

import { parseStructuredOutput } from "@/features/research-prompt-builder/services/structured-openai";
import { generateNextQuestion } from "@/features/research-prompt-builder/services/generate-next-question";
import { makeConfirmedProfile } from "../fixtures/api/confirmed-profile";
import {
  makeInterviewAnswer,
  makeInterviewQuestion,
} from "../fixtures/api/interview-question";

const mockedParse = vi.mocked(parseStructuredOutput);

beforeEach(() => {
  mockedParse.mockReset();
});

describe("generateNextQuestion server authority", () => {
  it("rejects model done:true when cores remain unresolved", async () => {
    mockedParse.mockImplementation(async (args) => {
      const value = {
        done: true,
        completionReason: "I think we have enough information already.",
        question: null,
      };
      const issues = args.validate?.(value as never) ?? [];
      if (issues.length) {
        throw Object.assign(
          new Error(`Structured output failed validation: ${issues.join("; ")}`),
          { code: "MODEL_OUTPUT_INVALID" as const },
        );
      }
      return value as never;
    });

    const question = makeInterviewQuestion({
      questionId: "q1",
      decisionCategory: "customer_moment",
    });

    await expect(
      generateNextQuestion({
        confirmedProfile: makeConfirmedProfile(),
        previousQuestions: [question],
        previousAnswers: [makeInterviewAnswer({ questionId: question.questionId })],
        unresolvedUnknowns: [],
      }),
    ).rejects.toMatchObject({ code: "MODEL_OUTPUT_INVALID" });
  });
});
