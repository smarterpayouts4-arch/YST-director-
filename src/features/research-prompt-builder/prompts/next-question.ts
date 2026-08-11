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
  const strategicFirst = input.contextPacket.packet.requireStrategicDirection;

  const modeBranch = strategicFirst
    ? [
        "Mode: strategic_direction (unresolved strategic research priorities; at most once per interview).",
        "questionKind MUST be \"strategic_direction\". decisionCategory MUST be \"strategic_direction\".",
        "Ask because strategic priorities are still unresolved — not because a question counter says Q1.",
        "Frame the question as which directions the RESEARCH should test, not which strategy to adopt.",
        "Produce 3 strategicSuggestions by default (absolute max 5). Each is a perception bet:",
        "positioning, trust, differentiation, value framing, or category narrative — NEVER a channel or tactic.",
        "Each card must change what research investigates if chosen alone.",
        "Card fields:",
        "- title: short direction name (no Instagram/TikTok/SEO/ads tactics in the title)",
        "- description: the positioning idea",
        "- rationale: \"why this may fit\" — assert only what cited evidenceAllowlist keys support; hedge with \"may\"; never invent audiences, demographics, or motivations",
        "- researchFocus: \"research should test\" — what investigation looks like",
        "- classification: always \"working_hypothesis\"",
        "- evidenceRefs: 1–3 keys drawn ONLY from packet.evidenceAllowlist[].key",
        "suggestedAnswer MUST be null. strategicSuggestions MUST be non-empty (3–5).",
        "resolvesBriefFields: name brief fields this selection can later populate (e.g. contentHypothesis).",
      ].join("\n")
    : [
        "Mode: standard (follow-up owner decision).",
        "questionKind MUST be \"standard\". decisionCategory MUST NOT be \"strategic_direction\".",
        "strategicSuggestions MUST be []. suggestedAnswer MUST be a complete, company-specific draft the owner can accept.",
        "Build on any owner-selected strategic hypotheses in prior answers; do not re-ask positioning.",
        "Owner-only rule (critical): never ask what rigorous external research should discover.",
        "Ask only for an internal decision, constraint, priority, or intention that materially changes what should be researched.",
        "Forbidden market-fact asks: who competitors are, what is trending, what customers search for,",
        "which platforms perform best, what content gaps exist, market size, or demographics of the market.",
      ].join("\n");

  const instructions = [
    SHARED_ANALYST_PERSONA,
    "",
    "Outcome: Produce the single next best interview question, or signal completion.",
    "Ask one decision only.",
    "All six quality scores must be at least 4.",
    "Core decisions to resolve: customer_moment, viewer_reward, business_bridge, trust_boundaries, challenge_assumption.",
    `Hard max ${MAX_TOTAL_QUESTIONS} questions (${MAX_CORE_QUESTIONS} core categories, up to ${MAX_CONDITIONAL_QUESTIONS} conditional).`,
    "There is no target question count and no 'typical N questions' goal. Prefer information gain; stop when material decisions are resolved.",
    "",
    modeBranch,
    "",
    "Short-form owner UX (critical): people skim. Write like a punchy hook, not a brief.",
    "- question: ONE sentence, max 180 characters. Never a stacked multi-clause survey item.",
    "- whyThisMatters: ONE sentence, max 140 characters. Payoff for the final research prompt.",
    "- whatWeNoticed: ONE sentence, max 200 characters. Context + conflict only (X is true, but Y is open).",
    "- suggestedAnswer (standard only): ONE or TWO short sentences, max 280 characters. Plain owner voice.",
    "- No em dashes or en dashes. No 'Observed fact:' / 'Working hypothesis:' label stacks in owner-facing strings.",
    "- Validation rejects overlong strings and em/en dashes; keep answers repairable in one pass.",
    "",
    "Narrative / interview governance:",
    "- Audience-first: prefer questions that clarify the customer moment and viewer reward before company promotion.",
    "- Dance: connect with but/therefore energy, not and-then lists.",
    "- Ethical single-decision: Trigger (sharp notice) -> Action (one question) -> Reward (sharper exported prompt). No multi-part questions, gamification, or dark-pattern pressure.",
    "",
    "Do not ask for information already confirmed.",
    "Do not ask multi-part questions.",
    "Do not ask the owner to invent marketing jargon.",
    "Do not ask for video production, scripts, shot lists, or scroll-retention tactics.",
    `Prompt version: ${RUNTIME_PROMPT_VERSION}`,
  ].join("\n");

  const user = [
    strategicFirst
      ? "Return a strategic_direction interview question object (done:false), or {\"done\": true, \"completionReason\": \"...\"} only if the profile is unusable."
      : "Return either a next interview question object, or {\"done\": true, \"completionReason\": \"...\"}.",
    wrapUntrustedJson("INTERVIEW_CONTEXT", {
      packet: input.contextPacket.packet,
      provenanceNotes: input.contextPacket.provenanceNotes,
      truncationWarnings: input.contextPacket.truncationWarnings,
    }),
  ].join("\n\n");

  return { instructions, input: user };
}
