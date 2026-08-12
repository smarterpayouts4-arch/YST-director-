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
    "Outcome: Extract discrete, reusable intelligence items grounded only in the completed research.",
    "",
    "Statement rules:",
    "- One reusable intelligence claim per item (who/what/when/constraint/demand/tension/opportunity/hypothesis).",
    "- Do not summarize entire paragraphs or rewrite the report as overview sentences.",
    "- Each statement must be an atomic normalization of the quoted evidence — do not over-interpret beyond what the quote supports.",
    "- Prefer fewer high-quality items over exhaustive speculation.",
    "",
    "Kind meanings (choose exactly one):",
    "- fact: observed company/market claim stated in the research",
    "- audience: who the research describes as the target or shopper",
    "- moment: a specific customer decision or comparison moment",
    "- tension: friction, confusion, or conflict the audience faces",
    "- opportunity: a durable territory for helpful education already stated in the research (not a content idea, hook, or invented strategy)",
    "- demand: evidenced want/need/language from the market",
    "- competitor: named or clearly classified competitive alternative",
    "- restriction: trust, legal, claim, or owner boundary",
    "- unresolved: open question the research leaves unanswered",
    "- limitation: research or market limit that constrains conclusions",
    "- other: only when none of the above fit",
    "",
    "Preserve stated strategic intelligence:",
    "- If the research itself states a durable educational territory, extract it as kind opportunity. That is preserving research intelligence, not inventing strategy.",
    "- Do not omit a stated opportunity because later sections also contain topics, experiments, or recommendations.",
    "",
    "Evidence quotes:",
    "- evidenceQuote must be an exact contiguous substring copied from the research text, or null.",
    "- Never paraphrase, ellipsize, clean up, or manufacture a quote.",
    "- Prefer null over a near-match.",
    "- Put sources in sourceRefs when the research names them; provenance must name the section/theme where the claim appears.",
    "",
    "Hypothesis:",
    "- If the research presents or evaluates a working hypothesis, extract that claim and set isHypothesis true.",
    "- Never disguise a hypothesis as observed evidence.",
    "- Do not set isHypothesis true on incidental facts merely to satisfy a quota.",
    "",
    "Hard bans:",
    "- Do not invent pains, competitors, demand, moments, opportunities, or missing facts.",
    "- If insufficient evidence for a kind, omit the item.",
    "- Do not generate topics, hooks, scripts, calendars, or platform choices.",
    "- Do not invent strategy or fill gaps the research does not support.",
    "",
    `Prompt version: ${LIBRARY_RUNTIME_PROMPT_VERSION}`,
  ].join("\n");

  const user = wrapUntrustedJson("COMPLETED_RESEARCH", {
    researchText: input.researchText,
  });

  return { instructions, input: user, promptVersion: LIBRARY_RUNTIME_PROMPT_VERSION };
}
