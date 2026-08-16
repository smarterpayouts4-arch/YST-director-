import { describe, expect, it } from "vitest";
import {
  PRODUCTION_BRAIN_MODULES,
  PRODUCTION_BRAIN_SECTION_ORDER,
  SHORTS_PRODUCTION_EXPANSION_DOCTRINE,
} from "@/features/social-media/youtube-shorts/prompts/production-expansion-doctrine";
import {
  SHORTS_STORY_BRAIN,
  STORY_BRAIN_MODULES,
  STORY_BRAIN_SECTION_ORDER,
} from "@/features/social-media/youtube-shorts/prompts/story-brain";

const SHINGLE_SIZE = 8;
const FORBIDDEN = /\b(magnesium|iron|bottle|zynava|nighttime|tablet|amber)\b/i;

function wordsOf(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'/–—-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function shingles(text: string, size = SHINGLE_SIZE): Set<string> {
  const words = wordsOf(text);
  const out = new Set<string>();
  for (let i = 0; i <= words.length - size; i += 1) {
    out.add(words.slice(i, i + size).join(" "));
  }
  return out;
}

function assertUniqueRuleOwnership(modules: Record<string, string>) {
  const entries = Object.entries(modules);
  for (let i = 0; i < entries.length; i += 1) {
    for (let j = i + 1; j < entries.length; j += 1) {
      const [leftName, leftBody] = entries[i]!;
      const [rightName, rightBody] = entries[j]!;
      const left = shingles(leftBody);
      const overlap = [...shingles(rightBody)].filter((item) => left.has(item));
      expect(
        overlap,
        `${leftName} vs ${rightName} share ${SHINGLE_SIZE}-word rules: ${overlap.join(" | ")}`,
      ).toEqual([]);
    }
  }
}

function assertSectionOrder(compiled: string, order: readonly string[]) {
  let last = -1;
  for (const heading of order) {
    const idx = compiled.indexOf(`# ${heading}`);
    expect(idx, `missing heading ${heading}`).toBeGreaterThan(-1);
    expect(idx, `heading ${heading} out of order`).toBeGreaterThan(last);
    last = idx;
  }
}

describe("shorts brain compile", () => {
  it("compiles P1B headings in cognitive order", () => {
    assertSectionOrder(SHORTS_STORY_BRAIN, STORY_BRAIN_SECTION_ORDER);
    expect(STORY_BRAIN_SECTION_ORDER).toContain("SITUATION LOCK");
    expect(SHORTS_STORY_BRAIN.indexOf("# SITUATION LOCK")).toBeLessThan(
      SHORTS_STORY_BRAIN.indexOf("# SCENE REALIZATION"),
    );
    expect(SHORTS_STORY_BRAIN).not.toMatch(FORBIDDEN);
    expect(SHORTS_STORY_BRAIN).not.toMatch(/Reference\//);
  });

  it("keeps unique P1B rule ownership across modules", () => {
    assertUniqueRuleOwnership(STORY_BRAIN_MODULES);
  });

  it("compiles P1C with situation fidelity before portrait craft", () => {
    assertSectionOrder(
      SHORTS_PRODUCTION_EXPANSION_DOCTRINE,
      PRODUCTION_BRAIN_SECTION_ORDER,
    );
    const situation = SHORTS_PRODUCTION_EXPANSION_DOCTRINE.indexOf(
      "# SITUATION FIDELITY",
    );
    const portrait = SHORTS_PRODUCTION_EXPANSION_DOCTRINE.indexOf(
      "# PORTRAIT FRAME",
    );
    expect(situation).toBeGreaterThan(-1);
    expect(portrait).toBeGreaterThan(situation);
    expect(SHORTS_PRODUCTION_EXPANSION_DOCTRINE).not.toMatch(FORBIDDEN);
    expect(SHORTS_PRODUCTION_EXPANSION_DOCTRINE).not.toMatch(/Reference\//);
  });

  it("keeps unique P1C rule ownership across modules", () => {
    assertUniqueRuleOwnership(PRODUCTION_BRAIN_MODULES);
  });
});
