import { describe, expect, it } from "vitest";
import { formatResearchPrompt } from "@/features/research-prompt-builder/formatters/format-research-prompt";
import { buildResearchPromptCompilerPrompt } from "@/features/research-prompt-builder/prompts/research-prompt";
import { assemblePromptContext } from "@/ai/context/assemble-prompt-context";
import { makeFinalPrompt } from "../fixtures/api/final-prompt";
import { makeConfirmedProfile } from "../fixtures/api/confirmed-profile";
import { makeResearchBrief } from "../fixtures/api/research-brief";

/**
 * Scope-boundary guard: the product ends after generating, validating, and
 * exporting one company-specific ChatGPT research prompt. The exported prompt
 * must stay a research request — never an execution plan and never a channel
 * for raw uploaded data.
 */
describe("final prompt scope boundary", () => {
  const markdown = formatResearchPrompt(makeFinalPrompt());

  it("does not instruct this application to conduct the research itself", () => {
    expect(markdown).not.toMatch(/the app(?:lication)? will (?:conduct|perform|run) the research/i);
    expect(markdown).not.toMatch(/research prompt builder will execute/i);
  });

  it("does not introduce video production, scripts, or campaign execution", () => {
    expect(markdown).not.toMatch(/seven[- ]scene|scroll[- ]retention|script looping|shot list/i);
    expect(markdown).not.toMatch(/storyboard|filming schedule|editing timeline/i);
    expect(markdown).not.toMatch(/launch the campaign|ad spend|media buy/i);
  });

  it("does not contain raw CSV content", () => {
    // Header-like CSV rows only (no spaces / prose). Comma lists in English are fine.
    expect(markdown).not.toMatch(/^\s*[A-Za-z0-9_]+(?:,[A-Za-z0-9_]+){3,}\s*$/m);
    expect(markdown).not.toMatch(/evidenceRows|columnSummaries|fileHash/);
  });

  it("contains the explicit research-output definition of done and stops there", () => {
    expect(markdown).toMatch(/return the completed research output only/i);
    expect(markdown).toMatch(/do not propose additional workflows|do not offer alternative workflows/i);
    expect(markdown.startsWith("EXECUTE THIS RESEARCH NOW.")).toBe(true);
    const lastSection = markdown.split("## 8. QUALITY CHECK BEFORE SUBMISSION")[1];
    expect(lastSection).toMatch(/return the completed research output only/i);
    expect(lastSection).toMatch(/do not ask follow-up questions/i);
  });
});

describe("prompt compiler scope boundary", () => {
  const contextPacket = assemblePromptContext({
    confirmedProfile: makeConfirmedProfile(),
    researchBrief: makeResearchBrief(),
    model: "gpt-5.6-terra",
    promptVersion: "1.0.0",
    companyProfileVersion: "profile-v1",
  });
  const compilerPrompt = buildResearchPromptCompilerPrompt({ contextPacket });

  it("compiler context never includes raw CSV rows", () => {
    const serialized = JSON.stringify(contextPacket.packet);
    expect(serialized).not.toContain("evidenceRows");
    expect(serialized).not.toContain("columnSummaries");
    expect(contextPacket.provenanceNotes.join(" ")).toMatch(/no raw CSV/i);
  });

  it("compiler instructions demand the stop line and forbid video production", () => {
    const text = compilerPrompt.instructions;
    // The stop line the compiled prompt must carry.
    expect(text).toMatch(/return the completed research output only/i);
    expect(text).toMatch(/do not propose additional workflows/i);
    // Video production must appear only as an explicit prohibition.
    expect(text).toMatch(/do not include video production/i);
    expect(text).toMatch(/do not dump raw csv/i);
  });

  it("compiler instructions include the export-gate must-include checklist", () => {
    const text = compilerPrompt.instructions;
    expect(text).toMatch(/Must-include checklist/i);
    expect(text).toMatch(/3 content pillars/i);
    expect(text).toMatch(/primary platform/i);
    expect(text).toMatch(/success\/failure/i);
  });
});
