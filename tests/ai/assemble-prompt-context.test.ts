import { describe, expect, it } from "vitest";
import {
  assemblePromptContext,
  buildSuppliedAssumptions,
} from "@/ai/context/assemble-prompt-context";
import { CONTEXT_BUDGETS } from "@/ai/context/budgets";
import { buildResearchPromptCompilerPrompt } from "@/features/research-prompt-builder/prompts/research-prompt";
import { makeConfirmedProfile } from "../fixtures/api/confirmed-profile";
import { makeResearchBrief } from "../fixtures/api/research-brief";

describe("assemblePromptContext supplied assumptions + budget", () => {
  it("emits stable assumption ids from hypothesis provenance", () => {
    const brief = makeResearchBrief();
    const assumptions = buildSuppliedAssumptions(brief);
    expect(assumptions.map((a) => a.id).sort()).toEqual([
      "hypothesis:challengeHypothesis",
      "hypothesis:contentHypothesis",
    ]);
    expect(
      assumptions.find((a) => a.id === "hypothesis:contentHypothesis")?.origin,
    ).toBe("owner_selected_hypothesis");
  });

  it("keeps the prompt compiler packet under the char budget", () => {
    const packet = assemblePromptContext({
      confirmedProfile: makeConfirmedProfile(),
      researchBrief: makeResearchBrief(),
      model: "gpt-5.6-terra",
      promptVersion: "1.1.0",
      companyProfileVersion: "profile-v1",
    });
    expect(packet.charCount).toBeLessThanOrEqual(CONTEXT_BUDGETS.promptChars);
    expect(packet.packet.suppliedAssumptions.length).toBeGreaterThan(0);
  });

  it("keeps compiler instructions compact after rule-table compression", () => {
    const packet = assemblePromptContext({
      confirmedProfile: makeConfirmedProfile(),
      researchBrief: makeResearchBrief(),
      model: "gpt-5.6-terra",
      promptVersion: "1.1.0",
      companyProfileVersion: "profile-v1",
    });
    const { instructions } = buildResearchPromptCompilerPrompt({
      contextPacket: packet,
    });
    // Qualitative density only — no numeric target bands leaked to the model.
    expect(instructions).toMatch(/concise and information-dense/i);
    expect(instructions).not.toMatch(/4,?500|6,?500|8,?500|11,?000/);
    // Compression regression guard: checklist is rendered once from the rule table.
    // Ceiling raised for opportunity-first experiment family requirements (still one checklist).
    expect(instructions.length).toBeLessThan(8500);
    expect(instructions).toMatch(/Hypothesis-blind discovery/i);
    expect(instructions).toMatch(/opportunity comes first/i);
  });
});
