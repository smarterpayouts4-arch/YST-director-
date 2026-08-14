export const STORAGE_KEY = "research-prompt-builder:v1";
/**
 * Exported product contract version on final research-prompt IR metadata.
 * Distinct from `RUNTIME_PROMPT_VERSION` (executable instruction bundle).
 */
export const PROMPT_VERSION = "1.1.0";
export const APP_STAGES = [
  "ingestion",
  "understanding",
  "interview",
  "brief",
  "prompt",
] as const;

export type AppStage = (typeof APP_STAGES)[number];

export const MAX_CORE_QUESTIONS = 5;
export const MAX_CONDITIONAL_QUESTIONS = 2;
export const MAX_TOTAL_QUESTIONS = 7;
export const EVIDENCE_PACKET_CHAR_BUDGET = 40_000;
