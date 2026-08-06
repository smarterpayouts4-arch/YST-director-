#!/usr/bin/env node
/**
 * Fast architecture health diagnostics for humans and Cursor agents.
 * First instruction to any coding agent: run `npm run doctor`, read the report, continue.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const rows = [];

function check(name, fn) {
  try {
    const result = fn();
    rows.push({ name, status: result.status, detail: result.detail ?? "" });
  } catch (error) {
    rows.push({
      name,
      status: "FAIL",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}

function pass(detail = "") {
  return { status: "PASS", detail };
}
function warn(detail) {
  return { status: "WARN", detail };
}
function fail(detail) {
  return { status: "FAIL", detail };
}

check("Application scaffold", () => {
  const needed = ["package.json", "src/app/page.tsx", "src/features/research-prompt-builder"];
  const missing = needed.filter((p) => !existsSync(join(root, p)));
  return missing.length ? fail(`Missing: ${missing.join(", ")}`) : pass();
});

check("Environment", () => {
  const example = existsSync(join(root, ".env.example"));
  const local = existsSync(join(root, ".env.local"));
  if (!example) return fail(".env.example missing");
  if (!local) return warn(".env.local missing (OK for CI)");
  return pass("example + local present");
});

check("OpenAI server isolation", () => {
  const openai = readFileSync(join(root, "src/lib/openai.ts"), "utf8");
  if (!openai.includes('import "server-only"')) {
    return fail('src/lib/openai.ts missing import "server-only"');
  }
  return pass();
});

check("Schema / contract registry", () => {
  if (!existsSync(join(root, "src/ai/contracts/registry.ts"))) {
    return fail("src/ai/contracts/registry.ts missing");
  }
  return pass();
});

check("Prompt registry / operations", () => {
  if (!existsSync(join(root, "src/ai/operations/registry.ts"))) {
    return fail("src/ai/operations/registry.ts missing");
  }
  return pass();
});

check("Project Knowledge", () => {
  const docs = [
    "project-knowledge/PRODUCT.md",
    "project-knowledge/ARCHITECTURE.md",
    "project-knowledge/CURRENT_STATE.md",
    "project-knowledge/PROMPT_CONTRACT.md",
    "project-knowledge/SECURITY.md",
  ];
  const missing = docs.filter((p) => !existsSync(join(root, p)));
  return missing.length ? fail(missing.join(", ")) : pass();
});

check("Generated inventory", () => {
  const idx = join(root, "project-knowledge/generated/indexes/docs-index.json");
  if (!existsSync(idx)) return warn("Run npm run knowledge:update");
  return pass();
});

check("Guardian", () => {
  const r = spawnSync("node", ["project-knowledge/scripts/guardian.mjs"], {
    cwd: root,
    encoding: "utf8",
  });
  if (r.status === 0) return pass("0 hard failures");
  return fail(r.stdout?.slice(0, 200) || `exit ${r.status}`);
});

check("MCP allowlist", () => {
  if (!existsSync(join(root, "mcp/src/security/docs-registry.ts"))) {
    return fail("MCP docs registry missing");
  }
  const createServer = existsSync(join(root, "mcp/src/create-server.ts"))
    ? readFileSync(join(root, "mcp/src/create-server.ts"), "utf8")
    : "";
  if (/\brpb_write_|\brpb_edit_|\brpb_commit_/i.test(createServer)) {
    return fail("Write MCP tools must not be registered");
  }
  return pass("read-only registry present");
});

check("State migration", () => {
  return existsSync(
    join(root, "src/features/research-prompt-builder/state/migrations/registry.ts"),
  )
    ? pass()
    : fail("migration registry missing");
});

check("Evaluation fixtures", () => {
  const dir = join(root, "tests/evals/fixtures");
  return existsSync(dir) ? pass() : fail("tests/evals/fixtures missing");
});

check("Reference library", () => {
  return existsSync(join(root, "Reference/manifest.json"))
    ? pass()
    : fail("Reference/manifest.json missing");
});

check("MCP profiles", () => {
  return existsSync(join(root, "docs/ai/mcp-profiles.yaml"))
    ? pass()
    : warn("docs/ai/mcp-profiles.yaml missing");
});

const width = Math.max(...rows.map((r) => r.name.length));
console.log("\nRPB Doctor\n");
for (const row of rows) {
  console.log(
    `${row.name.padEnd(width)}  ${row.status.padEnd(4)}  ${row.detail}`.trimEnd(),
  );
}
const failed = rows.filter((r) => r.status === "FAIL");
const warned = rows.filter((r) => r.status === "WARN");
console.log(`\nSummary: ${rows.length - failed.length - warned.length} PASS, ${warned.length} WARN, ${failed.length} FAIL\n`);
process.exit(failed.length ? 1 : 0);
