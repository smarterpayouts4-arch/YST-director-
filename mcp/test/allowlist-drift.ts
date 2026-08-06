/**
 * Ensure registered rpb_ tools stay within the approved allowlist.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ALLOWED = new Set([
  "rpb_get_agent_bootstrap",
  "rpb_list_project_docs",
  "rpb_find_project_doc",
  "rpb_read_project_doc",
  "rpb_product_overview",
  "rpb_architecture_map",
  "rpb_current_state",
  "rpb_get_repository_tree",
  "rpb_get_route_inventory",
  "rpb_get_prompt_inventory",
  "rpb_get_schema_inventory",
  "rpb_get_guardian_report",
  "rpb_get_reference_concept",
]);

function main() {
  const src = readFileSync(join(process.cwd(), "mcp/src/create-server.ts"), "utf8");
  const names = [...src.matchAll(/registerTool\(\s*"([^"]+)"/g)].map((m) => m[1]);

  assert.ok(names.length > 0, "No rpb_ tools discovered");
  for (const name of names) {
    assert.ok(name.startsWith("rpb_"), `Tool must use rpb_ prefix: ${name}`);
    assert.ok(ALLOWED.has(name), `Unexpected tool: ${name}`);
    assert.ok(!/write|edit|commit|delete/i.test(name), `Write-like tool forbidden: ${name}`);
  }
  for (const expected of ALLOWED) {
    assert.ok(names.includes(expected), `Missing tool: ${expected}`);
  }
  console.log(`PASS allowlist-drift (${names.length} tools)`);
}

main();
