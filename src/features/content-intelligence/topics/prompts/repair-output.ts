import { TOPICS_RUNTIME_PROMPT_VERSION } from "@/features/content-intelligence/topics/prompts/prompt-version";
import { SUPPORTING_ITEM_IDS_CONTRACT } from "@/features/content-intelligence/topics/prompts/grounding-contract";
import { OUTPUT_BANS } from "@/features/content-intelligence/topics/prompts/shared-guardrails";
import type { AiSchemaName } from "@/ai/operations/schema-names";

/** Topic Engine–owned repair — do not import Librarian or RPB repair. */
export function buildTopicsRepairPrompt(input: {
  schemaName: AiSchemaName;
  validationErrors: string[];
  previousOutput: unknown;
}): { instructions: string; input: string; promptVersion: string } {
  const instructions =
    input.schemaName === "topic_opportunities"
      ? [
          "Repair the previous topic_opportunities output so it passes schema and validation errors.",
          "You MUST return EXACTLY 6 topics after repair. Do not drop below 6.",
          "Exactly 6 means repair to 6 from valid DTO + selected Direction intelligence — never pad and never invent topics or itemIds.",
          "Fix each listed problem in place: replace bad supportingItemIds with real DTO itemIds that satisfy grounding.",
          "For insufficient teaching-fact support: ONLY add/replace supportingItemIds (and keep other id arrays valid). Do NOT rewrite title, premise, audience, customerMoment, primaryTension, opportunity, or desiredTakeaway — repair which governed facts support the existing topic, not a different topic.",
          "For other schema/grounding errors, rewrite fields only as needed while staying inside the Direction.",
          "If six genuinely grounded topics cannot be formed from the governed intelligence, still return exactly six schema-shaped rows without inventing evidence; the service will fail-closed when curation cannot keep six grounded topics.",
          "Keep unique priorities 1–6 with exactly one priority=1.",
          SUPPORTING_ITEM_IDS_CONTRACT,
          OUTPUT_BANS,
          `Prompt version: ${TOPICS_RUNTIME_PROMPT_VERSION}`,
        ].join("\n")
      : [
          "Repair the previous topic_directions output so it passes schema and validation errors.",
          "Return only genuinely grounded Directions (1–3). Do not invent a third lane to fill the screen.",
          "Fix supportingItemIds in place using real DTO itemIds that satisfy grounding.",
          "Keep unique priorities starting at 1. Priority 1 is the Recommended lane.",
          "Do not invent research. Do not generate topic titles.",
          SUPPORTING_ITEM_IDS_CONTRACT,
          OUTPUT_BANS,
          `Prompt version: ${TOPICS_RUNTIME_PROMPT_VERSION}`,
        ].join("\n");

  return {
    instructions,
    input: JSON.stringify(
      {
        schemaName: input.schemaName,
        validationErrors: input.validationErrors,
        previousOutput: input.previousOutput,
      },
      null,
      2,
    ),
    promptVersion: TOPICS_RUNTIME_PROMPT_VERSION,
  };
}
