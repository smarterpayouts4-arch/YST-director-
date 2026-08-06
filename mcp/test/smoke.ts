#!/usr/bin/env node
/**
 * Protocol smoke: spawn server, list tools, reject arbitrary path.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);

const REQUIRED = [
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
];

function fail(msg: string): never {
  console.error("FAIL:", msg);
  process.exit(1);
}

function toolText(result: { content?: unknown }): string {
  return Array.isArray(result.content) &&
    result.content[0] &&
    typeof result.content[0] === "object" &&
    result.content[0] !== null &&
    "type" in result.content[0] &&
    (result.content[0] as { type: string }).type === "text" &&
    "text" in result.content[0] &&
    typeof (result.content[0] as { text: unknown }).text === "string"
    ? (result.content[0] as { text: string }).text
    : "";
}

function parseEnvelope(text: string) {
  try {
    return JSON.parse(text) as {
      status: string;
      data: unknown;
      error?: string;
    };
  } catch {
    fail(`Invalid JSON envelope: ${text.slice(0, 200)}`);
  }
}

async function main() {
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["tsx", "mcp/src/stdio-server.ts"],
    cwd: repoRoot,
    stderr: "pipe",
  });

  const client = new Client({ name: "rpb-mcp-smoke", version: "0.1.0" });
  await client.connect(transport);

  const listed = await client.listTools();
  const names = new Set(listed.tools.map((t) => t.name));
  for (const t of REQUIRED) {
    if (!names.has(t)) fail(`missing tool ${t}`);
  }
  // Ensure no MarketMonth discovery tools leaked in
  for (const n of names) {
    if (n.startsWith("mm_")) fail(`unexpected MarketMonth tool: ${n}`);
  }

  const overview = await client.callTool({
    name: "rpb_product_overview",
    arguments: {},
  });
  const overviewEnv = parseEnvelope(toolText(overview));
  if (overviewEnv.status === "failed") fail("rpb_product_overview failed");

  // Reject arbitrary path-like document ids
  const bad = await client.callTool({
    name: "rpb_read_project_doc",
    arguments: { documentId: "../../etc/passwd" },
  });
  const badEnv = parseEnvelope(toolText(bad));
  if (badEnv.status !== "failed") {
    fail("expected DOCUMENT_NOT_REGISTERED for arbitrary path id");
  }
  const data = badEnv.data as { errorCode?: string } | null;
  if (data && typeof data === "object" && "errorCode" in data) {
    if (data.errorCode !== "DOCUMENT_NOT_REGISTERED") {
      fail(`unexpected errorCode: ${data.errorCode}`);
    }
  } else if (badEnv.error !== "DOCUMENT_NOT_REGISTERED") {
    fail(`expected DOCUMENT_NOT_REGISTERED, got ${badEnv.error}`);
  }

  // Also reject absolute-looking ids
  const bad2 = await client.callTool({
    name: "rpb_read_project_doc",
    arguments: { documentId: "C:/Windows/System32/drivers/etc/hosts" },
  });
  const bad2Env = parseEnvelope(toolText(bad2));
  if (bad2Env.status !== "failed") {
    fail("expected failure for absolute path id");
  }

  await client.close();
  console.log("PASS mcp smoke");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
