/** Normalize whitespace for quote ⊆ raw checks. */
export function normalizeForQuoteMatch(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

export function quoteIsInRaw(
  evidenceQuote: string | null | undefined,
  rawText: string,
): boolean {
  if (evidenceQuote == null || evidenceQuote.trim() === "") return true;
  const quote = normalizeForQuoteMatch(evidenceQuote);
  if (!quote) return true;
  return normalizeForQuoteMatch(rawText).includes(quote);
}
