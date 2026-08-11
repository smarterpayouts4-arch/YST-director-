/**
 * One-shot live compile for Zynava fixtures (not part of verify).
 * Usage: node --import ./scripts/stub-server-only.mjs --import tsx scripts/live-compile-zynava.mjs
 */
import { readFileSync, existsSync } from "node:fs";
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

const { generateResearchPrompt } = await import(
  "../src/features/research-prompt-builder/services/generate-research-prompt.ts"
);
const { makeConfirmedProfile } = await import(
  "../tests/fixtures/api/confirmed-profile.ts"
);
const { makeResearchBrief } = await import("../tests/fixtures/api/research-brief.ts");

const started = Date.now();
try {
  const result = await generateResearchPrompt({
    confirmedProfile: makeConfirmedProfile(),
    researchBrief: makeResearchBrief(),
  });
  console.log(
    JSON.stringify(
      {
        ok: true,
        ms: Date.now() - started,
        formattedChars: result.formattedPrompt.length,
        degraded: result.contractTelemetry.anchorCoverage.filter((c) => c.degraded)
          .length,
        satisfied: result.contractTelemetry.anchorCoverage.every((c) => c.satisfied),
        coverage: result.contractTelemetry.anchorCoverage.map((c) => ({
          ruleId: c.ruleId,
          satisfied: c.satisfied,
          matchedBuckets: c.matchedBuckets,
          matchedTokens: c.matchedTokens.slice(0, 4),
        })),
      },
      null,
      2,
    ),
  );
} catch (err) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        ms: Date.now() - started,
        code: err && typeof err === "object" && "code" in err ? err.code : null,
        message: err instanceof Error ? err.message.slice(0, 2000) : String(err),
      },
      null,
      2,
    ),
  );
  process.exit(1);
}
