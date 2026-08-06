import { sha16 } from "../../lib/repo.js";
import { ok, type ToolEnvelope } from "../../contracts/envelope.js";
import { resolveProjectDoc } from "../../security/paths.js";

export async function rpbCurrentState(): Promise<
  ToolEnvelope<{ path: string; text: string; excerpt: string }>
> {
  const doc = await resolveProjectDoc("currentState");
  return ok(
    {
      path: doc.rel,
      text: doc.text,
      excerpt: doc.text.slice(0, 4000),
    },
    {
      source: {
        path: doc.rel,
        contentHash: sha16(doc.text),
        mtimeMs: doc.mtimeMs,
      },
    }
  );
}
