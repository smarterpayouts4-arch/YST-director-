import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { operationRegistry } from "@/ai/operations/registry";
import { getRepairPolicy } from "@/ai/operations/repair-policy";
import { buildGenerateStoryboardPrompt } from "@/features/social-media/youtube-shorts/prompts/generate-storyboard";
import { buildShortsRepairPrompt } from "@/features/social-media/youtube-shorts/prompts/repair-output";
import { SHORTS_RUNTIME_PROMPT_VERSION } from "@/features/social-media/youtube-shorts/prompts/prompt-version";
import { SHORTS_STORY_BRAIN } from "@/features/social-media/youtube-shorts/prompts/story-brain";
import {
  YouTubeShortsStoryboardModelSchema,
  YouTubeShortsStoryboardSceneSchema,
} from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-storyboard";
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

const FORBIDDEN = /\b(magnesium|iron|bottle|zynava|nighttime|amber)\b/i;

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
    expect(repair.promptVersion).toBe("ci-shorts-1.6.6");
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
    expect(repair.instructions).toMatch(
      /Scene description must withhold what scene1Withholds and openingQuestion leave open/,
    );
    expect(repair.instructions).toMatch(/Do not invent a proxy object/);
    expect(repair.instructions).toMatch(
      /strongest visible story event that expresses the Purpose/,
    );
    expect(repair.instructions).toMatch(
      /First decide the story event, not the information/,
    );
    expect(repair.instructions).toMatch(
      /A screen or interface is appropriate only when it is itself the story event/,
    );
    expect(repair.instructions).toMatch(/humanPresenceConstraint is exclusive/);
    expect(repair.instructions).toMatch(/put that person on requiredSubjects and lock person or partial/);
    expect(repair.instructions).toMatch(/Verbalize the locked humanPresenceConstraint/);
    const repairWithAtom = buildShortsRepairPrompt({
      schemaName: "youtube_shorts_storyboard",
      validationErrors: ["scenes[2].narration exceeds 22 words."],
      previousOutput: {},
      context: { projection },
    });
    expect(repairWithAtom.input).toContain(
      "BEGIN_UNTRUSTED_YOUTUBE_SHORTS_ATOM_PROJECTION",
    );
    expect(repairWithAtom.input).toContain("Compare equivalent products");
  });

  it("prompt requires story-first architecture and Atom firewall", () => {
    const { instructions, input, promptVersion } =
      buildGenerateStoryboardPrompt({ projection });
    expect(promptVersion).toBe(SHORTS_RUNTIME_PROMPT_VERSION);
    expect(SHORTS_RUNTIME_PROMPT_VERSION).toBe("ci-shorts-1.6.6");
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
    expect(instructions).toMatch(/never camera, lens, lighting/);
    expect(instructions).toMatch(
      /sceneDescription must obey the locked Hook/,
    );
    expect(instructions).toMatch(
      /Scene 1 visual withholds what scene1Withholds and openingQuestion leave open/,
    );
    expect(instructions).toMatch(/Do not invent a proxy object/);
    expect(instructions).toMatch(
      /keep objects the Atom or locked story names/,
    );
    expect(instructions).toMatch(/Scene realization/);
    expect(instructions).toMatch(
      /strongest visible story event that expresses the Purpose/,
    );
    expect(instructions).toMatch(
      /what is the story event, rather than the information being communicated/,
    );
    expect(instructions).toMatch(
      /A screen, interface, document, chart, card, or diagram is appropriate only when it is itself part of the story event/,
    );
    expect(instructions).toMatch(/situationLock is a compact semantic contract/);
    expect(instructions).toMatch(/not a shot card and not a still plate/);
    expect(instructions).toMatch(/Write eventMode first/);
    expect(instructions).toMatch(
      /physical_comparison, mediated_surface, or dual/,
    );
    expect(instructions).toMatch(/Three-mode staging follows the locked eventMode/);
    expect(instructions).toMatch(
      /they do not choose the visual channel/,
    );
    expect(instructions).toMatch(
      /point to that only when eventMode is mediated_surface or dual/,
    );
    expect(instructions).toMatch(/locationConstraint defaults to the word open/);
    expect(instructions).toMatch(/humanPresenceConstraint is exclusive/);
    expect(instructions).toMatch(/none = no human visible/);
    expect(instructions).toMatch(/hands = hands and forearms only, no face or body/);
    expect(instructions).toMatch(/partial = an identifiable person remains visible/);
    expect(instructions).toMatch(/person = that person is a primary scene subject/);
    expect(instructions).toMatch(/hands is not an upgrade of open/);
    expect(instructions).toMatch(/partial is not a synonym of person/);
    expect(instructions).toMatch(/put that person on requiredSubjects and lock person or partial/);
    expect(instructions).toMatch(/Lock none when the beat is object-only/);
    expect(instructions).toMatch(/Do not lock a gesture, crop, counter, room, MCU/);
    expect(instructions).toMatch(/Verbalize the locked humanPresenceConstraint/);
    expect(instructions).toMatch(/who is present, how much of them is visible/);
    expect(instructions).toMatch(/no visibility amount, is a defect when the lock is person or partial/);
    expect(instructions).toMatch(/Do not add viewerMustPerceive or mustWithhold/);
    expect(instructions).toMatch(
      /am I showing the story event or explaining the information/,
    );
    expect(instructions).toMatch(
      /First decide the story event, not the information/,
    );
    expect(instructions).toMatch(/Scene Description robustness/);
    expect(instructions).toMatch(/as many sentences as the moment needs/);
    expect(instructions).toMatch(/typically four to seven/);
    expect(instructions).toMatch(/one specific lived-in place you commit to/);
    expect(instructions).toMatch(/mood and tension as felt atmosphere/);
    expect(instructions).toMatch(/A one-line caption is a defect/);
    expect(instructions).toMatch(
      /repeats another field or adds no new visible detail is also a defect/,
    );
    expect(instructions).toMatch(/density, never padding/);
    expect(instructions).toMatch(
      /rewrite it as a person's action around that information/,
    );
    expect(instructions).toMatch(
      /Place, people, and mood are non-claim staging, never new facts/,
    );
    expect(instructions).toMatch(
      /Role format: a short name, an em dash, then one sentence defining what this story function means in THIS story/,
    );
    expect(instructions).toMatch(/Never a bare label, never a slot number/);
    expect(instructions).toMatch(/Purpose is two to four dense sentences/);
    expect(instructions).toMatch(
      /what evidence this beat has earned the right to show/,
    );
    expect(instructions).toMatch(/Scene Description must dramatize that Purpose/);
    expect(instructions).toMatch(
      /Reserve generic for unnamed people only/,
    );
    expect(instructions).toMatch(/never as a product adjective/);
    expect(instructions).not.toMatch(/\btablet\b/i);
    expect(instructions).toMatch(/Scene construction order \(every scene\)/);
    expect(instructions).toMatch(
      /decide Role, then Purpose, then situationLock, then Scene Description, then Narration, then On-Screen Text/,
    );
    expect(instructions).toMatch(
      /Write per-scene fields in construction order/,
    );
    expect(instructions).toMatch(
      /must not caption or restate the scene description/,
    );
    expect(Object.keys(YouTubeShortsStoryboardSceneSchema.shape)).toEqual([
      "sceneNumber",
      "storyRole",
      "purpose",
      "situationLock",
      "sceneDescription",
      "narration",
      "onScreenText",
      "durationTargetSeconds",
    ]);
    expect(instructions).not.toMatch(/Silent planning order/);
    expect(instructions).not.toMatch(
      /whether using that anchor early materially improves understanding/,
    );
    expect(instructions).not.toMatch(FORBIDDEN);
    expect(instructions).not.toMatch(/lower price/i);
    expect(instructions).not.toMatch(/better value/i);
    expect(instructions).not.toMatch(/\bamber\b/i);
    expect(instructions).not.toMatch(/price per serving/i);
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
