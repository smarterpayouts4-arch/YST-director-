#!/usr/bin/env node
/**
 * Validate APS inventory, pointer targets, fixtures, and Cursor adapter sync.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const apsRoot = path.dirname(path.dirname(__filename));
const repoRoot = path.dirname(apsRoot);
const pkRoot = path.join(repoRoot, "project-knowledge");

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

for (const t of manifest.templates || []) {
  if (!fs.existsSync(path.join(apsRoot, t))) fail("missing template " + t);
}
if ((manifest.templates || []).length) ok("templates present");

for (const c of manifest.projectContext || []) {
  const stubPath = path.join(apsRoot, "project-context", c);
  if (!fs.existsSync(stubPath)) {
    fail("missing project-context/" + c);
    continue;
  }
  const stub = fs.readFileSync(stubPath, "utf8");
  const match = stub.match(/Canonical:\s*`([^`]+)`/);
  if (!match) {
    fail(`project-context/${c} missing Canonical: \`...\` pointer`);
    continue;
  }
  const rel = match[1].replace(/\\/g, "/");
  if (rel.includes("..") || path.isAbsolute(rel)) {
    fail(`project-context/${c} bad Canonical path: ${rel}`);
    continue;
  }
  const target = path.join(repoRoot, rel);
  if (!fs.existsSync(target)) {
    fail(`pointer target missing for ${c}: ${rel}`);
  }
}
ok("project-context files present and pointer targets resolve");

const adapter = manifest.adapter?.cursor;
if (!adapter?.template || !fs.existsSync(path.join(apsRoot, adapter.template))) {
  fail("missing cursor adapter template");
} else {
  ok("cursor adapter template present");
}

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

for (const t of manifest.tests || []) {
  const tp = path.join(apsRoot, t);
  if (!fs.existsSync(tp)) {
    fail("missing test artifact " + t);
    continue;
  }
  if (t.endsWith(".json")) {
    let data;
    try {
      data = JSON.parse(fs.readFileSync(tp, "utf8"));
    } catch (e) {
      fail(`fixtures parse ${t}: ${e.message}`);
      continue;
    }
    const fixtures = data.fixtures;
    if (!Array.isArray(fixtures) || fixtures.length < 10) {
      fail(`${t} needs ≥10 fixtures with deterministic invariants`);
      continue;
    }
    const requiredKeys = [
      "id",
      "input",
      "expectedTaskType",
      "expectedQuestionCount",
    ];
    const taskTypes = new Set([
      "investigate",
      "plan",
      "implement",
      "verify",
      "audit",
      "security",
      "closeout",
    ]);
    for (const f of fixtures) {
      for (const k of requiredKeys) {
        if (f[k] === undefined || f[k] === null || f[k] === "") {
          fail(`fixture ${f.id || "?"} missing ${k}`);
        }
      }
      if (f.expectedTaskType && !taskTypes.has(f.expectedTaskType)) {
        fail(`fixture ${f.id} bad expectedTaskType: ${f.expectedTaskType}`);
      }
      if (typeof f.expectedQuestionCount !== "number" || f.expectedQuestionCount < 0) {
        fail(`fixture ${f.id} expectedQuestionCount must be ≥0 number`);
      }
    }
    ok(`${fixtures.length} intent-contract fixtures structurally valid`);
  }
}

// No MarketMonth product doctrine in portable layers
const portableDirs = ["core", "workflows", "adapters", "templates"];
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

if (!fs.existsSync(pkRoot)) {
  fail("project-knowledge/ missing at repo root");
}

if (errors) {
  console.error(`\nagent:validate failed (${errors} error(s))`);
  process.exit(1);
}
console.log("\nagent:validate passed");
