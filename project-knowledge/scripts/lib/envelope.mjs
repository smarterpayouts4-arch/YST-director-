/**
 * Shared envelope helper for generated knowledge JSON artifacts.
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const GENERATOR_VERSION = "1.0.0";

export const GENERATED_MARKER =
  "GENERATED FILE — do not hand-edit; run npm run knowledge:update";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** project-knowledge/ */
export function knowledgeRoot() {
  return path.resolve(__dirname, "../..");
}

/** repo root */
export function repoRoot() {
  return path.resolve(knowledgeRoot(), "..");
}

export function generatedRoot() {
  return path.join(knowledgeRoot(), "generated");
}

export function tryCommitSha(cwd = repoRoot()) {
  try {
    return execSync("git rev-parse HEAD", {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

/**
 * @param {object} opts
 * @param {string[]} opts.sourcePaths
 * @param {string[]} [opts.warnings]
 * @param {Record<string, unknown>} [opts.data]
 */
export function makeEnvelope({ sourcePaths, warnings = [], ...data }) {
  return {
    generatedAt: new Date().toISOString(),
    commitSha: tryCommitSha(),
    generatorVersion: GENERATOR_VERSION,
    sourcePaths,
    warnings,
    marker: GENERATED_MARKER,
    ...data,
  };
}

export function assertEnvelope(obj, label = "artifact") {
  const required = [
    "generatedAt",
    "commitSha",
    "generatorVersion",
    "sourcePaths",
    "warnings",
  ];
  const missing = required.filter((k) => !(k in (obj ?? {})));
  if (missing.length) {
    throw new Error(`${label} missing envelope fields: ${missing.join(", ")}`);
  }
  if (!Array.isArray(obj.sourcePaths)) {
    throw new Error(`${label} sourcePaths must be an array`);
  }
  if (!Array.isArray(obj.warnings)) {
    throw new Error(`${label} warnings must be an array`);
  }
}
