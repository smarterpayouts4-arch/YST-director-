import fs from "node:fs";
import path from "node:path";
import { getRepoRoot, sha16 } from "../../lib/repo.js";
import { failed, ok, type ToolEnvelope } from "../../contracts/envelope.js";

function readGenerated(rel: string): {
  rel: string;
  text: string;
  json: unknown;
  mtimeMs: number;
} {
  const abs = path.join(getRepoRoot(), rel);
  const text = fs.readFileSync(abs, "utf8");
  const st = fs.statSync(abs);
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { rel, text, json, mtimeMs: st.mtimeMs };
}

async function fromMap(
  rel: string
): Promise<ToolEnvelope<{ path: string; data: unknown }>> {
  try {
    const doc = readGenerated(rel);
    return ok(
      { path: doc.rel, data: doc.json ?? doc.text },
      {
        source: {
          path: doc.rel,
          contentHash: sha16(doc.text),
          mtimeMs: doc.mtimeMs,
        },
        warnings: doc.json
          ? []
          : ["Artifact is not JSON; returned raw text envelope data"],
      }
    );
  } catch (e) {
    return failed(
      (e instanceof Error ? e.message : String(e)) +
        " — run npm run knowledge:update"
    );
  }
}

export function rpbGetRepositoryTree() {
  return fromMap("project-knowledge/generated/maps/repository-tree.json");
}

export function rpbGetRouteInventory() {
  return fromMap("project-knowledge/generated/maps/routes.json");
}

export function rpbGetPromptInventory() {
  return fromMap("project-knowledge/generated/maps/runtime-prompts.json");
}

export function rpbGetSchemaInventory() {
  return fromMap("project-knowledge/generated/maps/schemas.json");
}

export function rpbGetGuardianReport() {
  return fromMap("project-knowledge/generated/reports/GUARDIAN.md").then(
    async (env) => {
      if (env.status !== "failed") return env;
      // try json twin
      return fromMap("project-knowledge/generated/reports/guardian.json");
    }
  );
}
