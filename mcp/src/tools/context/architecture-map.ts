import { sha16 } from "../../lib/repo.js";
import { ok, type ToolEnvelope } from "../../contracts/envelope.js";
import { resolveProjectDoc } from "../../security/paths.js";

export async function rpbArchitectureMap(): Promise<
  ToolEnvelope<{ planes: string[]; apiSurface: string[]; path: string }>
> {
  const doc = await resolveProjectDoc("architecture");
  const planes = ["Product", "AI Control", "Engineering Intelligence"].filter(
    (p) => doc.text.includes(p)
  );
  const apiSurface = [
    ...doc.text.matchAll(/`?(POST\s+\/api\/[a-z0-9\-\/]+)`?/gi),
  ].map((m) => m[1] ?? m[0]);

  return ok(
    { planes, apiSurface, path: doc.rel },
    {
      source: {
        path: doc.rel,
        contentHash: sha16(doc.text),
        mtimeMs: doc.mtimeMs,
      },
    }
  );
}
