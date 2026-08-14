import { TOPICS_RUNTIME_PROMPT_VERSION } from "@/features/content-intelligence/topics/prompts/prompt-version";
import { SUPPORTING_ITEM_IDS_CONTRACT } from "@/features/content-intelligence/topics/prompts/grounding-contract";
import { TOPICS_RANKING_CONTRACT } from "@/features/content-intelligence/topics/prompts/ranking-contract";
import {
  OUTPUT_BANS,
  TOPIC_ENGINE_PERSONA,
  wrapUntrustedJson,
} from "@/features/content-intelligence/topics/prompts/shared-guardrails";
import { TOPIC_STRATEGY_DOCTRINE } from "@/features/content-intelligence/topics/prompts/topic-strategy-doctrine";
import type { PublishedLibraryDto } from "@/features/content-intelligence/contracts/published-library";
import type { TopicDirection } from "@/features/content-intelligence/topics/schemas/direction";

export function buildProposeTopicsPrompt(input: {
  publishedLibrary: PublishedLibraryDto;
  direction: TopicDirection;
}): { instructions: string; input: string; promptVersion: string } {
  const instructions = [
    TOPIC_ENGINE_PERSONA,
    "This call: TOPIC OPPORTUNITIES only inside the selected Direction.",
    `Prompt version: ${TOPICS_RUNTIME_PROMPT_VERSION}`,
    "",
    "Task: Propose EXACTLY 6 ranked topic opportunities inside the selected direction.",
    "Topics must NOT be random or generic SEO ideas (e.g. 'Benefits of X', 'Top products in 2026').",
    "Every topic must stay inside the selected direction and its decisionQuestion (content lane).",
    TOPIC_STRATEGY_DOCTRINE,
    TOPICS_RANKING_CONTRACT,
    "Prefer strategically useful specificity over sensationalism in the brief fields — not by making titles sound like strategy memos.",
    "Annotate hypothesisDependencies and unresolvedAssumptions when relevant; never present them as settled facts.",
    "Those arrays must be short human-readable claims (or evaluated hypothesis / unresolved statements from the DTO). Never put raw itemId values there — use restrictionItemIds / limitationItemIds / supportingItemIds for ids.",
    "List applicable restrictionItemIds and limitationItemIds from the DTO when the topic touches those boundaries.",
    OUTPUT_BANS,
    "",
    "Title and premise voice (simple front door, sophisticated room behind it):",
    "- title: for a normal member of the target audience — plain, concrete; name the unresolved distinction with everyday language (question, tension, misconception, or useful discovery). Curiosity comes from the distinction, not from catchy phrasing.",
    "- title: translate internal research/strategy terms into everyday language; do not paste the Direction name or decisionQuestion into the headline.",
    "- title: avoid academic, methodological, consulting, taxonomy, and product-strategy phrasing unless that wording is genuinely natural for the audience.",
    "- premise: one clear audience-facing sentence; put method detail in primaryTension, opportunity, whyItMatters, desiredTakeaway, and evidence.",
    "- Keep the brief rich and grounded. Do not sacrifice accuracy for clickbait. No sensational or fake-controversy framing.",
    "",
    SUPPORTING_ITEM_IDS_CONTRACT,
  ].join("\n");

  const slim = {
    selectedDirection: {
      territoryId: input.direction.territoryId,
      name: input.direction.name,
      description: input.direction.description,
      decisionQuestion: input.direction.decisionQuestion,
      primaryAudience: input.direction.primaryAudience,
      primaryMoment: input.direction.primaryMoment,
      primaryTension: input.direction.primaryTension,
      primaryOpportunity: input.direction.primaryOpportunity,
      supportingItemIds: input.direction.supportingItemIds,
    },
    publishedLibrary: {
      libraryId: input.publishedLibrary.libraryId,
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
    },
  };

  return {
    instructions,
    input: wrapUntrustedJson("DIRECTION_AND_PUBLISHED_LIBRARY", slim),
    promptVersion: TOPICS_RUNTIME_PROMPT_VERSION,
  };
}
