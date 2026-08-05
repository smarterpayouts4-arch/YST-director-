import type {
  ConfirmedCompanyProfile,
  ResearchBrief,
} from "@/features/research-prompt-builder/schemas";
import { RUNTIME_PROMPT_VERSION } from "@/features/research-prompt-builder/prompts/prompt-version";
import {
  SHARED_ANALYST_PERSONA,
  wrapUntrustedJson,
} from "@/features/research-prompt-builder/prompts/shared-guardrails";

export function buildResearchPromptCompilerPrompt(input: {
  confirmedProfile: ConfirmedCompanyProfile;
  researchBrief: ResearchBrief;
  model: string;
  promptVersion: string;
  companyProfileVersion: string;
}) {
  const instructions = [
    SHARED_ANALYST_PERSONA,
    "",
    "Outcome: Produce structured sections for one copy-ready ChatGPT market and social-content research prompt.",
    "The prompt must begin with audience value, require disconfirming evidence, classify competitors,",
    "score opportunities across demand/relevance/authority/feasibility/risk,",
    "and request 3 content pillars with 2 experiments each, one primary platform, one CTA hypothesis,",
    "and clear success/failure criteria. Do not request twenty disconnected topics.",
    "Do not invent rejected fields. Do not dump raw CSV.",
    `Prompt version: ${RUNTIME_PROMPT_VERSION}`,
  ].join("\n");

  const user = [
    "Compile the final research prompt sections.",
    wrapUntrustedJson("PROMPT_COMPILER_INPUT", {
      confirmedProfile: input.confirmedProfile,
      researchBrief: input.researchBrief,
      metadataHints: {
        model: input.model,
        promptVersion: input.promptVersion,
        companyProfileVersion: input.companyProfileVersion,
        researchBriefVersion: "1.0.0",
        generatedAt: new Date().toISOString(),
      },
    }),
  ].join("\n\n");

  return { instructions, input: user };
}
