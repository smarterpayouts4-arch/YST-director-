import { describe, expect, it } from "vitest";
import {
  ANCHOR_TEST_ARCHETYPES,
  buildArchetypeAnchors,
} from "../helpers/anchor-test-archetypes";
import {
  extractQuotedPhrases,
  synthesizeFromHints,
} from "../helpers/synthesize-from-hints";
import { lintPromptContract } from "@/features/research-prompt-builder/validation/prompt-contract";
import {
  ANCHORED_RULE_IDS,
  renderCompilerChecklist,
  renderRepairHints,
} from "@/features/research-prompt-builder/validation/prompt-contract-rules";

describe("prompt contract hint-following reliability", () => {
  it.each(ANCHOR_TEST_ARCHETYPES)(
    "$id: following rendered repair hints alone yields lint PASS",
    (arch) => {
      const anchors = buildArchetypeAnchors(arch);
      const hints = renderRepairHints(ANCHORED_RULE_IDS, anchors);
      expect(hints.length).toBe(ANCHORED_RULE_IDS.length);

      // Hints must carry concrete tokens — otherwise the synthesizer cannot prove sufficiency.
      const quoted = hints.flatMap(extractQuotedPhrases);
      expect(quoted.length).toBeGreaterThan(0);

      const md = synthesizeFromHints(hints);
      const result = lintPromptContract(md, { anchors });
      expect(result.issues, result.issues.join("; ")).toEqual([]);
      expect(result.ok).toBe(true);
      expect(result.anchorCoverage.every((c) => c.satisfied)).toBe(true);
      expect(result.anchorCoverage.every((c) => c.degraded === false)).toBe(true);
    },
  );

  it.each(ANCHOR_TEST_ARCHETYPES)(
    "$id: compiler checklist embeds archetype-specific tokens",
    (arch) => {
      const anchors = buildArchetypeAnchors(arch);
      const checklist = renderCompilerChecklist(anchors).join("\n");
      const quoted = extractQuotedPhrases(checklist);
      expect(quoted.length).toBeGreaterThan(0);

      if (arch.id === "supplement") {
        expect(checklist.toLowerCase()).toMatch(/dietary supplements|tampa|supplement/);
        expect(checklist.toLowerCase()).not.toContain("harbor table");
      }
      if (arch.id === "restaurant") {
        expect(checklist.toLowerCase()).toMatch(/seafood|portland|harbor/);
        expect(checklist.toLowerCase()).not.toContain("zynava");
        expect(checklist.toLowerCase()).not.toContain("tampa");
      }
    },
  );

  it("hint-following survives when each control is its own blank-line paragraph", () => {
    const arch = ANCHOR_TEST_ARCHETYPES.find((a) => a.id === "supplement")!;
    const anchors = buildArchetypeAnchors(arch);
    const hints = renderRepairHints(ANCHORED_RULE_IDS, anchors);
    // synthesizeFromHints joins with spaces; also prove blank-line-separated still works
    // when each hint paragraph already co-locates tokens (formatter keeps field body as-is).
    const md = synthesizeFromHints(hints).replace(
      /(Hypothesis-blind|Quotation discipline|Evidence hierarchy|Demand triangulation|For every major conclusion|Report up to 3)/g,
      "\n\n$1",
    );
    const result = lintPromptContract(md, { anchors });
    expect(result.ok, result.issues.join("; ")).toBe(true);
  });
});
