import { describe, expect, it } from "vitest";
import { assemblePromptContext } from "@/ai/context/assemble-prompt-context";
import { buildResearchPromptCompilerPrompt } from "@/features/research-prompt-builder/prompts/research-prompt";
import { PROMPT_CONTRACT_RULES } from "@/features/research-prompt-builder/validation/prompt-contract-rules";
import { makeConfirmedProfile } from "../fixtures/api/confirmed-profile";
import { makeResearchBrief } from "../fixtures/api/research-brief";

function compilerInstructions(profileOverrides: Parameters<typeof makeConfirmedProfile>[0] = {}) {
  const packet = assemblePromptContext({
    confirmedProfile: makeConfirmedProfile(profileOverrides),
    researchBrief: makeResearchBrief(),
    model: "gpt-5.6-terra",
    promptVersion: "1.1.0",
    companyProfileVersion: "profile-v1",
  });
  return buildResearchPromptCompilerPrompt({ contextPacket: packet }).instructions;
}

const LEAK_TOKENS = [
  "magnesium",
  "youtube",
  "tiktok",
  "instagram",
  "shorts",
  "supplement",
  "restaurant",
  "debt collection",
];

const DOMAINS = [
  {
    name: "consumer retail",
    industry: "Consumer retail / product comparison",
    offer: "Independent product comparison and guided shopping education",
  },
  {
    name: "hospitality",
    industry: "Local hospitality / dining service",
    offer: "Neighborhood dining reservation and experience guidance",
  },
  {
    name: "B2B professional",
    industry: "B2B professional services",
    offer: "Advisory service for mid-market operations decisions",
  },
  {
    name: "SaaS",
    industry: "B2B software / SaaS",
    offer: "Workflow automation software for operations teams",
  },
] as const;

describe("research-prompt opportunity instruction contract", () => {
  it("requires per-experiment commercial bridge without a second per-experiment CTA field", () => {
    const instructions = compilerInstructions();
    expect(instructions).toMatch(/commercial bridge/i);
    expect(instructions).toMatch(/none warranted/i);
    expect(instructions).toMatch(
      /do not require a second duplicative per-experiment CTA field/i,
    );
    expect(instructions).toMatch(/report-level/i);
    expect(instructions).toMatch(/primary platform/i);
    expect(instructions).toMatch(/strategic CTA hypothesis/i);
    expect(instructions).toMatch(/none\/weak/i);
  });

  it("defines topic and planted question as distinct roles", () => {
    const instructions = compilerInstructions();
    expect(instructions).toMatch(/topic \(subject being explored\)/i);
    expect(instructions).toMatch(
      /planted question \(curiosity mechanism created by the tension/i,
    );
    expect(instructions).toMatch(/not a restatement of topic/i);
  });

  it("keeps six-slot honesty and invent-nothing language", () => {
    const instructions = compilerInstructions();
    expect(instructions).toContain(
      "Six experiments does not imply six distinct customer problems",
    );
    expect(instructions).toMatch(/Do not invent misconceptions/i);
    expect(instructions).toMatch(
      /vary moment, planted question, evidence angle, viewer reward, or comparison frame/i,
    );
  });

  it("scopes checklist CTA to report-level without changing the matcher", () => {
    const cta = PROMPT_CONTRACT_RULES.find((r) => r.id === "cta");
    expect(cta).toBeDefined();
    expect(cta!.requirement).toMatch(/report-level/i);
    expect(cta!.requirement).toMatch(/distinct from per-experiment commercial bridge/i);
    expect(cta!.requirement).toMatch(/none\/weak/i);
    expect(cta!.repairHint).toMatch(/Do not add a second duplicative per-experiment CTA field/i);
    expect(cta!.matcher).toEqual({ pattern: /\bCTA\b|call[- ]to[- ]action/i });
  });

  it("stays company-agnostic across four decision environments", () => {
    for (const domain of DOMAINS) {
      const instructions = compilerInstructions({
        fields: {
          ...makeConfirmedProfile().fields,
          industry: {
            value: domain.industry,
            status: "confirmed",
            originalClassification: "observed_fact",
            confidence: "high",
            evidenceRefs: ["row:domain"],
          },
          offer: {
            value: domain.offer,
            status: "confirmed",
            originalClassification: "observed_fact",
            confidence: "high",
            evidenceRefs: ["row:domain"],
          },
          companyName: {
            value: `Example ${domain.name}`,
            status: "confirmed",
            originalClassification: "observed_fact",
            confidence: "high",
            evidenceRefs: ["row:domain"],
          },
        },
      });

      expect(instructions, domain.name).toMatch(/opportunity comes first/i);
      expect(instructions, domain.name).toContain(
        "Six experiments does not imply six distinct customer problems",
      );
      expect(instructions, domain.name).toMatch(/Do not invent misconceptions/i);
      expect(instructions, domain.name).toMatch(
        /do not require a second duplicative per-experiment CTA field/i,
      );

      const lowered = instructions.toLowerCase();
      for (const token of LEAK_TOKENS) {
        expect(lowered, `${domain.name} leaked ${token}`).not.toContain(token);
      }
    }
  });
});
