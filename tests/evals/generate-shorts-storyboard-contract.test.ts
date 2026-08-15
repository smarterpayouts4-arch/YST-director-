import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { operationRegistry } from "@/ai/operations/registry";
import { getRepairPolicy } from "@/ai/operations/repair-policy";
import { buildGenerateStoryboardPrompt } from "@/features/social-media/youtube-shorts/prompts/generate-storyboard";
import { buildShortsRepairPrompt } from "@/features/social-media/youtube-shorts/prompts/repair-output";
import { SHORTS_RUNTIME_PROMPT_VERSION } from "@/features/social-media/youtube-shorts/prompts/prompt-version";
import { SHORTS_STORY_BRAIN } from "@/features/social-media/youtube-shorts/prompts/story-brain";
import { YouTubeShortsStoryboardModelSchema } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-storyboard";
import { YOUTUBE_SHORTS_PROJECTION_KEYS } from "@/features/social-media/youtube-shorts/contracts/project-topic-packet";

const projection = {
  audience: "a",
  confidence: "high" as const,
  customerMoment: "m",
  decisionQuestion: "q",
  desiredTakeaway: "d",
  evidenceQuotes: [],
  hypothesisDependencies: [],
  limitations: [],
  opportunity: "o",
  premise: "p",
  restrictions: ["Do not give medical advice."],
  supportingInsights: ["i"],
  tension: "t",
  title: "Compare equivalent products",
  unresolvedAssumptions: [],
  whyItMatters: "w",
};

const FORBIDDEN = /\b(magnesium|iron|bottle|zynava|nighttime)\b/i;

describe("generate-shorts-storyboard contract", () => {
  it("registers one whole-story operation and keeps expand as a sibling whole-board op", () => {
    expect(operationRegistry["generate-shorts-storyboard"]).toBeDefined();
    expect(operationRegistry["expand-shorts-production"]).toBeDefined();
    expect(
      Object.keys(operationRegistry).some((id) =>
        /generate-shorts-scene|expand-shorts-scene|per-scene/i.test(id),
      ),
    ).toBe(false);
    expect(
      existsSync(
        join(process.cwd(), "src/app/api/social-media/youtube-shorts/expand"),
      ),
    ).toBe(true);
    expect(getRepairPolicy("youtube_shorts_storyboard").maxAttempts).toBe(1);
    const repair = buildShortsRepairPrompt({
      schemaName: "youtube_shorts_storyboard",
      validationErrors: ["scenes[2].narration exceeds 22 words."],
      previousOutput: {},
    });
    expect(repair.promptVersion).toBe("ci-shorts-1.5.4");
    expect(repair.instructions).toMatch(
      /Change only the fields named in validationErrors/,
    );
    expect(repair.instructions).toMatch(/22 words/);
    expect(repair.instructions).toMatch(/from excerpt/);
    expect(repair.instructions).toMatch(/5 consecutive words from the excerpt/);
    expect(repair.instructions).toMatch(/repeated phrase/);
    expect(repair.instructions).toMatch(
      /rename that thing by what the viewer sees or does/,
    );
    expect(repair.instructions).toMatch(
      /Do not invent physical\/product locations not supported by the Atom/,
    );
    expect(repair.instructions).toMatch(
      /Translate analytical comparison language into ordinary spoken language/,
    );
  });

  it("prompt requires story-first architecture and Atom firewall", () => {
    const { instructions, input, promptVersion } =
      buildGenerateStoryboardPrompt({ projection });
    expect(promptVersion).toBe(SHORTS_RUNTIME_PROMPT_VERSION);
    expect(SHORTS_RUNTIME_PROMPT_VERSION).toBe("ci-shorts-1.5.4");
    expect(instructions).toContain(SHORTS_STORY_BRAIN);
    expect(instructions).toMatch(/EXACTLY 7/i);
    expect(instructions).toMatch(/storyArchitecture/);
    expect(instructions).toMatch(/Story first/i);
    expect(instructions).toMatch(/Conflict rule 1/);
    expect(instructions).toMatch(/that example is the carrier/i);
    expect(instructions).toMatch(/excluded/i);
    expect(instructions).toMatch(/Hook is a decision/i);
    expect(instructions).toMatch(/THIS audience care/i);
    expect(instructions).toMatch(/Hook decision procedure/);
    expect(instructions).toMatch(/hookWhy/);
    expect(instructions).toMatch(/Spoken first-hearing language/);
    expect(instructions).toMatch(/Ordinary words first/);
    expect(instructions).toMatch(/Translate Atom research phrasing/);
    expect(instructions).toMatch(/because required and nonempty on scenes 2–7/);
    expect(instructions).toMatch(/Therefore\/but is required behavior/);
    expect(instructions).toMatch(/The Atom gives facts, not wording/);
    expect(instructions).toMatch(/never the Atom's name for a thing/);
    expect(instructions).toMatch(/call each recurring thing by what the viewer sees or does/);
    expect(instructions).toMatch(/one two-beat line/);
    expect(instructions).toMatch(/using none of the Atom's nouns/);
    expect(instructions).toMatch(/Spoken lock fields/);
    expect(instructions).toMatch(/22 words/);
    expect(instructions).toMatch(/Avoid these constructions/);
    expect(instructions).toMatch(/product-part locations/);
    expect(instructions).toMatch(/packaging geography/);
    expect(instructions).toMatch(/Internal planning may use precise analytical concepts/);
    expect(instructions).toMatch(/Spoken story must translate them/);
    expect(instructions).toMatch(/like-for-like/);
    expect(instructions).toMatch(/like with like/);
    expect(instructions).toMatch(/on that basis/);
    expect(instructions).toMatch(/fair basis/);
    expect(instructions).toMatch(/Remove unnecessary payoff hedging/);
    expect(instructions).toMatch(/never strengthen the Atom/);
    expect(instructions).toMatch(/can actually/);
    expect(instructions).toMatch(/not merely restate the first beat/);
    expect(instructions).toMatch(/If both beats communicate the same idea, compress them/);
    expect(instructions).toMatch(/Noun repeat is allowed/);
    expect(instructions).toMatch(/Spoken rewrite pairs/);
    expect(instructions).toMatch(/Hook compression/);
    expect(instructions).toMatch(/at most two clauses/);
    expect(instructions).toMatch(/not a document or label question/);
    expect(instructions).toMatch(/therefore\/but/i);
    expect(instructions).toMatch(/and-then/i);
    expect(instructions).toMatch(/Do not invent research/i);
    expect(instructions).toMatch(/imagePrompt/i);
    expect(instructions).toMatch(/storyRole/i);
    expect(instructions).toMatch(/Never force Mistake, Framework/);
    expect(instructions).toMatch(/not a required seven-role schema/);
    expect(instructions).toMatch(/not camera, lens, lighting/);
    expect(instructions).not.toMatch(/Silent planning order/);
    expect(instructions).not.toMatch(
      /whether using that anchor early materially improves understanding/,
    );
    expect(instructions).not.toMatch(FORBIDDEN);
    const goldPhrases = [
      "Compare what you get first",
      "Then compare what you pay",
      "Before you pick the cheaper",
      "are you actually getting the same thing",
      "can fool you",
    ];
    for (const phrase of goldPhrases) {
      expect(instructions, phrase).not.toContain(phrase);
      expect(SHORTS_STORY_BRAIN, phrase).not.toContain(phrase);
    }
    expect(instructions).not.toMatch(/Reference\//);
    expect(input).toContain("Compare equivalent products");
    for (const key of YOUTUBE_SHORTS_PROJECTION_KEYS) {
      expect(input).toContain(`"${key}"`);
    }
    const modelKeys = Object.keys(YouTubeShortsStoryboardModelSchema.shape);
    expect(modelKeys[0]).toBe("storyArchitecture");
    expect(YouTubeShortsStoryboardModelSchema.shape.scenes._def.minLength?.value ?? 7).toBe(7);
  });

  it("brain markdown and runtime extract stay topic-agnostic", () => {
    const brainDir = join(
      process.cwd(),
      "src/features/social-media/youtube-shorts/brain",
    );
    const files = readdirSync(brainDir).filter((name) => name.endsWith(".md"));
    expect(files).toEqual(
      expect.arrayContaining([
        "README.md",
        "story-principles.md",
        "hook-strategy.md",
        "story-architecture.md",
        "reference-map.md",
      ]),
    );
    for (const name of files) {
      const text = readFileSync(join(brainDir, name), "utf8");
      expect(text, name).not.toMatch(FORBIDDEN);
    }
    expect(SHORTS_STORY_BRAIN).not.toMatch(FORBIDDEN);
    expect(SHORTS_STORY_BRAIN).not.toMatch(/Reference\//);
  });
});
