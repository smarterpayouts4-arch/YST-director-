import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonRequest, codedError } from "./helpers";
import { makeConfirmedProfile } from "../fixtures/api/confirmed-profile";
import { makeInterviewQuestion } from "../fixtures/api/interview-question";

vi.mock(
  "@/features/research-prompt-builder/services/generate-next-question",
  () => ({ generateNextQuestion: vi.fn() }),
);

import { POST } from "@/app/api/interview/next/route";
import { generateNextQuestion } from "@/features/research-prompt-builder/services/generate-next-question";

const mockedNext = vi.mocked(generateNextQuestion);

beforeEach(() => {
  mockedNext.mockReset();
});

describe("POST /api/interview/next", () => {
  it("returns the next question for a valid profile", async () => {
    mockedNext.mockResolvedValue({
      done: false,
      question: makeInterviewQuestion(),
    } as never);
    const res = await POST(
      jsonRequest({ confirmedProfile: makeConfirmedProfile() }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.done).toBe(false);
    expect(body.question.questionId).toBe("q1");
  });

  it("defaults missing arrays before invoking the service", async () => {
    mockedNext.mockResolvedValue({
      done: true,
      completionReason: "Required strategic decisions are resolved.",
    } as never);
    const profile = makeConfirmedProfile();
    await POST(jsonRequest({ confirmedProfile: profile }));
    expect(mockedNext).toHaveBeenCalledWith({
      confirmedProfile: profile,
      previousQuestions: [],
      previousAnswers: [],
      unresolvedUnknowns: [],
    });
  });

  it("returns done with a completion reason", async () => {
    mockedNext.mockResolvedValue({
      done: true,
      completionReason: "Core decisions resolved.",
    } as never);
    const res = await POST(
      jsonRequest({ confirmedProfile: makeConfirmedProfile() }),
    );
    const body = await res.json();
    expect(body.done).toBe(true);
    expect(body.completionReason).toBeTruthy();
  });

  it("maps invalid model output to 400 MODEL_OUTPUT_INVALID", async () => {
    mockedNext.mockRejectedValue(
      codedError("Structured output failed validation.", "MODEL_OUTPUT_INVALID"),
    );
    const res = await POST(
      jsonRequest({ confirmedProfile: makeConfirmedProfile() }),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("MODEL_OUTPUT_INVALID");
  });

  it("maps invalid input (schema rejection) safely", async () => {
    mockedNext.mockRejectedValue(codedError("Invalid profile.", "INVALID_INPUT"));
    const res = await POST(jsonRequest({ confirmedProfile: {} }));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("INVALID_INPUT");
  });

  it("maps unknown errors to 500 OPENAI_ERROR", async () => {
    mockedNext.mockRejectedValue(new Error("boom"));
    const res = await POST(
      jsonRequest({ confirmedProfile: makeConfirmedProfile() }),
    );
    expect(res.status).toBe(500);
    expect((await res.json()).error.code).toBe("OPENAI_ERROR");
  });
});
