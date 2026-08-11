import { LIBRARY_RUNTIME_PROMPT_VERSION } from "@/features/content-intelligence/library/prompts/prompt-version";
import {
  LIBRARIAN_PERSONA,
  wrapUntrustedJson,
} from "@/features/content-intelligence/library/prompts/shared-guardrails";

export function buildExtractContentIntelligencePrompt(input: {
  researchText: string;
}) {
  const instructions = [
    LIBRARIAN_PERSONA,
    "",
    "Outcome: Extract discrete intelligence items grounded only in the completed research.",
    "Allowed kinds: fact, audience, moment, tension, opportunity, demand, competitor, restriction, unresolved, limitation, other.",
    "Evidence is metadata: put supporting quotes in evidenceQuote and sources in sourceRefs — do not invent an 'evidence' kind.",
    "Distinguish observed claims from hypotheses via isHypothesis.",
    "If the research is insufficient for a kind, omit it — do not invent pains, competitors, or demand.",
    "Prefer fewer high-quality items over exhaustive speculation.",
    "For each item, provenance must say where in the research the claim came from (section/theme), not how the record was edited later.",
    `Prompt version: ${LIBRARY_RUNTIME_PROMPT_VERSION}`,
  ].join("\n");

  const user = wrapUntrustedJson("COMPLETED_RESEARCH", {
    researchText: input.researchText,
  });

  return { instructions, input: user, promptVersion: LIBRARY_RUNTIME_PROMPT_VERSION };
}
