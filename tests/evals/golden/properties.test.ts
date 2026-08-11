import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("offline golden property set", () => {
  it("lists diverse cases with expected properties (not golden paragraphs)", () => {
    const raw = readFileSync(
      join(process.cwd(), "tests/evals/golden/properties.json"),
      "utf8",
    );
    const doc = JSON.parse(raw) as {
      cases: Array<{ id: string; expectedProperties: string[] }>;
    };
    expect(doc.cases.length).toBeGreaterThanOrEqual(10);
    expect(doc.cases.length).toBeLessThanOrEqual(30);
    const ids = new Set(doc.cases.map((c) => c.id));
    expect(ids.size).toBe(doc.cases.length);
    for (const c of doc.cases) {
      expect(c.expectedProperties.length).toBeGreaterThan(0);
    }
    expect(ids.has("interview-should-continue")).toBe(true);
    expect(ids.has("interview-should-stop")).toBe(true);
    expect(ids.has("regulated-industry")).toBe(true);
  });
});
