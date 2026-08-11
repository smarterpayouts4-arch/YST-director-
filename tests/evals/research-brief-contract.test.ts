import { describe, expect, it } from "vitest";
import { buildResearchBriefPrompt } from "@/features/research-prompt-builder/prompts/research-brief";
import { RUNTIME_PROMPT_VERSION } from "@/features/research-prompt-builder/prompts/prompt-version";
import type { BriefContextPacket } from "@/ai/context";

function makePacket(): BriefContextPacket {
  return {
    operationId: "build-research-brief",
    contractIds: ["confirmed-profile", "interview-question", "interview-answer"],
    schemaVersions: {
      "confirmed-profile": "1.0.0",
      "interview-question": "1.0.0",
      "interview-answer": "1.0.0",
    },
    packet: {
      confirmedProfile: {
        profileVersion: "1.0.0",
        ownerNotes: "",
        fields: [],
      },
      acceptedAnswers: [],
      decisionLedger: {
        profileVersion: "1.0.0",
        counts: {
          confirmed_profile: 0,
          owner_answer: 0,
          owner_selected_hypothesis: 0,
          owner_brief_edit: 0,
          model_hypothesis: 0,
        },
        records: [],
      },
    },
    provenanceNotes: [],
    truncationWarnings: [],
    charCount: 100,
  } as unknown as BriefContextPacket;
}

describe("research-brief instruction contract", () => {
  it("stamps runtime prompt version", () => {
    const { instructions } = buildResearchBriefPrompt({ contextPacket: makePacket() });
    expect(instructions).toContain(`Prompt version: ${RUNTIME_PROMPT_VERSION}`);
  });

  it("encodes agency-brief, provenance, and scope boundaries", () => {
    const { instructions, input } = buildResearchBriefPrompt({
      contextPacket: makePacket(),
    });
    expect(instructions).toMatch(/fieldProvenance/);
    expect(instructions).toMatch(/Audience-first/);
    expect(instructions).toMatch(/Do not draft the final ChatGPT research prompt/i);
    expect(instructions).toMatch(/video scripts/i);
    expect(input).toContain("BEGIN_UNTRUSTED_BRIEF_INPUT");
  });
});
