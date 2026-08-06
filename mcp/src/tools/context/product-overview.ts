import { sha16 } from "../../lib/repo.js";
import { ok, partial, type ToolEnvelope } from "../../contracts/envelope.js";
import { resolveProjectDoc } from "../../security/paths.js";

export async function rpbProductOverview(): Promise<
  ToolEnvelope<{
    governingSentence: string;
    outcomes: string[];
    nonGoalsSample: string[];
    path: string;
  }>
> {
  const doc = await resolveProjectDoc("product");
  const governing =
    doc.text
      .match(
        /The current product ends after generating[\s\S]*?of that prompt\./
      )?.[0]
      ?.trim() ?? "";
  const outcomes = [
    ...doc.text.matchAll(/\|\s*\*\*([^*]+)\*\*\s*\|/g),
  ].map((m) => m[1].trim());
  const nonGoalsBlock =
    doc.text.match(/## Explicit non-goals\s*\n+([\s\S]*?)\n+## /)?.[1] ?? "";
  const nonGoalsSample = nonGoalsBlock
    .split("\n")
    .map((l) => l.replace(/^-\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 8);

  const data = {
    governingSentence: governing,
    outcomes,
    nonGoalsSample,
    path: doc.rel,
  };

  if (!governing || outcomes.length < 4) {
    return partial(data, ["PRODUCT.md parse incomplete"], "medium");
  }

  return ok(data, {
    source: {
      path: doc.rel,
      contentHash: sha16(doc.text),
      mtimeMs: doc.mtimeMs,
    },
  });
}
