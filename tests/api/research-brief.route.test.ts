import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonRequest, codedError } from "./helpers";
import { makeConfirmedProfile } from "../fixtures/api/confirmed-profile";
import {
  makeInterviewAnswer,
  makeInterviewQuestion,
} from "../fixtures/api/interview-question";
import { makeResearchBrief } from "../fixtures/api/research-brief";

vi.mock(
  "@/features/research-prompt-builder/services/build-research-brief",
  () => ({ buildResearchBrief: vi.fn() }),
);

import { POST } from "@/app/api/research-brief/route";
import { buildResearchBrief } from "@/features/research-prompt-builder/services/build-research-brief";

const mockedBuild = vi.mocked(buildResearchBrief);

beforeEach(() => {
  mockedBuild.mockReset();
});

describe("POST /api/research-brief", () => {
  it("returns a research brief for valid inputs", async () => {
    mockedBuild.mockResolvedValue(makeResearchBrief() as never);
    const res = await POST(
      jsonRequest({
        confirmedProfile: makeConfirmedProfile(),
        questions: [makeInterviewQuestion()],
        answers: [makeInterviewAnswer()],
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.researchBrief.primaryPlatform.value).toBe("YouTube");
  });

  it("defaults missing question/answer arrays", async () => {
    mockedBuild.mockResolvedValue(makeResearchBrief() as never);
    const profile = makeConfirmedProfile();
    await POST(jsonRequest({ confirmedProfile: profile }));
    expect(mockedBuild).toHaveBeenCalledWith({
      confirmedProfile: profile,
      questions: [],
      answers: [],
    });
  });

  it("maps repair failure to 400 MODEL_OUTPUT_INVALID", async () => {
    mockedBuild.mockRejectedValue(
      codedError("Structured output failed validation.", "MODEL_OUTPUT_INVALID"),
    );
    const res = await POST(
      jsonRequest({ confirmedProfile: makeConfirmedProfile() }),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("MODEL_OUTPUT_INVALID");
  });

  it("maps timeouts to REQUEST_TIMEOUT", async () => {
    mockedBuild.mockRejectedValue(codedError("Request timeout.", "REQUEST_TIMEOUT"));
    const res = await POST(
      jsonRequest({ confirmedProfile: makeConfirmedProfile() }),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("REQUEST_TIMEOUT");
  });

  it("maps unknown errors to 500 OPENAI_ERROR with a request id", async () => {
    mockedBuild.mockRejectedValue(new Error("boom"));
    const res = await POST(
      jsonRequest({ confirmedProfile: makeConfirmedProfile() }),
    );
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.code).toBe("OPENAI_ERROR");
    expect(body.error.requestId).toBeTruthy();
  });
});
