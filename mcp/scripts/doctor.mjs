#!/usr/bin/env node
/**
 * Narrow RPB MCP doctor — repository-side server truth only.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

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

function registryHash() {
  const abs = path.join(repoRoot, "mcp/src/security/docs-registry.ts");
  const text = fs.readFileSync(abs, "utf8");
  return crypto.createHash("sha256").update(text).digest("hex").slice(0, 12);
}

function toolText(result) {
  return Array.isArray(result.content) &&
    result.content[0] &&
    typeof result.content[0] === "object" &&
    result.content[0].type === "text" &&
    typeof result.content[0].text === "string"
    ? result.content[0].text
    : "";
}

async function main() {
  const hash = registryHash();
  let serverHealthy = false;
  let requiredPresent = false;
  let bootstrapHealthy = false;
  let detail = "";

  const transport = new StdioClientTransport({
    command: "npx",
    args: ["tsx", "mcp/src/stdio-server.ts"],
    cwd: repoRoot,
    stderr: "pipe",
  });

  const client = new Client({ name: "rpb-mcp-doctor", version: "0.1.0" });

  try {
    await client.connect(transport);
    serverHealthy = true;

    const listed = await client.listTools();
    const names = new Set(listed.tools.map((t) => t.name));
    const missing = REQUIRED.filter((t) => !names.has(t));
    requiredPresent = missing.length === 0;
    if (!requiredPresent) {
      detail = `missing tools: ${missing.join(", ")}`;
    }

    const read = await client.callTool({
      name: "rpb_get_agent_bootstrap",
      arguments: {},
    });
    const raw = toolText(read);
    let env;
    try {
      env = JSON.parse(raw);
    } catch {
      env = null;
    }
    bootstrapHealthy =
      env?.status === "complete" &&
      env?.data?.bootstrap &&
      Array.isArray(env.data.bootstrap.requiredFirstReads);

    if (!bootstrapHealthy && !detail) {
      detail =
        "rpb_get_agent_bootstrap did not return bootstrap with requiredFirstReads — run knowledge:update";
    }

    await client.close();
  } catch (e) {
    detail = e instanceof Error ? e.message : String(e);
    try {
      await client.close();
    } catch {
      /* ignore */
    }
  }

  console.log(
    `Repository MCP server: ${serverHealthy ? "healthy" : "unhealthy"}`
  );
  console.log(`Required tools present: ${requiredPresent ? "yes" : "no"}`);
  console.log(`Bootstrap: ${bootstrapHealthy ? "healthy" : "unhealthy"}`);
  console.log("Cursor catalog status: not observable");
  console.log(`Registry hash: ${hash}`);
  if (detail) console.log(`Detail: ${detail}`);

  if (!serverHealthy || !requiredPresent || !bootstrapHealthy) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
