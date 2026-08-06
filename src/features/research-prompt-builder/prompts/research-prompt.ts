import type { PromptContextPacket } from "@/ai/context";
import { RUNTIME_PROMPT_VERSION } from "@/features/research-prompt-builder/prompts/prompt-version";
import {
  SHARED_ANALYST_PERSONA,
  wrapUntrustedJson,
} from "@/features/research-prompt-builder/prompts/shared-guardrails";

export function buildResearchPromptCompilerPrompt(input: {
  contextPacket: PromptContextPacket;
}) {
  const instructions = [
    SHARED_ANALYST_PERSONA,
    "",
    "Outcome: Produce structured sections for one copy-ready ChatGPT market and social-content research prompt.",
    "",
    "Narrative governance (research prompt quality — not video production):",
    "- Audience-first / customer moment: open company context and research questions with audience tension, not company promo.",
    "- Context+conflict (Dance): frame research as “evidence suggests X, but Y is unclear / contested.”",
    "- Story lens: require a distinct educational angle (category of one), not generic industry content.",
    "- Provenance labels: distinguish observed fact vs owner-confirmed decision vs working hypothesis vs research question vs restriction.",
    "- Ethical single-decision discipline carries into research questions: each research ask should be material and singular.",
    "",
    "Structural requirements:",
    "- Require disconfirming evidence and competitor classification (direct / adjacent / aspirational).",
    "- Score opportunities across demand/relevance/authority/feasibility/risk.",
    "- Request 3 content pillars with 2 experiments each (6 experiments), one primary platform, one CTA hypothesis,",
    "  and clear success/failure criteria. Do not request twenty disconnected topics.",
    "- Include an explicit stop line for ChatGPT: return the completed research output only; do not propose additional workflows.",
    "",
    "Do not invent rejected fields. Do not dump raw CSV.",
    "Do not include video production, scripts, shot lists, or scroll-retention instructions.",
    `Prompt version: ${RUNTIME_PROMPT_VERSION}`,
  ].join("\n");

  const user = [
    "Compile the final research prompt sections.",
    wrapUntrustedJson("PROMPT_COMPILER_INPUT", {
      packet: input.contextPacket.packet,
      provenanceNotes: input.contextPacket.provenanceNotes,
      truncationWarnings: input.contextPacket.truncationWarnings,
    }),
  ].join("\n\n");

  return { instructions, input: user };
}
