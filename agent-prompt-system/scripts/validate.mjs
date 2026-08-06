#!/usr/bin/env node
/**
 * Validate APS inventory and Cursor adapter sync.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const apsRoot = path.dirname(path.dirname(__filename));
const repoRoot = path.dirname(apsRoot);

let errors = 0;
function fail(msg) {
  console.error("FAIL:", msg);
  errors++;
}
function ok(msg) {
  console.log("OK:", msg);
}

const manifestPath = path.join(apsRoot, "manifest.json");
if (!fs.existsSync(manifestPath)) {
  fail("manifest.json missing");
  process.exit(1);
}

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
} catch (e) {
  fail("manifest.json parse: " + e.message);
  process.exit(1);
}

if (!manifest.systemVersion || !manifest.schemaVersion) {
  fail("manifest missing systemVersion/schemaVersion");
} else {
  ok(`manifest v${manifest.systemVersion} schema ${manifest.schemaVersion}`);
}

const ids = new Set();
for (const w of manifest.workflows || []) {
  if (!w.id) fail("workflow missing id");
  if (ids.has(w.id)) fail("duplicate workflow id: " + w.id);
  ids.add(w.id);
  if (!w.path || w.path.includes("..") || path.isAbsolute(w.path)) {
    fail("bad path for " + w.id);
  }
  const wp = path.join(apsRoot, w.path);
  if (!fs.existsSync(wp)) fail("missing workflow file: " + w.path);
  else {
    const body = fs.readFileSync(wp, "utf8");
    if (!body.includes(`id: ${w.id}`)) {
      fail(`WORKFLOW.md frontmatter id mismatch: ${w.id}`);
    }
    for (const ctx of w.required_context || []) {
      const cp = path.join(apsRoot, "project-context", ctx);
      if (!fs.existsSync(cp)) {
        fail(`missing project-context/${ctx} (required by ${w.id})`);
      }
    }
  }
}
ok(`${ids.size} workflows unique and present`);

for (const w of manifest.workflows || []) {
  for (const c of w.compatible_with || []) {
    if (!ids.has(c)) fail(`compatible_with unknown id "${c}" on ${w.id}`);
  }
}
ok("compatible_with IDs valid");

for (const c of manifest.core || []) {
  if (!fs.existsSync(path.join(apsRoot, c))) fail("missing core " + c);
}
ok("core files present");

for (const c of manifest.projectContext || []) {
  if (!fs.existsSync(path.join(apsRoot, "project-context", c))) {
    fail("missing project-context/" + c);
  }
}
ok("project-context files present");

const adapter = manifest.adapter?.cursor;
if (!adapter?.template || !fs.existsSync(path.join(apsRoot, adapter.template))) {
  fail("missing cursor adapter template");
} else {
  ok("cursor adapter template present");
}

// Sync check if installed
const pairs = [
  [
    path.join(apsRoot, adapter.template),
    path.join(repoRoot, adapter.installTarget),
  ],
  [
    path.join(apsRoot, adapter.bootstrapTemplate),
    path.join(repoRoot, adapter.bootstrapInstallTarget),
  ],
  [
    path.join(apsRoot, adapter.skillTemplate),
    path.join(repoRoot, adapter.skillInstallTarget),
  ],
];

let syncChecked = 0;
for (const [src, dest] of pairs) {
  if (!fs.existsSync(dest)) {
    console.log("WARN: not installed yet:", path.relative(repoRoot, dest));
    continue;
  }
  syncChecked++;
  const a = fs.readFileSync(src, "utf8");
  const b = fs.readFileSync(dest, "utf8");
  if (a !== b) {
    fail(`drift: ${path.relative(repoRoot, dest)} differs from adapter — run agent:install`);
  }
}
if (syncChecked) ok(`${syncChecked} installed adapter file(s) in sync`);

// No MarketMonth product doctrine in portable layers
const portableDirs = ["core", "workflows", "adapters"];
for (const d of portableDirs) {
  const dir = path.join(apsRoot, d);
  if (!fs.existsSync(dir)) continue;
  const walk = (p) => {
    for (const ent of fs.readdirSync(p, { withFileTypes: true })) {
      const fp = path.join(p, ent.name);
      if (ent.isDirectory()) walk(fp);
      else if (/\.(md|mdc)$/.test(ent.name)) {
        const text = fs.readFileSync(fp, "utf8");
        if (/MARKETMONTH NORTH STAR|Content Universe|six-stage product loop/i.test(text)) {
          fail(`MarketMonth product doctrine leaked into ${path.relative(apsRoot, fp)}`);
        }
      }
    }
  };
  walk(dir);
}
ok("no MarketMonth product doctrine in portable layers");

if (errors) {
  console.error(`\nagent:validate failed (${errors} error(s))`);
  process.exit(1);
}
console.log("\nagent:validate passed");
