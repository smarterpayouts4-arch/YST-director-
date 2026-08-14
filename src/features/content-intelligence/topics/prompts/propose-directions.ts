import { TOPICS_RUNTIME_PROMPT_VERSION } from "@/features/content-intelligence/topics/prompts/prompt-version";
import { SUPPORTING_ITEM_IDS_CONTRACT } from "@/features/content-intelligence/topics/prompts/grounding-contract";
import { DIRECTIONS_RANKING_CONTRACT } from "@/features/content-intelligence/topics/prompts/ranking-contract";
import {
  OUTPUT_BANS,
  TOPIC_ENGINE_PERSONA,
  wrapUntrustedJson,
} from "@/features/content-intelligence/topics/prompts/shared-guardrails";
import type { PublishedLibraryDto } from "@/features/content-intelligence/contracts/published-library";

export function buildProposeDirectionsPrompt(input: {
  publishedLibrary: PublishedLibraryDto;
}): { instructions: string; input: string; promptVersion: string } {
  const instructions = [
    TOPIC_ENGINE_PERSONA,
    "This call: DIRECTIONS only — do not generate topic titles.",
    `Prompt version: ${TOPICS_RUNTIME_PROMPT_VERSION}`,
    "",
    "Task: Propose strategic content DIRECTIONS from the PublishedLibraryDto.",
    "A Direction is a distinct grounded content lane — not a topic title, keyword bucket, SEO category, platform, script, or hook.",
    "Multiple Directions MAY share audience, customer moment, overarching opportunity, and some supporting evidence.",
    "They MUST differ in decisionQuestion and the resulting topic space. They do NOT each require a unique Librarian tension item.",
    "",
    "Doctrine:",
    "- Normally present three useful Directions when the intelligence supports them (maximum 3).",
    "- If only one macro territory exists, subdivide it into distinct evidence-supported educational/decision lanes — do not invent unrelated territories.",
    "- Never invent a third Direction just to fill the screen. Never pad weak lanes. Returning 1 or 2 remains valid.",
    "- Use demand as support and competitor intelligence as differentiation. Facts ground; hypotheses/unresolved annotate uncertainty.",
    "- Restrictions/limitations may support a legitimate educational question when tied to opportunity/tension grounding; restrictions alone must not become a fake territory.",
    "- Hypothesis-led directions must set hypothesisDependent=true.",
    "",
    "Every Direction MUST include: primaryAudience, primaryMoment, primaryOpportunity, primaryTension (lane framing — may share evidence), decisionQuestion, and supportingItemIds.",
    DIRECTIONS_RANKING_CONTRACT,
    SUPPORTING_ITEM_IDS_CONTRACT,
    OUTPUT_BANS,
  ].join("\n");

  const slim = {
    libraryId: input.publishedLibrary.libraryId,
    projectId: input.publishedLibrary.projectId,
    publishedAt: input.publishedLibrary.publishedAt,
    items: input.publishedLibrary.items.map((i) => ({
      itemId: i.itemId,
      kind: i.kind,
      statement: i.statement,
      confidence: i.confidence,
      isHypothesis: i.isHypothesis,
      provenance: i.provenance,
      sourceRefs: i.sourceRefs,
      evidenceQuote: i.evidenceQuote,
    })),
  };

  return {
    instructions,
    input: wrapUntrustedJson("PUBLISHED_LIBRARY_DTO", slim),
    promptVersion: TOPICS_RUNTIME_PROMPT_VERSION,
  };
}
