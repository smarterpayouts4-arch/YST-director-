import fs from "node:fs";
import path from "node:path";
import { getRepoRoot, realpathSafe } from "../lib/repo.js";
import { PROJECT_DOCS, type ProjectDocId } from "./docs-registry.js";

export async function resolveProjectDoc(id: ProjectDocId): Promise<{
  abs: string;
  rel: string;
  text: string;
  mtimeMs: number;
}> {
  const root = getRepoRoot();
  const rootReal = await realpathSafe(root);
  const rel = PROJECT_DOCS[id];
  if (!rel) throw new Error(`Unknown document id: ${id}`);
  if (rel.includes("..")) {
    throw new Error("Path rejected");
  }
  const abs = path.resolve(root, rel);
  const absReal = await realpathSafe(abs);
  if (!absReal.startsWith(rootReal + path.sep) && absReal !== rootReal) {
    throw new Error("Path escapes repository root");
  }
  // Never resolve arbitrary MarketMonth archive trees as product truth via path tricks
  if (absReal.includes(`${path.sep}archives${path.sep}marketmonth${path.sep}`)) {
    throw new Error("MarketMonth archive is not product truth");
  }
  const text = fs.readFileSync(absReal, "utf8");
  const st = fs.statSync(absReal);
  return { abs: absReal, rel: rel.replace(/\\/g, "/"), text, mtimeMs: st.mtimeMs };
}

/** Reject any free-form path string from model input. */
export function rejectArbitraryPath(input: string): never {
  throw new Error(
    `Arbitrary path rejected: tools accept document IDs only (got ${JSON.stringify(input.slice(0, 80))})`
  );
}
