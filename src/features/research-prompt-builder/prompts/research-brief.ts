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
    "Outcome: Build an owner-approvable research brief.",
    "Preserve owner-confirmed meaning. Keep assumptions labeled.",
    "Lead with audience value before company promotion.",
    "Include a challenge hypothesis research must try to disprove.",
    "Do not recommend every platform. Prefer one primary platform.",
    `Prompt version: ${RUNTIME_PROMPT_VERSION}`,
  ].join("\n");

  const user = [
    "Compile the research brief from the confirmed profile and interview answers.",
    wrapUntrustedJson("BRIEF_INPUT", {
      packet: input.contextPacket.packet,
      provenanceNotes: input.contextPacket.provenanceNotes,
      truncationWarnings: input.contextPacket.truncationWarnings,
    }),
  ].join("\n\n");

  return { instructions, input: user };
}
