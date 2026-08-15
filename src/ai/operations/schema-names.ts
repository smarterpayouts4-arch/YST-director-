/**
 * Closed set of OpenAI structured-output schema names used by product ops.
 * Distinct from ContractId (kebab IR contracts) — do not conflate.
 */
export const AI_SCHEMA_NAMES = [
  "company_understanding",
  "next_interview_question",
  "supporting_context",
  "research_brief",
  "final_research_prompt",
  "content_intelligence_extract",
  "topic_directions",
  "topic_opportunities",
  "youtube_shorts_storyboard",
  "youtube_shorts_production",
] as const;

export type AiSchemaName = (typeof AI_SCHEMA_NAMES)[number];
