import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  getOperation,
  isRegisteredOperationId,
  listOperations,
  listPublicOperations,
  operationRegistry,
  type AiOperationId,
} from "@/ai/operations/registry";
import { AI_SCHEMA_NAMES } from "@/ai/operations/schema-names";
import { getRepairPolicy } from "@/ai/operations/repair-policy";
import { RUNTIME_PROMPT_VERSION } from "@/features/research-prompt-builder/prompts/prompt-version";

const root = process.cwd();
const PROMPT_VERSION_PATH =
  "src/features/research-prompt-builder/prompts/prompt-version.ts";

describe("AI Control constitution (relationships)", () => {
  it("derives AiOperationId from a single registry enumeration", () => {
    const ids = Object.keys(operationRegistry) as AiOperationId[];
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("repair-invalid-output");
    for (const id of ids) {
      expect(getOperation(id).operationId).toBe(id);
    }
  });

  it("resolves prompt, schema, eval, and repair for every public operation", () => {
    for (const op of listPublicOperations()) {
      expect(op.schemaName).not.toBeNull();
      expect(AI_SCHEMA_NAMES).toContain(op.schemaName);
      expect(existsSync(join(root, op.promptModulePath))).toBe(true);
      expect(op.evalPath).toBeTruthy();
      expect(existsSync(join(root, op.evalPath!))).toBe(true);
      expect(getRepairPolicy(op.schemaName!).maxAttempts).toBeGreaterThanOrEqual(1);
    }
  });

  it("keeps nested repair without a public schemaName", () => {
    const repair = operationRegistry["repair-invalid-output"];
    expect(repair.visibility).toBe("nested");
    expect(repair.schemaName).toBeNull();
    expect(existsSync(join(root, repair.promptModulePath))).toBe(true);
  });

  it("rejects unknown operation identities", () => {
    expect(isRegisteredOperationId("compile-research-prompt")).toBe(true);
    expect(isRegisteredOperationId("compile-research-prompt-contract")).toBe(false);
    expect(isRegisteredOperationId("test-op")).toBe(false);
  });

  it("documents discoverable README references for each public operation", () => {
    const readme = readFileSync(join(root, "src/ai/README.md"), "utf8");
    for (const op of listPublicOperations()) {
      expect(readme).toContain(op.operationId);
    }
  });

  it("keeps dead competing model-policy module deleted", () => {
    expect(existsSync(join(root, "src/config/model-policy.ts"))).toBe(false);
  });

  it("subordinates runtime-prompts inventory to RUNTIME_PROMPT_VERSION", () => {
    const mapPath = join(root, "project-knowledge/generated/maps/runtime-prompts.json");
    expect(existsSync(mapPath)).toBe(true);
    const map = JSON.parse(readFileSync(mapPath, "utf8")) as {
      prompts?: Array<{ path?: string; versionLiteral?: string | null }>;
    };
    const entry = (map.prompts ?? []).find((p) => p.path === PROMPT_VERSION_PATH);
    expect(entry).toBeDefined();
    expect(entry?.versionLiteral).toBe(RUNTIME_PROMPT_VERSION);
  });

  it("allows only upload-policy among src/config/*-policy.ts modules", () => {
    const configDir = join(root, "src/config");
    const policyFiles = readdirSync(configDir)
      .filter((name) => name.endsWith("-policy.ts"))
      .sort();
    expect(policyFiles).toEqual(["upload-policy.ts"]);
  });

  it("lists every registered operation exactly once", () => {
    const listed = listOperations().map((op) => op.operationId).sort();
    const keys = (Object.keys(operationRegistry) as AiOperationId[]).slice().sort();
    expect(listed).toEqual(keys);
  });
});
