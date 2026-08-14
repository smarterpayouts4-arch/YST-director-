/**
 * Interim hard safety ceiling measured using JS string.length
 * (UTF-16 code units), not linguistic graphemes and not model tokens.
 *
 * Historical 48k came from the former silent-truncate path and was not
 * derived from model capacity. Comprehensive completed research commonly
 * exceeds that size.
 *
 * Never silently truncate research input. Reject above this ceiling.
 * Replace/augment with token-aware context budgeting in a follow-up.
 */
export const MAX_RESEARCH_INPUT_CHARS = 150_000;

/** Show paste-capacity counter only when length reaches this fraction of the max. */
export const RESEARCH_INPUT_WARN_RATIO = 0.85;

export function researchInputWarnThreshold(): number {
  return Math.ceil(MAX_RESEARCH_INPUT_CHARS * RESEARCH_INPUT_WARN_RATIO);
}

export function shouldWarnResearchInputLength(length: number): boolean {
  return length >= researchInputWarnThreshold();
}
