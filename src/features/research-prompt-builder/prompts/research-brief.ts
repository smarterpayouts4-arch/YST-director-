import type { BriefContextPacket } from "@/ai/context";
import { RUNTIME_PROMPT_VERSION } from "@/features/research-prompt-builder/prompts/prompt-version";
import {
  SHARED_ANALYST_PERSONA,
  wrapUntrustedJson,
} from "@/features/research-prompt-builder/prompts/shared-guardrails";

export function buildResearchBriefPrompt(input: {
  contextPacket: BriefContextPacket;
}) {
  const instructions = [
    SHARED_ANALYST_PERSONA,
    "",
    "Outcome: Build an owner-approvable research brief — a serious agency strategy contract, not a form dump.",
    "The brief must tell the owner clearly what they are getting: who we help, what tension education resolves, what bet we are making, how the company bridges after value, and what must stay off-limits.",
    "",
    "Narrative / brief governance:",
    "- Audience-first order in substance: customerMoment and viewerReward must be specific and vivid before company promotion.",
    "- Context + conflict (Dance): each major field should ground what is known and name the unresolved tension research must resolve — prefer “therefore / but” logic over “and then” laundry lists.",
    "- Story lens: contentHypothesis should state a category-of-one educational angle — not generic industry tips.",
    "- Anticipation + climax: challengeHypothesis must be a falsifiable claim research tries to disprove; executionContext should make the research assignment concrete enough to run.",
    "- Provenance: preserve owner-confirmed meaning; label working hypotheses vs confirmed decisions vs restrictions. Never invent facts.",
    "- Owner-selected strategic hypotheses in interview answers are research priorities to investigate, not validated strategy. Carry them into contentHypothesis / challengeHypothesis as hypotheses to test. Never promote unselected directions.",
    "- fieldProvenance is required for every brief field (customerMoment, viewerReward, challengeHypothesis, contentHypothesis, executionContext, companyTruth, businessBridge, primaryPlatform, trustBoundaries, unresolvedUnknowns).",
    "  origin must be one of: confirmed_profile | owner_answer | owner_selected_hypothesis | owner_brief_edit | model_hypothesis.",
    "  Use confirmed_profile / owner_answer / owner_selected_hypothesis when the field is explicitly grounded in those sources; otherwise model_hypothesis.",
    "  sourceRefs: profile field keys or suggestion ids (max 3). Never invent refs outside the input.",
    "- Trust: trustBoundaries stay non-negotiable and specific to this company.",
    "- Channel: recommend one primaryPlatform with a rationale tied to the customer moment — do not recommend every platform.",
    "- Tone: clear, executive, conversational enough to approve in one read — no dark-pattern urgency, gamification, or scroll-retention tactics.",
    "",
    "Do not draft the final ChatGPT research prompt here.",
    "Do not invent medical claims, dosages, or unrestricted efficacy language.",
    "Do not expand into video scripts, shot lists, or topic calendars.",
    `Prompt version: ${RUNTIME_PROMPT_VERSION}`,
  ].join("\n");

  const user = [
    "Compile the research brief from the confirmed profile and interview answers.",
    "Write each field so an agency client can approve the strategy without decoding internal jargon.",
    wrapUntrustedJson("BRIEF_INPUT", {
      packet: input.contextPacket.packet,
      provenanceNotes: input.contextPacket.provenanceNotes,
      truncationWarnings: input.contextPacket.truncationWarnings,
    }),
  ].join("\n\n");

  return { instructions, input: user };
}
