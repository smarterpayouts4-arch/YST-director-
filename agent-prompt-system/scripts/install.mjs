#!/usr/bin/env node
/**
 * Install Cursor APS artifacts from adapter SoT into .cursor/
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const apsRoot = path.dirname(path.dirname(__filename));

function findRepoRoot(start) {
  let dir = start;
  for (;;) {
    if (fs.existsSync(path.join(dir, "agent-prompt-system", "manifest.json"))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function installFile(templatePath, targetPath) {
  if (!fs.existsSync(templatePath)) {
    console.error("install: missing template", templatePath);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, fs.readFileSync(templatePath, "utf8"), "utf8");
  return targetPath;
}

const repoRoot = findRepoRoot(apsRoot);
if (!repoRoot) {
  console.error("install: could not find repository root");
  process.exit(1);
}

const adapterCursor = path.join(apsRoot, "adapters", "cursor");
const artifacts = [
  {
    template: path.join(adapterCursor, "agent-prompt-router.mdc"),
    target: path.join(repoRoot, ".cursor", "rules", "agent-prompt-router.mdc"),
  },
  {
    template: path.join(adapterCursor, "agent-bootstrap.mdc"),
    target: path.join(repoRoot, ".cursor", "rules", "agent-bootstrap.mdc"),
  },
  {
    template: path.join(adapterCursor, "skills", "aps-router", "SKILL.md"),
    target: path.join(repoRoot, ".cursor", "skills", "aps-router", "SKILL.md"),
  },
];

for (const { template, target } of artifacts) {
  const wrote = installFile(template, target);
  console.log("installed", path.relative(repoRoot, wrote));
}

console.log("APS install complete");
