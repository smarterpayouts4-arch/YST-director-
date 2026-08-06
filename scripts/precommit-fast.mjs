#!/usr/bin/env node
/**
 * Fast local checks (~seconds): secrets heuristic, generated-file protection,
 * large-file warning, forbidden-import check.
 */
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
let failed = false;

function warn(msg) {
  console.warn(`WARN: ${msg}`);
}
function fail(msg) {
  console.error(`FAIL: ${msg}`);
  failed = true;
}

let staged = [];
try {
  staged = execSync("git diff --cached --name-only", { encoding: "utf8" })
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
} catch {
  staged = [];
}

const secretPatterns = [
  /OPENAI_API_KEY\s*=\s*sk-[A-Za-z0-9]/,
  /-----BEGIN (RSA |OPENSSH )?PRIVATE KEY-----/,
  /ghp_[A-Za-z0-9]{20,}/,
];

for (const file of staged) {
  if (file === ".env.local" || file.endsWith(".pem")) {
    fail(`Do not commit secrets file: ${file}`);
    continue;
  }
  if (!existsSync(join(root, file))) continue;
  if (file.includes("node_modules") || file.includes("Reference/archives")) continue;
  let content = "";
  try {
    content = readFileSync(join(root, file), "utf8");
  } catch {
    continue;
  }
  for (const re of secretPatterns) {
    if (re.test(content)) fail(`Possible secret in staged file: ${file}`);
  }
  if (file.startsWith("project-knowledge/generated/") && !content.includes('"generated": true') && !content.includes("generatedAt")) {
    warn(`Generated file may have been hand-edited: ${file}`);
  }
  const lines = content.split(/\r?\n/).length;
  if (lines > 850 && file.startsWith("src/")) {
    fail(`File exceeds hard line limit (850): ${file} (${lines})`);
  } else if (lines > 500 && file.startsWith("src/")) {
    warn(`Large file (${lines} lines): ${file}`);
  }
}

// Forbidden imports: client components importing server-only openai
for (const file of staged.filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"))) {
  if (!existsSync(join(root, file))) continue;
  if (file.includes("/api/") || file.includes("/services/") || file.includes("src/lib/openai")) continue;
  if (file.includes("src/features/research-prompt-builder/components/") || file.includes("src/app/") && !file.includes("/api/")) {
    const content = readFileSync(join(root, file), "utf8");
    if (content.includes('from "@/lib/openai"') || content.includes("from 'openai'")) {
      fail(`Client/UI file must not import OpenAI: ${file}`);
    }
    if (content.includes('prompts/') && /["'`].*You are a/.test(content)) {
      warn(`Possible prompt string in UI/route file: ${file}`);
    }
  }
}

if (failed) {
  console.error("\nprecommit-fast failed");
  process.exit(1);
}
console.log("precommit-fast OK");
