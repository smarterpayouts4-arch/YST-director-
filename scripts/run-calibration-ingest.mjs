/**
 * Live OpenAI re-ingest for PROMPT_QUALITY_CALIBRATION_01.
 * Not part of npm run verify. Requires OPENAI_API_KEY in .env.local.
 *
 * Usage: npx tsx scripts/run-calibration-ingest.mjs
 *
 * Orchestrates the same stages as analyzeCompanyFromCsv without importing
 * the server-only service module.
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
  console.error("BLOCKED: OPENAI_API_KEY missing — cannot run live calibration ingest.");
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

const csvDir = join(root, "tests/evals/fixtures/calibration-csvs");
const outDir = join(
  root,
  process.env.CALIBRATION_OUT_DIR || "docs/audits/artifacts/calibration-02",
);
mkdirSync(outDir, { recursive: true });

const files = [
  "supplement.csv",
  "restaurant.csv",
  "contractor.csv",
  "professional-service.csv",
  "ecommerce.csv",
];

const summary = {
  ranAt: new Date().toISOString(),
  promptVersion: RUNTIME_PROMPT_VERSION,
  results: [],
};

for (const name of files) {
  const bytes = readFileSync(join(csvDir, name));
  const safeName = sanitizeFileName(name);
  process.stdout.write(`Ingesting ${name}… `);
  try {
    const evidencePacket = buildEvidencePacket({
      fileName: safeName,
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

    const outPath = join(outDir, name.replace(/\.csv$/, "-understanding.json"));
    writeFileSync(
      outPath,
      JSON.stringify(
        {
          fileName: name,
          promptVersion: RUNTIME_PROMPT_VERSION,
          companyUnderstanding,
          evidencePacketMeta: {
            fileName: evidencePacket.fileName,
            fileHash: evidencePacket.fileHash,
            retainedRowCount: evidencePacket.retainedRowCount,
            warnings: evidencePacket.warnings,
            wasTruncated: evidencePacket.wasTruncated,
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    summary.results.push({
      file: name,
      status: "ok",
      companyName: companyUnderstanding.companyName?.value,
      audience: companyUnderstanding.likelyAudience?.value,
      classificationAudience: companyUnderstanding.likelyAudience?.classification,
      claimsCount: companyUnderstanding.claimsAndRestrictions?.length ?? 0,
      unknownsCount: companyUnderstanding.importantUnknowns?.length ?? 0,
      outPath,
    });
    console.log("ok");
  } catch (err) {
    summary.results.push({
      file: name,
      status: "error",
      message: err instanceof Error ? err.message : String(err),
    });
    console.log("ERROR", err instanceof Error ? err.message : err);
  }
}

writeFileSync(join(outDir, "summary.json"), JSON.stringify(summary, null, 2), "utf8");
console.log(`Wrote ${join(outDir, "summary.json")}`);
process.exit(summary.results.some((r) => r.status !== "ok") ? 1 : 0);
