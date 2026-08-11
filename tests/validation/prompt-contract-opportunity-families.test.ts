import { describe, expect, it } from "vitest";
import { formatResearchPrompt } from "@/features/research-prompt-builder/formatters/format-research-prompt";
import {
  extractSectionBody,
  lintPromptContract,
} from "@/features/research-prompt-builder/validation/prompt-contract";
import {
  PROMPT_CONTRACT_RULES,
  ruleMatches,
} from "@/features/research-prompt-builder/validation/prompt-contract-rules";
import { makeFinalPrompt } from "../fixtures/api/final-prompt";

function ruleById(id: string) {
  const rule = PROMPT_CONTRACT_RULES.find((r) => r.id === id);
  if (!rule) throw new Error(`Missing rule ${id}`);
  return rule;
}

function reportBody(markdown: string): string {
  return extractSectionBody(markdown, "## 7. REQUIRED REPORT STRUCTURE");
}

function expectGate(
  markdown: string,
  id: string,
  passes: boolean,
): void {
  const matched = ruleMatches(ruleById(id), reportBody(markdown));
  expect({ id, matched }).toEqual({ id, matched: passes });
}

/** Measurement-complete, opportunity-empty — the exact regression this PR fixes. */
function fixtureAMarkdown(): string {
  const prompt = makeFinalPrompt({
    requiredReportStructure: [
      "For every major conclusion about the working hypotheses, assign High / Medium / Low confidence and state what additional evidence would most likely change the conclusion.",
      "Report up to 3–5 material surprising findings that contradict, complicate, or substantially expand the supplied assumptions (name each affected supplied assumption id such as hypothesis:contentHypothesis). Do not manufacture surprising findings to satisfy a quota.",
      "Deliver exactly 3 content pillars with 2 experiments per pillar (6 experiments total).",
      "Also require one report-level CTA hypothesis.",
      "For each experiment include target segment, category, primary platform recommendation context, primary metric, secondary diagnostic metrics, success criteria, and failure criteria.",
      "Do not produce a long list of disconnected generic topics.",
    ].join(" "),
  });
  return formatResearchPrompt(prompt);
}

/** Natural-prose opportunity-complete without magic colon labels. */
function fixtureBMarkdown(): string {
  return formatResearchPrompt(makeFinalPrompt());
}

describe("opportunity-first experiment family gates", () => {
  it("Fixture A: pillars/experiments/measurement pass; both opportunity gates fail", () => {
    const md = fixtureAMarkdown();
    expectGate(md, "three_pillars", true);
    expectGate(md, "experiments", true);
    expectGate(md, "experiment_measurement", true);
    expectGate(md, "audience_opportunity", false);
    expectGate(md, "viewer_value_provenance", false);

    const lint = lintPromptContract(md);
    expect(lint.ok).toBe(false);
    expect(
      lint.issues.some((i) => /audience-opportunity experiment semantics/i.test(i)),
    ).toBe(true);
    expect(
      lint.issues.some((i) => /viewer-value\/provenance experiment semantics/i.test(i)),
    ).toBe(true);
  });

  it("Fixture B: all three family gates and pillar/experiment counts pass on natural prose", () => {
    const md = fixtureBMarkdown();
    expect(reportBody(md)).not.toMatch(/Audience Moment:/i);
    expect(reportBody(md)).not.toMatch(/Viewer Reward:/i);

    expectGate(md, "three_pillars", true);
    expectGate(md, "experiments", true);
    expectGate(md, "audience_opportunity", true);
    expectGate(md, "viewer_value_provenance", true);
    expectGate(md, "experiment_measurement", true);

    expect(lintPromptContract(md).ok).toBe(true);
  });

  it("repair hints forbid satisfying opportunity gates via a new section or fixed heading", () => {
    for (const id of [
      "audience_opportunity",
      "viewer_value_provenance",
      "experiment_measurement",
    ]) {
      expect(ruleById(id).repairHint).toMatch(/existing required-report-structure/i);
      expect(ruleById(id).repairHint).toMatch(
        /Do not satisfy this rule by adding a new report section or fixed heading/i,
      );
    }
  });
});
