export function forDisplay(text: string): string {
  return text
    .replace(/[\u2014\u2015\u2E3A\u2E3B]/g, ", ")
    .replace(/\u2013/g, "-")
    .replace(/\s+-\s+/g, ", ")
    .replace(/\s{2,}/g, " ")
    .trim();
}
