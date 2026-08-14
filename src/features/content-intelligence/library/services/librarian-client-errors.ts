/**
 * Owner-facing messages for Librarian client persist/extract failures.
 * Never surface raw Zod issue JSON in the UI.
 */
export function formatLibrarianClientError(err: unknown): string {
  const fallback = "Could not process research intelligence. Try sending again from Step 5.";
  const message = err instanceof Error ? err.message : fallback;
  const trimmed = message.trim();

  if (isZodItemsTooBig(trimmed)) {
    return "Could not save intelligence — the library hit its item limit. Send research again from Step 5 to start a fresh Library.";
  }

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      JSON.parse(trimmed);
      return fallback;
    } catch {
      // not JSON — fall through
    }
  }

  return message || fallback;
}

function isZodItemsTooBig(message: string): boolean {
  if (!message.includes("too_big") || !message.includes("items")) return false;
  try {
    const parsed: unknown = JSON.parse(message);
    if (!Array.isArray(parsed)) return false;
    return parsed.some(
      (issue) =>
        typeof issue === "object" &&
        issue !== null &&
        (issue as { code?: string }).code === "too_big" &&
        Array.isArray((issue as { path?: unknown }).path) &&
        ((issue as { path: unknown[] }).path.includes("items") ||
          (issue as { path: unknown[] }).path.at(-1) === "items"),
    );
  } catch {
    return message.includes('"too_big"') && message.includes('"items"');
  }
}
