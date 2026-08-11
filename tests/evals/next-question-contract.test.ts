import { describe, expect, it } from "vitest";
import { buildNextQuestionPrompt } from "@/features/research-prompt-builder/prompts/next-question";
import { RUNTIME_PROMPT_VERSION } from "@/features/research-prompt-builder/prompts/prompt-version";
import type { InterviewContextPacket } from "@/ai/context";

function makePacket(
  requireStrategicDirection: boolean,
): InterviewContextPacket {
  return {
    operationId: "generate-next-question",
    contractIds: ["confirmed-profile", "interview-question", "interview-answer"],
    schemaVersions: {
      "confirmed-profile": "1.0.0",
      "interview-question": "1.0.0",
      "interview-answer": "1.0.0",
    },
    packet: {
      profileSummary: [],
      evidenceAllowlist: [],
      priorQa: [],
      unresolvedUnknowns: [],
      remainingSlots: 6,
      requireStrategicDirection,
      coreResolutions: [],
      unresolvedCoreCategories: [
        "customer_moment",
        "viewer_reward",
        "business_bridge",
        "trust_boundaries",
        "challenge_assumption",
      ],
    },
    provenanceNotes: [],
    truncationWarnings: [],
    charCount: 200,
  };
}

describe("next-question instruction contract", () => {
  it("stamps runtime prompt version", () => {
    const { instructions } = buildNextQuestionPrompt({
      contextPacket: makePacket(true),
    });
    expect(instructions).toContain(`Prompt version: ${RUNTIME_PROMPT_VERSION}`);
  });

  it("encodes completion, core categories, and short-form gates", () => {
    const { instructions, input } = buildNextQuestionPrompt({
      contextPacket: makePacket(false),
    });
    expect(instructions).toMatch(/customer_moment/);
    expect(instructions).toMatch(/Hard max 7 questions/);
    expect(instructions).toMatch(/All six quality scores must be at least 4/);
    expect(instructions).toMatch(/max 180 characters/);
    expect(instructions).toMatch(/Do not ask for video production/i);
    expect(input).toContain("BEGIN_UNTRUSTED_INTERVIEW_CONTEXT");
  });

  it("branches strategic_direction mode when required", () => {
    const { instructions } = buildNextQuestionPrompt({
      contextPacket: makePacket(true),
    });
    expect(instructions).toMatch(/Mode: strategic_direction/);
    expect(instructions).toMatch(/strategicSuggestions/);
  });
});
