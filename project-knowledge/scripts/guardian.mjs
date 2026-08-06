#!/usr/bin/env node
/**
 * Emit PK-HARD-* and PK-WARN-* findings to stdout and generated/reports/.
 */
import fs from "node:fs";
import path from "node:path";
import { formatFinding } from "./guardian/codes.mjs";
import {
  GENERATED_MARKER,
  generatedRoot,
  knowledgeRoot,
  makeEnvelope,
  repoRoot,
} from "./lib/envelope.mjs";

const ROOT = repoRoot();
const PK = knowledgeRoot();
const GEN = generatedRoot();

/** @type {ReturnType<typeof formatFinding>[]} */
const findings = [];

function walkFiles(dir, pred, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next", ".git"].includes(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkFiles(full, pred, out);
    else if (pred(full, ent.name)) out.push(full);
  }
  return out;
}

function rel(abs) {
  return path.relative(ROOT, abs).split(path.sep).join("/");
}

function countLines(abs) {
  return fs.readFileSync(abs, "utf8").split(/\r?\n/).length;
}

const qualityPath = path.join(PK, "quality-rules.json");
const quality = fs.existsSync(qualityPath)
  ? JSON.parse(fs.readFileSync(qualityPath, "utf8"))
  : {
      requiredDocs: [],
      fileSize: { warningLines: 500, hardLimitLines: 850 },
      generatedMarker: GENERATED_MARKER,
    };

const warnLines = quality.fileSize?.warningLines ?? 500;
const hardLines = quality.fileSize?.hardLimitLines ?? 850;
const marker = quality.generatedMarker ?? GENERATED_MARKER;

// PK-HARD-001 missing required docs
for (const doc of quality.requiredDocs ?? []) {
  const abs = path.join(PK, doc);
  if (!fs.existsSync(abs)) {
    findings.push(
      formatFinding("PK-HARD-001", `Missing required doc: ${doc}`, `project-knowledge/${doc}`)
    );
  }
}

// PK-HARD-005 required generated indexes
const requiredGenerated = [
  "indexes/docs-index.json",
  "indexes/agent-bootstrap.json",
  "indexes/reference-index.json",
  "manifest.json",
];
for (const g of requiredGenerated) {
  const abs = path.join(GEN, g);
  if (!fs.existsSync(abs)) {
    findings.push(
      formatFinding(
        "PK-HARD-005",
        `Missing generated artifact: ${g} (run knowledge:update)`,
        `project-knowledge/generated/${g}`
      )
    );
  }
}

// PK-HARD-002 generated marker
const generatedJson = walkFiles(GEN, (f) => f.endsWith(".json") || f.endsWith(".md"));
for (const abs of generatedJson) {
  if (path.basename(abs) === ".gitkeep") continue;
  const text = fs.readFileSync(abs, "utf8");
  const hasMarker =
    text.includes(marker) ||
    text.includes("GENERATED FILE") ||
    text.includes("do not hand-edit");
  if (!hasMarker) {
    findings.push(
      formatFinding(
        "PK-HARD-002",
        "Generated artifact missing do-not-hand-edit marker",
        rel(abs)
      )
    );
  }
}

// Large files
const codeRoots = ["src", "tests", "mcp"].map((d) => path.join(ROOT, d));
for (const root of codeRoots) {
  const files = walkFiles(root, (f) => /\.(ts|tsx|js|jsx|mjs)$/.test(f));
  for (const abs of files) {
    const lines = countLines(abs);
    if (lines >= hardLines) {
      findings.push(
        formatFinding(
          "PK-HARD-003",
          `${lines} lines exceeds hard limit ${hardLines}`,
          rel(abs)
        )
      );
    } else if (lines >= warnLines) {
      findings.push(
        formatFinding(
          "PK-WARN-001",
          `${lines} lines exceeds warning threshold ${warnLines}`,
          rel(abs)
        )
      );
    }
  }
}

// Prompt version heuristics
const promptFiles = walkFiles(path.join(ROOT, "src", "features"), (f) =>
  /prompts[/\\].*\.(ts|tsx)$/.test(f)
);
const versionFile = promptFiles.find((f) => path.basename(f) === "prompt-version.ts");
if (!versionFile) {
  findings.push(
    formatFinding(
      "PK-WARN-002",
      "No prompt-version.ts found under feature prompts/",
      "src/features/**/prompts/"
    )
  );
} else {
  const text = fs.readFileSync(versionFile, "utf8");
  if (!/RUNTIME_PROMPT_VERSION|PROMPT_VERSION/.test(text)) {
    findings.push(
      formatFinding(
        "PK-WARN-002",
        "prompt-version.ts lacks version export heuristic",
        rel(versionFile)
      )
    );
  }
}

// Client importing server-only (detectable)
const componentFiles = walkFiles(
  path.join(ROOT, "src", "features"),
  (f) => /components[/\\].*\.(ts|tsx)$/.test(f)
);
for (const abs of componentFiles) {
  const text = fs.readFileSync(abs, "utf8");
  if (
    /from\s+["']server-only["']/.test(text) ||
    /import\s+["']server-only["']/.test(text)
  ) {
    findings.push(
      formatFinding(
        "PK-HARD-004",
        "Component appears to import server-only",
        rel(abs)
      )
    );
  }
}

// CURRENT_STATE gaps
const csPath = path.join(PK, "CURRENT_STATE.md");
if (fs.existsSync(csPath)) {
  const text = fs.readFileSync(csPath, "utf8").toLowerCase();
  for (const area of ["ingestion", "interview", "final prompt", "mcp"]) {
    if (!text.includes(area)) {
      findings.push(
        formatFinding(
          "PK-WARN-003",
          `CURRENT_STATE.md may omit area: ${area}`,
          "project-knowledge/CURRENT_STATE.md"
        )
      );
    }
  }
}

// Reference manifest
if (!fs.existsSync(path.join(ROOT, "Reference", "manifest.json"))) {
  findings.push(
    formatFinding(
      "PK-WARN-004",
      "Reference/manifest.json missing",
      "Reference/manifest.json"
    )
  );
}

// MCP present
if (!fs.existsSync(path.join(ROOT, "mcp"))) {
  findings.push(
    formatFinding("PK-WARN-005", "mcp/ directory absent", "mcp/")
  );
}

// Emit
const hard = findings.filter((f) => f.severity === "hard");
const warn = findings.filter((f) => f.severity === "warn");

for (const f of findings) {
  const tag = f.severity === "hard" ? "PK-HARD" : "PK-WARN";
  console.log(
    `${f.code} [${tag}] ${f.title}${f.file ? ` @ ${f.file}` : ""} — ${f.detail}`
  );
}

fs.mkdirSync(path.join(GEN, "reports"), { recursive: true });

const reportMd = [
  `<!-- ${GENERATED_MARKER} -->`,
  `# Guardian report`,
  ``,
  `- Hard: ${hard.length}`,
  `- Warn: ${warn.length}`,
  ``,
  ...findings.map(
    (f) =>
      `- **${f.code}** (${f.severity}) ${f.title}${f.file ? ` — \`${f.file}\`` : ""}: ${f.detail}`
  ),
  ``,
].join("\n");

fs.writeFileSync(path.join(GEN, "reports", "GUARDIAN.md"), reportMd, "utf8");
fs.writeFileSync(
  path.join(GEN, "reports", "guardian.json"),
  JSON.stringify(
    makeEnvelope({
      sourcePaths: ["project-knowledge/", "src/", "mcp/", "tests/"],
      warnings: warn.map((w) => `${w.code}: ${w.detail}`),
      hardCount: hard.length,
      warnCount: warn.length,
      findings,
    }),
    null,
    2
  ) + "\n",
  "utf8"
);

console.log(
  `\nGuardian: ${hard.length} hard, ${warn.length} warn → project-knowledge/generated/reports/GUARDIAN.md`
);

if (hard.length) process.exit(1);
