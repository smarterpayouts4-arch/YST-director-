import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { makeStrategicDirectionQuestion } from "../fixtures/api/interview-question";
import { validateInterviewQuestion } from "@/features/research-prompt-builder/validation/interview";

/**
 * Cross-industry guardrails for strategy-card calibration.
 * Live LLM quality is measured in docs/audits/artifacts/calibration-02/;
 * this file locks the contract fixtures and the “no identical labels” rule.
 */
const ARCHETYPES = [
  "supplement",
  "restaurant",
  "contractor",
  "professional-service",
  "ecommerce",
] as const;

describe("strategy-card calibration expectations", () => {
  it("fixture strategic question validates against its own evidence refs", () => {
    const question = makeStrategicDirectionQuestion();
    const allowlist = new Set(
      question.strategicSuggestions.flatMap((c) => c.evidenceRefs),
    );
    expect(
      validateInterviewQuestion(question, { evidenceAllowlist: allowlist }),
    ).toEqual([]);
  });

  it("calibration-02 understanding artifacts exist for every archetype", () => {
    for (const archetype of ARCHETYPES) {
      const path = resolve(
        process.cwd(),
        "docs/audits/artifacts/calibration-02",
        `${archetype}-understanding.json`,
      );
      const raw = readFileSync(path, "utf8");
      const parsed = JSON.parse(raw) as {
        companyUnderstanding?: { ingestionSummary?: string };
      };
      const summary = parsed.companyUnderstanding?.ingestionSummary ?? "";
      expect(summary.length).toBeGreaterThan(40);
    }
  });

  it("strategic fixture titles are distinct within the card set", () => {
    const titles = makeStrategicDirectionQuestion().strategicSuggestions.map((c) =>
      c.title.trim().toLowerCase(),
    );
    expect(new Set(titles).size).toBe(titles.length);
  });
});
