/**
 * One-shot live probe: legal name + DBA in CSV → companyName extraction.
 * Usage: node --require ./scripts/preload-server-only.cjs --import tsx scripts/run-legal-dba-probe.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvLocal() {
  const path = join(root, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    if (!process.env[m[1]]) {
      let v = m[2];
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      process.env[m[1]] = v;
    }
  }
}

loadEnvLocal();
if (!process.env.OPENAI_API_KEY) {
  console.error("BLOCKED: OPENAI_API_KEY missing");
  process.exit(2);
}

const { buildEvidencePacket } = await import(
  "../src/features/research-prompt-builder/ingestion/build-evidence-packet.ts"
);
const { assembleCompanyAnalysisContext } = await import(
  "../src/ai/context/assemble-company-analysis-context.ts"
);
const { buildCompanyAnalystPrompt } = await import(
  "../src/features/research-prompt-builder/prompts/company-analyst.ts"
);
const { parseStructuredOutput } = await import(
  "../src/features/research-prompt-builder/services/structured-openai.ts"
);
const { CompanyUnderstandingSchema } = await import(
  "../src/features/research-prompt-builder/schemas/index.ts"
);
const { getContractSchemaVersion } = await import("../src/ai/contracts/registry.ts");
const { RUNTIME_PROMPT_VERSION } = await import(
  "../src/features/research-prompt-builder/prompts/prompt-version.ts"
);
const { sanitizeFileName } = await import(
  "../src/features/research-prompt-builder/ingestion/sanitize-upload.ts"
);

const csvPath = join(
  root,
  "tests/evals/fixtures/calibration-csvs/legal-dba-probe.csv",
);
const bytes = readFileSync(csvPath);
const evidencePacket = buildEvidencePacket({
  fileName: sanitizeFileName("legal-dba-probe.csv"),
  bytes,
  maxRows: 2500,
  maxColumns: 100,
  maxCellChars: 2000,
});
const contextPacket = assembleCompanyAnalysisContext(evidencePacket);
const prompt = buildCompanyAnalystPrompt(contextPacket);
const companyUnderstanding = await parseStructuredOutput({
  operation: "analyze-company",
  schemaName: "company_understanding",
  schema: CompanyUnderstandingSchema,
  instructions: prompt.instructions,
  input: prompt.input,
  inputSchemaVersion: getContractSchemaVersion("evidence-packet"),
  outputSchemaVersion: getContractSchemaVersion("company-understanding"),
  charBudgetUsed: contextPacket.charCount,
  truncationWarningCount: contextPacket.truncationWarnings.length,
});

const name = companyUnderstanding.companyName?.value ?? "";
const lower = name.toLowerCase();
const hasLegal =
  /dr\.?\s*b/i.test(name) && /wellness/i.test(name);
const hasDba = /zynava/i.test(name) || /doing business as|dba/i.test(name);
const pass = hasLegal && hasDba;

const outDir = join(root, "docs/audits/artifacts/calibration-02");
mkdirSync(outDir, { recursive: true });
const report = {
  promptVersion: RUNTIME_PROMPT_VERSION,
  companyNameValue: name,
  hasLegalEntitySignal: hasLegal,
  hasDbaOrBrandSignal: hasDba,
  pass,
  classification: companyUnderstanding.companyName?.classification,
  evidence: companyUnderstanding.companyName?.evidence,
};
writeFileSync(
  join(outDir, "legal-dba-probe.json"),
  JSON.stringify({ report, companyUnderstanding }, null, 2),
  "utf8",
);

console.log(JSON.stringify(report, null, 2));
process.exit(pass ? 0 : 1);
