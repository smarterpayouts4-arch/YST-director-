import type { InterviewContextPacket } from "@/ai/context";
import { RUNTIME_PROMPT_VERSION } from "@/features/research-prompt-builder/prompts/prompt-version";
import {
  SHARED_ANALYST_PERSONA,
  wrapUntrustedJson,
} from "@/features/research-prompt-builder/prompts/shared-guardrails";
import {
  MAX_CONDITIONAL_QUESTIONS,
  MAX_CORE_QUESTIONS,
  MAX_TOTAL_QUESTIONS,
} from "@/features/research-prompt-builder/config/constants";

export function buildNextQuestionPrompt(input: {
  contextPacket: InterviewContextPacket;
}) {
  const instructions = [
    SHARED_ANALYST_PERSONA,
    "",
    "Outcome: Produce the single next best interview question, or signal completion.",
    "Ask one decision only. Provide a company-specific suggested answer.",
    "All six quality scores must be at least 4.",
    "Core decisions to resolve: customer_moment, viewer_reward, business_bridge, trust_boundaries, challenge_assumption.",
    `Usually ${MAX_CORE_QUESTIONS} core questions, up to ${MAX_CONDITIONAL_QUESTIONS} conditional, hard max ${MAX_TOTAL_QUESTIONS}.`,
    "",
    "Narrative / interview governance:",
    "- Audience-first: prefer questions that clarify the customer moment and viewer reward before company promotion.",
    "- Context+conflict (Dance): ground whatWeNoticed in evidence (“data suggests X”) and name the unresolved conflict (“but Y is unclear”).",
    "- Story lens: when relevant, ask what unique educational angle would make this company a category of one — not generic industry tips.",
    "- Label provenance in whatWeNoticed and whyThisMatters: observed fact vs working hypothesis vs restriction.",
    "- Ethical single-decision questions: Trigger (sharp observation) → Action (one material question) → Reward (why the answer sharpens strategy). No multi-part or dark-pattern pressure.",
    "",
    "Do not ask for information already confirmed.",
    "Do not ask multi-part questions.",
    "Do not ask the owner to invent marketing jargon.",
    "Do not ask for video production, scripts, shot lists, or scroll-retention tactics.",
    `Prompt version: ${RUNTIME_PROMPT_VERSION}`,
  ].join("\n");

  const user = [
    "Return either a next interview question object, or {\"done\": true, \"completionReason\": \"...\"}.",
    wrapUntrustedJson("INTERVIEW_CONTEXT", {
      packet: input.contextPacket.packet,
      provenanceNotes: input.contextPacket.provenanceNotes,
      truncationWarnings: input.contextPacket.truncationWarnings,
    }),
  ].join("\n\n");

  return { instructions, input: user };
}
