import { describe, expect, it } from "vitest";
import { zodTextFormat } from "openai/helpers/zod";
import { buildGenerateStoryboardPrompt } from "@/features/social-media/youtube-shorts/prompts/generate-storyboard";
import { buildExpandProductionPrompt } from "@/features/social-media/youtube-shorts/prompts/expand-production";
import {
  HUMAN_PRESENCE_CONSTRAINTS,
  SITUATION_EVENT_MODES,
  SITUATION_LOCK_OPEN,
  YouTubeShortsSituationLockModelSchema,
  YouTubeShortsSituationLockSchema,
  YouTubeShortsStoryboardModelSchema,
  YouTubeShortsStoryboardSchema,
  YouTubeShortsStoryboardSceneModelSchema,
  YouTubeShortsStoryboardSceneSchema,
  openSituationLock,
  type YouTubeShortsStoryboard,
} from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-storyboard";

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

const STAGED_DESCRIPTION =
  "In a small evening kitchen, an unnamed shopper stands at the counter with the two alternatives in front of them, turning one and then the other while dinner dishes dry nearby. Both read as real products with visible weight and wear around them. The mood is quiet doubt: the shopper leans in, compares, and hesitates. Which one deserves trust stays unresolved.";

function persistScene(n: number) {
  return {
    sceneNumber: n,
    storyRole: `role-${n} — the viewer feels this beat's pull before questioning what it hides`,
    purpose:
      "This beat changes what the viewer believes about the choice in front of them. It moves them from easy certainty toward a specific doubt they can act on, and it earns the next beat's evidence.",
    narration: "n",
    sceneDescription: STAGED_DESCRIPTION,
    onScreenText: "t",
    durationTargetSeconds: 7,
  };
}

function persistBoard() {
  return {
    estimatedTotalSeconds: 49,
    scenes: [1, 2, 3, 4, 5, 6, 7].map((n) => persistScene(n)),
  };
}

const architecture = {
  storyPromise: "A cheaper-looking serving can hide a different amount.",
  carrierMode: "single" as const,
  primaryCarrier: "declared amount line",
  comparisonCarriers: [],
  excludedCarriers: ["second catalog variant"],
  viewerOpening: "The shopper is about to pick the lower cost per serving.",
  hookMechanism: "The apparent bargain may not be an equivalent serving.",
  hookWhy: "This viewer is about to treat a lower cost as proof the servings match.",
  openingQuestion: "Are these servings actually equivalent amounts?",
  scene1Withholds: "How to read the declared amount line.",
  payoff: "Match the declared amount before comparing price.",
  beats: [1, 2, 3, 4, 5, 6, 7].map((n) => ({
    sceneNumber: n,
    job: `job-${n}`,
    because: n === 1 ? "hook" : `because-${n}`,
  })),
};

describe("YouTube Shorts semantic situation lock", () => {
  it("keeps persist boards valid without a lock and requires the lock on the model contract", () => {
    expect(YouTubeShortsStoryboardSchema.safeParse(persistBoard()).success).toBe(
      true,
    );
    expect(
      YouTubeShortsStoryboardSceneSchema.safeParse(persistScene(1)).success,
    ).toBe(true);
    expect(
      YouTubeShortsStoryboardSceneModelSchema.safeParse(persistScene(1)).success,
    ).toBe(false);
    expect(
      YouTubeShortsStoryboardModelSchema.safeParse({
        storyArchitecture: architecture,
        estimatedTotalSeconds: 49,
        scenes: [1, 2, 3, 4, 5, 6, 7].map((n) => persistScene(n)),
      }).success,
    ).toBe(false);
    const withLock = {
      storyArchitecture: architecture,
      estimatedTotalSeconds: 49,
      scenes: [1, 2, 3, 4, 5, 6, 7].map((n) => ({
        ...persistScene(n),
        situationLock: openSituationLock(["alternative A", "alternative B"]),
      })),
    };
    expect(YouTubeShortsStoryboardModelSchema.safeParse(withLock).success).toBe(
      true,
    );
  });

  it("is a semantic contract, not a shot card", () => {
    const keys = Object.keys(YouTubeShortsSituationLockSchema.shape);
    expect(keys).toEqual([
      "eventMode",
      "requiredSubjects",
      "visibleActionOrState",
      "relationship",
      "locationConstraint",
      "humanPresenceConstraint",
    ]);
    expect(SITUATION_EVENT_MODES).toEqual([
      "physical_comparison",
      "mediated_surface",
      "dual",
    ]);
    for (const rejected of [
      "actor",
      "physicalAction",
      "location",
      "modality",
      "shotSize",
      "viewerMustPerceive",
      "mustWithhold",
      "hiddenFacts",
    ]) {
      expect(keys).not.toContain(rejected);
    }
    expect(HUMAN_PRESENCE_CONSTRAINTS).toEqual([
      "open",
      "none",
      "hands",
      "partial",
      "person",
    ]);
    const open = openSituationLock(["alternative A", "alternative B"]);
    expect(open.eventMode).toBe("physical_comparison");
    expect(open.locationConstraint).toBe(SITUATION_LOCK_OPEN);
    expect(open.humanPresenceConstraint).toBe("open");
    expect(YouTubeShortsSituationLockSchema.safeParse(open).success).toBe(true);
    const { eventMode: _dropped, ...legacy } = open;
    expect(YouTubeShortsSituationLockSchema.safeParse(legacy).success).toBe(
      true,
    );
    expect(
      YouTubeShortsSituationLockModelSchema.safeParse(legacy).success,
    ).toBe(false);
    expect(YouTubeShortsSituationLockModelSchema.safeParse(open).success).toBe(
      true,
    );
    expect(
      YouTubeShortsSituationLockSchema.safeParse({
        ...open,
        actor: "hands only",
        location: "bathroom counter",
        physicalAction: "set side by side",
        shotSize: "MCU",
      }).success,
    ).toBe(true);
    expect(
      YouTubeShortsSituationLockSchema.parse({
        ...open,
        actor: "hands only",
        location: "bathroom counter",
        physicalAction: "set side by side",
        shotSize: "MCU",
      }),
    ).toEqual(open);
  });

  it("keeps Scene Description a robust staged event consistent with an open lock", () => {
    const scene = {
      ...persistScene(1),
      situationLock: openSituationLock(["alternative A", "alternative B"]),
    };
    const parsed = YouTubeShortsStoryboardSceneModelSchema.parse(scene);
    expect(parsed.sceneDescription).toMatch(/two alternatives/);
    expect(parsed.sceneDescription.length).toBeGreaterThanOrEqual(200);
    expect(parsed.sceneDescription).not.toMatch(/MCU|lens\b/i);
    expect(parsed.situationLock.eventMode).toBe("physical_comparison");
    expect(parsed.situationLock.locationConstraint).toBe("open");
    expect(parsed.situationLock.humanPresenceConstraint).toBe("open");
    const caption = {
      ...scene,
      sceneDescription: "Two bottles sit side by side on a counter.",
    };
    expect(
      YouTubeShortsStoryboardSceneModelSchema.safeParse(caption).success,
    ).toBe(false);
  });

  it("is OpenAI structured-output compatible on the model contract", () => {
    expect(() =>
      zodTextFormat(
        YouTubeShortsStoryboardModelSchema,
        "youtube_shorts_storyboard",
      ),
    ).not.toThrow();
  });

  it("P1B prompt forbids locking realization and P1C prompt directs only open slots", () => {
    const story = buildGenerateStoryboardPrompt({ projection });
    expect(story.instructions).toMatch(/not a shot card/);
    expect(story.instructions).toMatch(
      /Do not lock a gesture, crop, counter, room, MCU/,
    );
    expect(story.instructions).toMatch(/humanPresenceConstraint is exclusive/);
    expect(story.instructions).toMatch(
      /put that person on requiredSubjects and lock person or partial/,
    );
    expect(story.instructions).toMatch(/typically four to seven/);
    expect(story.instructions).toMatch(/A one-line caption is a defect/);
    expect(story.instructions).toMatch(/density, never padding/);
    expect(story.instructions).toMatch(/Write eventMode first/);
    expect(story.instructions).toMatch(/Three-mode staging follows the locked eventMode/);
    expect(story.instructions).toMatch(
      /not a required visual of a laptop, listing, or phone/,
    );
    expect(story.instructions).not.toMatch(/bathroom counter/);

    const approvedStoryboard: YouTubeShortsStoryboard = {
      storyArchitecture: architecture,
      estimatedTotalSeconds: 49,
      scenes: [1, 2, 3, 4, 5, 6, 7].map((n) => persistScene(n)),
    };
    const production = buildExpandProductionPrompt({
      projection,
      approvedStoryboard,
    });
    expect(production.instructions).toMatch(/Resolve only open realization slots/);
    expect(production.instructions).toMatch(/Do not change locked meaning/);
    expect(production.instructions).toMatch(
      /Read eventMode as the machine channel/,
    );
    expect(production.instructions).toMatch(
      /physical_comparison forbids inventing a laptop/,
    );
    expect(production.instructions).toMatch(
      /Hero labels stay realistic generic unread structure/,
    );
    expect(production.instructions).toMatch(
      /humanPresenceConstraint is exclusive floor and ceiling/,
    );
    expect(production.instructions).toMatch(/may improve #3 only/);
    expect(production.instructions).toMatch(
      /They are illegal when the lock is partial or person/,
    );
    expect(production.instructions).toMatch(
      /Subject, then Action, then Context, then Composition, then Visual treatment/,
    );
    expect(production.instructions).not.toMatch(/bathroom counter/);
    expect(production.instructions).not.toMatch(/set side by side/);
  });
});
