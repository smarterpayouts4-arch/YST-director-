import type {
  ConfirmedCompanyProfile,
  InterviewAnswer,
  InterviewQuestion,
} from "@/features/research-prompt-builder/schemas";
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
  confirmedProfile: ConfirmedCompanyProfile;
  previousQuestions: InterviewQuestion[];
  previousAnswers: InterviewAnswer[];
  unresolvedUnknowns: string[];
  remainingSlots: number;
}) {
  const instructions = [
    SHARED_ANALYST_PERSONA,
    "",
    "Outcome: Produce the single next best interview question, or signal completion.",
    "Ask one decision only. Provide a company-specific suggested answer.",
    "All six quality scores must be at least 4.",
    "Core decisions to resolve: customer_moment, viewer_reward, business_bridge, trust_boundaries, challenge_assumption.",
    `Usually ${MAX_CORE_QUESTIONS} core questions, up to ${MAX_CONDITIONAL_QUESTIONS} conditional, hard max ${MAX_TOTAL_QUESTIONS}.`,
    "Do not ask for information already confirmed.",
    "Do not ask multi-part questions.",
    "Do not ask the owner to invent marketing jargon.",
    `Prompt version: ${RUNTIME_PROMPT_VERSION}`,
  ].join("\n");

  const user = [
    "Return either a next interview question object, or {\"done\": true, \"completionReason\": \"...\"}.",
    wrapUntrustedJson("INTERVIEW_CONTEXT", {
      confirmedProfile: input.confirmedProfile,
      previousQuestions: input.previousQuestions,
      previousAnswers: input.previousAnswers,
      unresolvedUnknowns: input.unresolvedUnknowns,
      remainingSlots: input.remainingSlots,
    }),
  ].join("\n\n");

  return { instructions, input: user };
}
