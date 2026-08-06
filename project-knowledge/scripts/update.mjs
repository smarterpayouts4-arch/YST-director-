#!/usr/bin/env node
/**
 * Scan live sources and write indexes/maps/reports under project-knowledge/generated/ only.
 */
import fs from "node:fs";
import path from "node:path";
import {
  GENERATED_MARKER,
  generatedRoot,
  knowledgeRoot,
  makeEnvelope,
  repoRoot,
} from "./lib/envelope.mjs";

const ROOT = repoRoot();
const GEN = generatedRoot();
const PK = knowledgeRoot();

/** @type {string[]} */
const globalWarnings = [];

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function writeJson(rel, obj) {
  const abs = path.join(GEN, rel);
  ensureDir(path.dirname(abs));
  fs.writeFileSync(abs, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

function writeText(rel, text) {
  const abs = path.join(GEN, rel);
  ensureDir(path.dirname(abs));
  fs.writeFileSync(abs, text.replace(/\r\n/g, "\n"), "utf8");
}

function relPosix(abs) {
  return path.relative(ROOT, abs).split(path.sep).join("/");
}

function walkFiles(dir, pred, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      ent.name === "node_modules" ||
      ent.name === ".next" ||
      ent.name === ".git"
    ) {
      continue;
    }
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkFiles(full, pred, out);
    else if (pred(full, ent.name)) out.push(full);
  }
  return out;
}

function countLines(abs) {
  try {
    return fs.readFileSync(abs, "utf8").split(/\r?\n/).length;
  } catch {
    return 0;
  }
}

function readJsonSafe(abs) {
  try {
    return JSON.parse(fs.readFileSync(abs, "utf8"));
  } catch (e) {
    globalWarnings.push(`unreadable JSON ${relPosix(abs)}: ${e.message}`);
    return null;
  }
}

// --- scans ---
const sourceRoots = [
  "src/app",
  "src/features",
  "tests",
  "mcp",
  "Reference/manifest.json",
  "project-knowledge",
  "package.json",
].filter((p) => fs.existsSync(path.join(ROOT, p)));

const appFiles = walkFiles(path.join(ROOT, "src/app"), (f) =>
  /\.(ts|tsx|js|jsx|css)$/.test(f)
);
const featureFiles = walkFiles(path.join(ROOT, "src/features"), (f) =>
  /\.(ts|tsx|js|jsx)$/.test(f)
);
const testFiles = walkFiles(path.join(ROOT, "tests"), (f) =>
  /\.(ts|tsx|js|jsx)$/.test(f)
);
const mcpFiles = walkFiles(path.join(ROOT, "mcp"), (f) =>
  /\.(ts|tsx|js|mjs)$/.test(f)
);

// Routes
const pageFiles = appFiles.filter((f) => path.basename(f) === "page.tsx");
const routeFiles = appFiles.filter((f) => path.basename(f) === "route.ts");

function toAppRoute(abs) {
  const rel = relPosix(abs);
  const parts = rel.split("/");
  const idx = parts.indexOf("app");
  const segs = parts
    .slice(idx + 1, -1)
    .filter((s) => !(s.startsWith("(") && s.endsWith(")")));
  if (path.basename(abs) === "route.ts") {
    return "/api/" + segs.filter((s) => s !== "api").join("/");
  }
  return segs.length ? "/" + segs.join("/") : "/";
}

const routes = {
  pages: pageFiles.map((f) => ({
    route: toAppRoute(f),
    sourceFile: relPosix(f),
  })),
  api: routeFiles.map((f) => ({
    route: toAppRoute(f),
    sourceFile: relPosix(f),
    methodHints: ["POST"],
  })),
};

// Schemas
const schemaFiles = featureFiles.filter((f) =>
  /schemas[/\\]/.test(f) || /schema/.test(path.basename(f))
);
const schemas = schemaFiles.map((f) => ({
  path: relPosix(f),
  lines: countLines(f),
}));

// Runtime prompts
const promptFiles = featureFiles.filter((f) => /prompts[/\\]/.test(f));
const runtimePrompts = promptFiles.map((f) => {
  const text = fs.readFileSync(f, "utf8");
  const versionMatch = text.match(
    /RUNTIME_PROMPT_VERSION\s*=\s*["']([^"']+)["']/
  );
  return {
    path: relPosix(f),
    lines: countLines(f),
    exportsVersion: Boolean(versionMatch) || /prompt-version/.test(f),
    versionLiteral: versionMatch?.[1] ?? null,
  };
});

// MCP tools (heuristic: registerTool("rpb_..."))
const mcpToolNames = new Set();
for (const f of mcpFiles) {
  const text = fs.readFileSync(f, "utf8");
  for (const m of text.matchAll(/registerTool\(\s*["'](rpb_[a-z0-9_]+)["']/g)) {
    mcpToolNames.add(m[1]);
  }
  for (const m of text.matchAll(/name:\s*["'](rpb_[a-z0-9_]+)["']/g)) {
    mcpToolNames.add(m[1]);
  }
}

// Dependencies
const pkg = readJsonSafe(path.join(ROOT, "package.json")) ?? {};
const dependencies = {
  dependencies: pkg.dependencies ?? {},
  devDependencies: pkg.devDependencies ?? {},
  scripts: Object.keys(pkg.scripts ?? {}),
};

// Ownership
const ownershipRules =
  readJsonSafe(path.join(PK, "ownership-rules.json")) ?? { owners: {} };

// Repository tree (shallow structured)
function treeNode(dir, depth = 0, maxDepth = 3) {
  const name = path.basename(dir);
  if (depth > maxDepth) return { name, truncated: true };
  if (!fs.existsSync(dir)) return { name, missing: true };
  const children = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      ["node_modules", ".next", ".git", "Reference"].includes(ent.name) &&
      depth === 0 &&
      ent.name !== "Reference"
    ) {
      if (ent.name === "Reference") {
        children.push({ name: "Reference", note: "advisory archive — not expanded" });
      }
      continue;
    }
    if (["node_modules", ".next", ".git"].includes(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (depth === 0 && ent.name === "Reference") {
        children.push({ name: "Reference", note: "advisory — not expanded" });
      } else {
        children.push(treeNode(full, depth + 1, maxDepth));
      }
    } else {
      children.push({ name: ent.name, file: true });
    }
  }
  return { name, children };
}

const repoTree = treeNode(ROOT, 0, 3);

// Docs index
const doctrineFiles = walkFiles(PK, (f, name) => {
  if (f.includes(`${path.sep}generated${path.sep}`)) return false;
  if (f.includes(`${path.sep}scripts${path.sep}`)) return false;
  return /\.(md|json)$/.test(name);
});

const documents = doctrineFiles.map((f) => {
  const rel = relPosix(f).replace(/^project-knowledge\//, "");
  const text = fs.readFileSync(f, "utf8").slice(0, 2000);
  const title =
    text.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? path.basename(f, path.extname(f));
  return {
    id: rel.replace(/[\\/]/g, "__").replace(/\.(md|json)$/, ""),
    path: `project-knowledge/${rel.split(path.sep).join("/")}`,
    title,
    description: title,
    status: "canonical",
    authority: "canonical",
  };
});

// Reference index
const refManifestPath = path.join(ROOT, "Reference", "manifest.json");
let referenceRecords = [];
if (fs.existsSync(refManifestPath)) {
  const man = readJsonSafe(refManifestPath);
  referenceRecords = man?.records ?? [];
} else {
  globalWarnings.push("Reference/manifest.json missing");
}

// Agent bootstrap
const bootstrap = makeEnvelope({
  sourcePaths: ["project-knowledge/", "AGENTS.md", "mcp/"],
  warnings: [...globalWarnings],
  requiredFirstReads: [
    "AGENTS.md",
    "project-knowledge/README.md",
    "project-knowledge/CURRENT_STATE.md",
  ],
  canonicalDocumentIds: [
    "product",
    "architecture",
    "currentState",
    "ux",
    "promptContract",
    "security",
    "tooling",
    "definitionOfDone",
  ],
  statusVocabulary: [
    "Live",
    "Partial",
    "Prototype",
    "Mocked",
    "Planned",
    "Blocked",
    "Deprecated",
  ],
  evidenceLabels: [
    "Verified",
    "Partially verified",
    "Not verified",
    "Blocked",
    "Assumed",
  ],
  mcpToolsPrefix: "rpb_",
  mcpContextTools: [
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
  ],
  productScope:
    "Generate, validate, and export one company-specific ChatGPT research prompt.",
  nonGoals: [
    "research execution inside the app",
    "MarketMonth discovery/SEO tools",
    "MCP write tools",
    "auth/DB for MVP",
  ],
  docsIndexPath: "project-knowledge/generated/indexes/docs-index.json",
});

// Large files report
const qualityRules =
  readJsonSafe(path.join(PK, "quality-rules.json")) ?? {
    fileSize: { warningLines: 500, hardLimitLines: 850 },
  };
const warnLines = qualityRules.fileSize?.warningLines ?? 500;
const hardLines = qualityRules.fileSize?.hardLimitLines ?? 850;

const scannedCode = [...appFiles, ...featureFiles, ...testFiles, ...mcpFiles];
const largeFiles = scannedCode
  .map((f) => ({ path: relPosix(f), lines: countLines(f) }))
  .filter((x) => x.lines >= warnLines)
  .sort((a, b) => b.lines - a.lines);

// CURRENT_STATE coverage heuristic
const currentStateText = fs.existsSync(path.join(PK, "CURRENT_STATE.md"))
  ? fs.readFileSync(path.join(PK, "CURRENT_STATE.md"), "utf8")
  : "";
const expectedAreas = [
  "ingestion",
  "understanding",
  "interview",
  "research brief",
  "final prompt",
  "mcp",
  "agent",
];
const missingAreas = expectedAreas.filter(
  (a) => !currentStateText.toLowerCase().includes(a)
);

// Write artifacts
ensureDir(path.join(GEN, "indexes"));
ensureDir(path.join(GEN, "maps"));
ensureDir(path.join(GEN, "reports"));

writeJson(
  "manifest.json",
  makeEnvelope({
    sourcePaths: sourceRoots,
    warnings: [...globalWarnings],
    artifactCount: {
      documents: documents.length,
      pages: routes.pages.length,
      apiRoutes: routes.api.length,
      prompts: runtimePrompts.length,
      mcpTools: mcpToolNames.size,
    },
  })
);

writeJson(
  "indexes/docs-index.json",
  makeEnvelope({
    sourcePaths: ["project-knowledge/"],
    warnings: [],
    documents,
  })
);

writeJson("indexes/agent-bootstrap.json", bootstrap);

writeJson(
  "indexes/reference-index.json",
  makeEnvelope({
    sourcePaths: ["Reference/manifest.json"],
    warnings: fs.existsSync(refManifestPath)
      ? []
      : ["Reference/manifest.json missing"],
    authority: "advisory",
    records: referenceRecords,
  })
);

writeJson(
  "maps/repository-tree.json",
  makeEnvelope({
    sourcePaths: ["."],
    warnings: ["Reference/ not expanded in tree"],
    tree: repoTree,
  })
);

writeJson(
  "maps/routes.json",
  makeEnvelope({
    sourcePaths: ["src/app"],
    warnings: [],
    ...routes,
  })
);

writeJson(
  "maps/schemas.json",
  makeEnvelope({
    sourcePaths: ["src/features"],
    warnings: schemas.length ? [] : ["no schema files detected"],
    schemas,
  })
);

writeJson(
  "maps/api-contracts.json",
  makeEnvelope({
    sourcePaths: ["src/app/api"],
    warnings: [],
    endpoints: routes.api,
  })
);

writeJson(
  "maps/runtime-prompts.json",
  makeEnvelope({
    sourcePaths: ["src/features"],
    warnings: runtimePrompts.some((p) => !p.exportsVersion && !/prompt-version|shared-guardrails|repair/.test(p.path))
      ? ["some prompt modules lack version export (see prompt-version.ts)"]
      : [],
    prompts: runtimePrompts,
  })
);

writeJson(
  "maps/mcp-tools.json",
  makeEnvelope({
    sourcePaths: ["mcp"],
    warnings: mcpFiles.length ? [] : ["mcp/ not present at scan time"],
    tools: [...mcpToolNames].sort(),
  })
);

writeJson(
  "maps/dependencies.json",
  makeEnvelope({
    sourcePaths: ["package.json"],
    warnings: [],
    ...dependencies,
  })
);

writeJson(
  "maps/ownership.json",
  makeEnvelope({
    sourcePaths: ["project-knowledge/ownership-rules.json"],
    warnings: [],
    ownership: ownershipRules,
  })
);

// Reports
const largeMd = [
  `<!-- ${GENERATED_MARKER} -->`,
  `# Large files`,
  ``,
  `Thresholds: warning ≥ ${warnLines} lines, hard ≥ ${hardLines} lines.`,
  ``,
  largeFiles.length
    ? largeFiles
        .map(
          (f) =>
            `- \`${f.path}\` — ${f.lines} lines${f.lines >= hardLines ? " **HARD**" : " (warn)"}`
        )
        .join("\n")
    : "_No files at or above warning threshold._",
  ``,
].join("\n");
writeText("reports/LARGE_FILES.md", largeMd);

const missingStateMd = [
  `<!-- ${GENERATED_MARKER} -->`,
  `# CURRENT_STATE coverage`,
  ``,
  missingAreas.length
    ? [
        `Possible missing area mentions:`,
        ...missingAreas.map((a) => `- ${a}`),
      ].join("\n")
    : "_All expected MVP area keywords found in CURRENT_STATE.md._",
  ``,
].join("\n");
writeText("reports/CURRENT_STATE_GAPS.md", missingStateMd);

const structureMd = [
  `<!-- ${GENERATED_MARKER} -->`,
  `# Structure warnings`,
  ``,
  `Generated at knowledge:update. Run \`npm run knowledge:guardian\` for coded findings.`,
  ``,
  globalWarnings.length
    ? globalWarnings.map((w) => `- ${w}`).join("\n")
    : "_No structural warnings from update scan._",
  ``,
  `## Scan summary`,
  ``,
  `- App files: ${appFiles.length}`,
  `- Feature files: ${featureFiles.length}`,
  `- Test files: ${testFiles.length}`,
  `- MCP files: ${mcpFiles.length}`,
  `- Doctrine docs indexed: ${documents.length}`,
  `- Reference records: ${referenceRecords.length}`,
  `- MCP tools detected: ${mcpToolNames.size}`,
  ``,
].join("\n");
writeText("reports/STRUCTURE_WARNINGS.md", structureMd);

writeJson(
  "reports/update-summary.json",
  makeEnvelope({
    sourcePaths: sourceRoots,
    warnings: globalWarnings,
    counts: {
      appFiles: appFiles.length,
      featureFiles: featureFiles.length,
      testFiles: testFiles.length,
      mcpFiles: mcpFiles.length,
      documents: documents.length,
      largeFiles: largeFiles.length,
      missingStateAreas: missingAreas.length,
    },
  })
);

console.log("knowledge:update wrote artifacts under project-knowledge/generated/");
console.log(
  JSON.stringify(
    {
      documents: documents.length,
      pages: routes.pages.length,
      api: routes.api.length,
      prompts: runtimePrompts.length,
      mcpTools: mcpToolNames.size,
      warnings: globalWarnings.length,
    },
    null,
    2
  )
);
