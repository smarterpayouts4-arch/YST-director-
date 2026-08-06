#!/usr/bin/env node
/**
 * Verify generated knowledge indexes exist and carry envelope fields.
 */
import fs from "node:fs";
import path from "node:path";
import { assertEnvelope, generatedRoot } from "./lib/envelope.mjs";

const required = [
  "manifest.json",
  "indexes/docs-index.json",
  "indexes/agent-bootstrap.json",
  "indexes/reference-index.json",
  "maps/repository-tree.json",
  "maps/routes.json",
  "maps/schemas.json",
  "maps/api-contracts.json",
  "maps/runtime-prompts.json",
  "maps/mcp-tools.json",
  "maps/dependencies.json",
  "maps/ownership.json",
];

let errors = 0;

function fail(msg) {
  console.error("FAIL:", msg);
  errors++;
}

function ok(msg) {
  console.log("OK:", msg);
}

const root = generatedRoot();
if (!fs.existsSync(root)) {
  fail("generated/ missing — run npm run knowledge:update");
  process.exit(1);
}

for (const rel of required) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    fail(`missing ${rel}`);
    continue;
  }
  try {
    const obj = JSON.parse(fs.readFileSync(abs, "utf8"));
    assertEnvelope(obj, rel);
    ok(rel);
  } catch (e) {
    fail(`${rel}: ${e instanceof Error ? e.message : String(e)}`);
  }
}

if (errors) {
  console.error(`\nknowledge:check failed (${errors} error(s))`);
  process.exit(1);
}
console.log("\nknowledge:check passed");
