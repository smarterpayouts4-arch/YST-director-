import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { zodTextFormat } from "openai/helpers/zod";
import { operationRegistry } from "@/ai/operations/registry";
import { getRepairPolicy } from "@/ai/operations/repair-policy";
import { buildExpandProductionPrompt } from "@/features/social-media/youtube-shorts/prompts/expand-production";
import { buildShortsRepairPrompt } from "@/features/social-media/youtube-shorts/prompts/repair-output";
import { SHORTS_PRODUCTION_PROMPT_VERSION } from "@/features/social-media/youtube-shorts/prompts/prompt-version";
import { YouTubeShortsProductionModelSchema } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-production";
import { YOUTUBE_SHORTS_PROJECTION_KEYS } from "@/features/social-media/youtube-shorts/contracts/project-topic-packet";
import type { YouTubeShortsStoryboard } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-storyboard";

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

const approvedStoryboard: YouTubeShortsStoryboard = {
  storyArchitecture: {
    storyPromise: "A cheaper-looking serving can hide a different amount.",
    carrierMode: "single",
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
      because: n === 1 ? "" : `because-${n}`,
    })),
  },
  estimatedTotalSeconds: 49,
  scenes: [1, 2, 3, 4, 5, 6, 7].map((n) => ({
    sceneNumber: n,
    storyRole: `role-${n}`,
    purpose: `purpose-${n}`,
    narration: `narration-${n}`,
    sceneDescription: `desc-${n}`,
    onScreenText: `ost-${n}`,
    durationTargetSeconds: 7,
  })),
};

describe("expand-shorts-production contract", () => {
  it("registers one whole-board expand operation and no per-scene expand", () => {
    expect(operationRegistry["expand-shorts-production"]).toBeDefined();
    expect(
      Object.keys(operationRegistry).some((id) =>
        /expand-shorts-scene|per-scene-expand/i.test(id),
      ),
    ).toBe(false);
    expect(
      existsSync(
        join(process.cwd(), "src/app/api/social-media/youtube-shorts/expand"),
      ),
    ).toBe(true);
    expect(getRepairPolicy("youtube_shorts_production").maxAttempts).toBe(1);
  });

  it("prompt expands seven packages and reads approved narration as read-only context", () => {
    const { instructions, input, promptVersion } = buildExpandProductionPrompt({
      projection,
      approvedStoryboard,
    });
    expect(promptVersion).toBe(SHORTS_PRODUCTION_PROMPT_VERSION);
    expect(SHORTS_PRODUCTION_PROMPT_VERSION).toBe("ci-shorts-production-1.4.5");
    expect(instructions).toMatch(/EXACTLY 7/i);
    expect(instructions).toMatch(/projectVisualContinuity/i);
    expect(instructions).toMatch(/The storyboard block is the approved story/);
    expect(instructions).toMatch(
      /situationLock is the machine WHAT\. Scene Description is the human-readable visible event\. Narration is heard\. On-Screen Text is overlay/,
    );
    expect(instructions).toMatch(
      /may never rewrite, return, mutate, summarize, or substitute situationLock, Scene Description, Narration, or On-Screen Text/,
    );
    expect(instructions).toMatch(/Do NOT output narration, onScreenText, or sceneDescription/i);
    expect(instructions).toMatch(/locked meaning/i);
    expect(instructions).toMatch(
      /Scene Description's place, people, subjects, and action are binding staging/,
    );
    expect(instructions).toMatch(
      /Do not relocate the scene, re-stage the action, or swap subjects/,
    );
    expect(instructions).toMatch(
      /Non-binding shortcuts are only camera, packshot, and lighting cliches/,
    );
    expect(instructions).toMatch(
      /Every plate names the hero object's material and finish explicitly/,
    );
    expect(instructions).toMatch(
      /never render it readable in the plate/,
    );
    expect(instructions).toMatch(
      /You own the production treatment, not the story meaning/,
    );
    expect(instructions).toMatch(/heard, not drawn/i);
    expect(instructions).toMatch(/Fill the entire 9:16 canvas edge to edge/);
    expect(instructions).toMatch(
      /photograph continues through the top of the frame/,
    );
    expect(instructions).toMatch(/On-screen text is overlay at export/);
    expect(instructions).toMatch(
      /Never paint a blank band, flat panel, color block, or empty header into the image/,
    );
    expect(instructions).toMatch(
      /Never write reservation, empty-area, safe-zone, or upper-third instructions into visualPrompt/,
    );
    expect(instructions).toMatch(/One visual world/i);
    expect(instructions).toMatch(/Closed-world picture/i);
    expect(instructions).toMatch(/Allowed neutral staging/i);
    expect(instructions).toMatch(/Forbidden factual invention/i);
    expect(instructions).toMatch(/This call writes production only/);
    expect(instructions).toMatch(/Purpose decides visual emphasis/);
    expect(instructions).toMatch(/talking-beat default, not a seven-scene lock/);
    expect(instructions).toMatch(/one visual idea/i);
    expect(instructions).toMatch(/Resolve only open realization slots/);
    expect(instructions).toMatch(/Do not change locked meaning/);
    expect(instructions).toMatch(
      /Subject, then Action, then Context, then Composition, then Visual treatment/,
    );
    expect(instructions).toMatch(/PORTRAIT FRAME/);
    expect(instructions).toMatch(/true 9:16 vertical portrait plate/);
    expect(instructions).toMatch(/Compose natively for a tall frame/);
    expect(instructions).toMatch(/Do not stage a landscape\/wide composition and crop it/);
    expect(instructions).toMatch(/One dominant visual question or relationship/);
    expect(instructions).toMatch(/avoid unrelated competing focal points/);
    expect(instructions).toMatch(/9:16 only constrains how that picture occupies the tall canvas/);
    expect(instructions).toMatch(/VISUAL FINISH/);
    expect(instructions).toMatch(/purposeful lighting design/);
    expect(instructions).toMatch(/palette and tonal hierarchy/);
    expect(instructions).toMatch(/foreground\/midground\/background/);
    expect(instructions).toMatch(/optical behavior/);
    expect(instructions).toMatch(/Render visible materials believably/);
    expect(instructions).toMatch(/not every scene is a glossy advertisement/);
    expect(instructions).toMatch(/crop, light, depth, materials, and what must stay consistent/);
    expect(instructions).toMatch(/Neutral means no factual claim, not flat design/);
    expect(instructions).toMatch(/the photograph continues through the top of the frame as real environment/);
    expect(instructions).toMatch(
      /self-contained vertical 9:16 portrait plate, natively composed for a tall frame/,
    );
    expect(instructions).toMatch(/EMBODIMENT OVER EXPLANATION/);
    expect(instructions).toMatch(/Never invent explanatory props/);
    expect(instructions).toMatch(/lived-in place/);
    expect(instructions).toMatch(/real things in a real place/);
    expect(instructions).toMatch(/mood from Purpose/);
    expect(instructions).toMatch(/not identical exposure/);
    expect(instructions).toMatch(
      /Express relationships through embodiment and staging/,
    );
    expect(instructions).toMatch(/INFORMATION CRAFT/);
    expect(instructions).toMatch(/gesture's narrative job/);
    expect(instructions).toMatch(/designed crop/);
    expect(instructions).toMatch(/distinguish them/);
    expect(instructions).toMatch(/optional lower hand or contact with the surface/);
    expect(instructions).toMatch(/believable printed or interface structure/);
    expect(instructions).toMatch(/muddy placeholder/);
    expect(instructions).toMatch(/pseudo-table/);
    expect(instructions).toMatch(/exclusion clause/);
    expect(instructions).toMatch(/one deliberate choice per visual dimension/);
    expect(instructions).toMatch(/SITUATION FIDELITY/);
    expect(instructions).toMatch(/eventMode, requiredSubjects, visibleActionOrState, and relationship are WHAT/);
    expect(instructions).toMatch(/Read eventMode as the machine channel/);
    expect(instructions).toMatch(/physical_comparison forbids inventing a laptop/);
    expect(instructions).toMatch(/Hero labels stay realistic generic unread structure/);
    expect(instructions).toMatch(/Empty white hero labels are a defect/);
    expect(instructions).toMatch(
      /No readable letters, numbers, words, identity marks, or brands anywhere in the plate/,
    );
    expect(instructions).not.toMatch(/A\/B identity exception/);
    expect(instructions).not.toMatch(/letters A and B/);
    expect(instructions).not.toMatch(/label-bearing/);
    expect(instructions).not.toMatch(/safe zone/i);
    expect(instructions).not.toMatch(/overlay-safe/i);
    expect(instructions).not.toMatch(/low-detail sector/i);
    expect(instructions).not.toMatch(/upper third/);
    expect(instructions).not.toMatch(/reserve a/);
    expect(instructions).toMatch(/mediating surface/);
    expect(instructions).toMatch(/Do not replace a locked physical story situation/);
    expect(instructions).toMatch(/lightest human involvement/);
    expect(instructions).toMatch(/camera, packshot, and lighting cliches/);
    expect(instructions).toMatch(/Do not invent a device or new surface/);
    expect(instructions).toMatch(/inherits Scene 1's locked modality/);
    expect(instructions).toMatch(/category-credible/);
    expect(instructions).toMatch(/unbranded means no logo/);
    expect(instructions).toMatch(/never by painted-on characters/);
    expect(instructions).toMatch(/restates enough world/);
    expect(instructions).toMatch(/keep one side of the look/);
    expect(instructions).toMatch(/match position, look, and clothing/);
    expect(instructions).toMatch(/silently red-team the draft as a senior director/);
    expect(instructions).toMatch(/is this merely correct, or has someone directed it/);
    expect(instructions).toMatch(/emit only the final plate — never the draft or the critique/);
    expect(instructions).toMatch(/a hundred unrelated stories nearly unchanged/);
    expect(instructions).toMatch(
      /strengthen its HOW using the locked Purpose, relationship, action, and visual world/,
    );
    expect(instructions).toMatch(/never new props, places, characters, or other invented WHAT/);
    expect(instructions).toMatch(/Specificity earned by clutter or luxury is still a defect/);
    expect(instructions).toMatch(/Anatomical ownership scales to how much body the plate shows/);
    expect(instructions).toMatch(/its cut line stated at wrist or forearm/);
    expect(instructions).toMatch(/prove ownership through continuous shoulder-to-wrist anatomy/);
    expect(instructions).toMatch(
      /never imply a second off-camera or POV person unless the locked situation stages one/,
    );
    expect(instructions).toMatch(/Decide the head every time a torso is visible/);
    expect(instructions).toMatch(/the whole head sits inside the frame with stated space above it/);
    expect(instructions).toMatch(/cut at a named line below the collarbone/);
    expect(instructions).toMatch(
      /A skull or face sliced by the top edge is a rendering failure, never a directed crop/,
    );
    expect(instructions).toMatch(/Whenever any human matter appears/);
    expect(instructions).toMatch(
      /state what deliberately falls outside the frame, so no face, crown, ankle, wrist, or product cap is severed by accident/,
    );
    expect(instructions).toMatch(/a blank band or empty header at the top of the plate/);
    expect(instructions).toMatch(
      /humanPresenceConstraint is exclusive floor and ceiling/,
    );
    expect(instructions).toMatch(/none: no human may appear/);
    expect(instructions).toMatch(/hands: only hands and forearms may appear/);
    expect(instructions).toMatch(/partial: an identifiable person must stay visible/);
    expect(instructions).toMatch(/person: a clearly visible person is a primary subject/);
    expect(instructions).toMatch(/do not invent a person if Scene Description stages none/);
    expect(instructions).toMatch(/Priority, in this order/);
    expect(instructions).toMatch(/Locked semantic invariants/);
    expect(instructions).toMatch(/Required relationship/);
    expect(instructions).toMatch(/Production realization/);
    expect(instructions).toMatch(/may improve #3 only/);
    expect(instructions).toMatch(/may never weaken #1 or #2/);
    expect(instructions).toMatch(/Form versus finish/);
    expect(instructions).toMatch(/an Atom-named form is WHAT/);
    expect(instructions).toMatch(/An unnamed form is HOW/);
    expect(instructions).toMatch(/choose it once in projectVisualContinuity/);
    expect(instructions).toMatch(
      /The form chosen in this expand holds on every plate/,
    );
    expect(instructions).toMatch(/Do not write a category recipe/);
    expect(instructions).toMatch(/POV or anonymous hands satisfy the hands lock only/);
    expect(instructions).toMatch(/They are illegal when the lock is partial or person/);
    expect(instructions).toMatch(
      /Senior Director polish may improve production realization only/,
    );
    expect(instructions).toMatch(/may not remove a required subject, downgrade presence/);
    expect(instructions).toMatch(/cast it for this beat/);
    expect(instructions).toMatch(/not a beauty, youth, or luxury default/);
    expect(instructions).toMatch(/Never sexualize by default/);
    expect(instructions).toMatch(/Choose the environment's register deliberately/);
    expect(instructions).toMatch(
      /Premium is one register a director may choose, never the default aesthetic/,
    );
    expect(instructions).toMatch(/an undirected beige room is equally a defect/);
    expect(input).toContain('"storyArchitecture"');
    expect(input).toContain("declared amount line");
    expect(input).toContain('"sceneDescription"');
    expect(input).toContain('"situationLock"');
    expect(input).toContain('"narration"');
    expect(input).toContain('"onScreenText"');
    expect(input).toContain("desc-1");
    expect(input).toContain("narration-1");
    expect(input).toContain("ost-1");
    expect(input).toContain("Compare equivalent products");
    for (const key of YOUTUBE_SHORTS_PROJECTION_KEYS) {
      expect(input).toContain(`"${key}"`);
    }
    expect(
      YouTubeShortsProductionModelSchema.shape.scenes._def.minLength?.value ?? 7,
    ).toBe(7);
  });

  it("expand prompt receives owner-edited approved narration", () => {
    const ownerApproved: YouTubeShortsStoryboard = {
      ...approvedStoryboard,
      scenes: approvedStoryboard.scenes.map((scene) =>
        scene.sceneNumber === 4
          ? { ...scene, narration: "owner-edited-scene-4" }
          : scene,
      ),
    };
    const { input } = buildExpandProductionPrompt({
      projection,
      approvedStoryboard: ownerApproved,
    });
    expect(input).toContain("owner-edited-scene-4");
    expect(input).not.toContain("narration-4");
  });

  it("model schema is OpenAI structured-output compatible (no bare optional)", () => {
    expect(() =>
      zodTextFormat(YouTubeShortsProductionModelSchema, "youtube_shorts_production"),
    ).not.toThrow();
    const parsed = YouTubeShortsProductionModelSchema.safeParse({
      projectVisualContinuity: "Shared look",
      characterName: null,
      characterIdentity: null,
      characterContinuity: null,
      scenes: [1, 2, 3, 4, 5, 6, 7].map((n) => ({
        sceneNumber: n,
        visualPrompt: `visual-${n}`,
        voiceDirection: "steady",
        assetType: "video",
        motionPrompt: `motion-${n}`,
        continuityDelta: `delta-${n}`,
      })),
    });
    expect(parsed.success).toBe(true);
  });

  it("production runtime has no gold Scene 1 craft phrases", () => {
    const { instructions } = buildExpandProductionPrompt({
      projection,
      approvedStoryboard,
    });
    expect(instructions).not.toMatch(/magnesium/i);
    expect(instructions).not.toMatch(/\biron\b/i);
    expect(instructions).not.toMatch(/supplement/i);
    expect(instructions).not.toMatch(/\bbottle\b/i);
    expect(instructions).not.toMatch(/Nighttime Woman/i);
    expect(instructions).not.toMatch(/Arijon Subjective/i);
    expect(instructions).not.toMatch(/3% push-in/i);
    expect(instructions).not.toMatch(/lower price/i);
    expect(instructions).not.toMatch(/better value/i);
    expect(instructions).not.toMatch(/\bamber\b/i);
    expect(instructions).not.toMatch(/price per serving/i);
    expect(instructions).not.toMatch(/price tab/i);
    expect(instructions).not.toMatch(/value block/i);
    expect(instructions).not.toMatch(/fingertip/i);
    expect(instructions).not.toMatch(/\bmug\b/i);
    expect(instructions).not.toMatch(/serving count/i);
    expect(instructions).not.toMatch(/cost-per-serving/i);
    expect(instructions).not.toMatch(/--ar/);
    expect(instructions).not.toMatch(/--no/);
    expect(instructions).not.toMatch(/\bseed\b/i);
    expect(instructions).not.toMatch(/\bchaos\b/i);
    expect(instructions).not.toMatch(/\btablet\b/i);
    expect(instructions).not.toMatch(/\bbottle\b/i);
  });

  it("production repair obeys the same STORY-TO-PLATE doctrine", () => {
    const repair = buildShortsRepairPrompt({
      schemaName: "youtube_shorts_production",
      validationErrors: ["scenes[0].visualPrompt: reserved export header leaked"],
      previousOutput: {},
    });
    expect(repair.promptVersion).toBe("ci-shorts-production-1.4.5");
    expect(repair.instructions).toMatch(/Obey the same STORY-TO-PLATE doctrine/);
    expect(repair.instructions).toMatch(/Purpose decides visual emphasis/);
    expect(repair.instructions).toMatch(
      /Non-binding shortcuts are only camera, packshot, and lighting cliches/,
    );
    expect(repair.instructions).toMatch(/PORTRAIT FRAME/);
    expect(repair.instructions).toMatch(/Compose natively for a tall frame/);
    expect(repair.instructions).toMatch(/VISUAL FINISH/);
    expect(repair.instructions).toMatch(/purposeful lighting design/);
    expect(repair.instructions).toMatch(/palette and tonal hierarchy/);
    expect(repair.instructions).toMatch(/foreground\/midground\/background/);
    expect(repair.instructions).toMatch(/optical behavior/);
    expect(repair.instructions).toMatch(/Render visible materials believably/);
    expect(repair.instructions).toMatch(/not every scene is a glossy advertisement/);
    expect(repair.instructions).toMatch(/EMBODIMENT OVER EXPLANATION/);
    expect(repair.instructions).toMatch(/Never invent explanatory props/);
    expect(repair.instructions).toMatch(/lived-in place/);
    expect(repair.instructions).toMatch(/real things in a real place/);
    expect(repair.instructions).toMatch(/mood from Purpose/);
    expect(repair.instructions).toMatch(/not identical exposure/);
    expect(repair.instructions).toMatch(/INFORMATION CRAFT/);
    expect(repair.instructions).toMatch(/gesture's narrative job/);
    expect(repair.instructions).toMatch(/designed crop/);
    expect(repair.instructions).toMatch(/distinguish them/);
    expect(repair.instructions).toMatch(/optional lower hand or contact with the surface/);
    expect(repair.instructions).toMatch(/believable printed or interface structure/);
    expect(repair.instructions).toMatch(/muddy placeholder/);
    expect(repair.instructions).toMatch(/pseudo-table/);
    expect(repair.instructions).toMatch(/exclusion clause/);
    expect(repair.instructions).toMatch(/one deliberate choice per visual dimension/);
    expect(repair.instructions).toMatch(/SITUATION FIDELITY/);
    expect(repair.instructions).toMatch(/eventMode, requiredSubjects, visibleActionOrState, and relationship are WHAT/);
    expect(repair.instructions).toMatch(/mediating surface/);
    expect(repair.instructions).toMatch(/Do not replace a locked physical story situation/);
    expect(repair.instructions).toMatch(/lightest human involvement/);
    expect(repair.instructions).toMatch(/camera, packshot, and lighting cliches/);
    expect(repair.instructions).toMatch(/Do not invent a device or new surface/);
    expect(repair.instructions).toMatch(/inherits Scene 1's locked modality/);
    expect(repair.instructions).toMatch(/category-credible/);
    expect(repair.instructions).toMatch(/unbranded means no logo/);
    expect(repair.instructions).toMatch(/Hero labels stay realistic generic unread structure/);
    expect(repair.instructions).not.toMatch(/A\/B identity exception/);
    expect(repair.instructions).not.toMatch(/safe zone/i);
    expect(repair.instructions).toMatch(/silently red-team the draft as a senior director/);
    expect(repair.instructions).toMatch(/Anatomical ownership scales to how much body the plate shows/);
    expect(repair.instructions).toMatch(/Decide the head every time a torso is visible/);
    expect(repair.instructions).toMatch(/Fill the entire 9:16 canvas edge to edge/);
    expect(repair.instructions).toMatch(/On-screen text is overlay at export/);
    expect(repair.instructions).toMatch(/a blank band or empty header at the top of the plate/);
    expect(repair.instructions).not.toMatch(/upper third/);
    expect(repair.instructions).not.toMatch(/overlay-safe/);
    expect(repair.instructions).toMatch(
      /humanPresenceConstraint is exclusive floor and ceiling/,
    );
    expect(repair.instructions).toMatch(/Priority, in this order/);
    expect(repair.instructions).toMatch(/may improve #3 only/);
    expect(repair.instructions).toMatch(/POV or anonymous hands satisfy the hands lock only/);
    expect(repair.instructions).toMatch(/They are illegal when the lock is partial or person/);
    expect(repair.instructions).toMatch(
      /Senior Director polish may improve production realization only/,
    );
    expect(repair.instructions).toMatch(/Choose the environment's register deliberately/);
    expect(repair.instructions).not.toMatch(/magnesium/i);
    expect(repair.instructions).not.toMatch(/Nighttime Woman/i);
    expect(repair.instructions).not.toMatch(/price tab/i);
    expect(repair.instructions).not.toMatch(/value block/i);
    expect(repair.instructions).not.toMatch(/fingertip/i);
    expect(repair.instructions).not.toMatch(/\bmug\b/i);
    expect(repair.instructions).not.toMatch(/serving count/i);
    expect(repair.instructions).not.toMatch(/cost-per-serving/i);
    expect(repair.instructions).not.toMatch(/--ar/);
    expect(repair.instructions).not.toMatch(/--no/);
    expect(repair.instructions).not.toMatch(/\bseed\b/i);
    expect(repair.instructions).not.toMatch(/\bchaos\b/i);
    expect(repair.instructions).not.toMatch(/\btablet\b/i);
    expect(repair.instructions).not.toMatch(/\bbottle\b/i);
    const repairWithContext = buildShortsRepairPrompt({
      schemaName: "youtube_shorts_production",
      validationErrors: ["scenes[0].visualPrompt: reserved export header leaked"],
      previousOutput: {},
      context: { projection, approvedStoryboard },
    });
    expect(repairWithContext.input).toContain(
      "BEGIN_UNTRUSTED_YOUTUBE_SHORTS_ATOM_PROJECTION",
    );
    expect(repairWithContext.input).toContain(
      "BEGIN_UNTRUSTED_YOUTUBE_SHORTS_APPROVED_STORYBOARD",
    );
  });

  it("passes a semantic situationLock through expand input without inventing staging", () => {
    const lockedBoard: YouTubeShortsStoryboard = {
      ...approvedStoryboard,
      scenes: approvedStoryboard.scenes.map((scene) =>
        scene.sceneNumber === 1
          ? {
              ...scene,
              situationLock: {
                requiredSubjects: ["alternative A", "alternative B"],
                visibleActionOrState: "compare the two alternatives",
                relationship:
                  "one initially appears more attractive; decision unresolved",
                locationConstraint: "open",
                humanPresenceConstraint: "open",
              },
            }
          : scene,
      ),
    };
    const { instructions, input } = buildExpandProductionPrompt({
      projection,
      approvedStoryboard: lockedBoard,
    });
    expect(input).toContain("alternative A");
    expect(input).toContain("compare the two alternatives");
    expect(input).toContain('"locationConstraint": "open"');
    expect(input).toContain('"humanPresenceConstraint": "open"');
    expect(input).not.toContain("bathroom counter");
    expect(input).not.toContain("set side by side");
    expect(instructions).toMatch(
      /open means the staging in Scene Description was the story pass's free choice/,
    );
    expect(instructions).toMatch(
      /Direct only what Scene Description and situationLock leave unstated/,
    );
  });

  it("person lock fixture requires a visible person and forbids POV-only", () => {
    const personBoard: YouTubeShortsStoryboard = {
      ...approvedStoryboard,
      scenes: approvedStoryboard.scenes.map((scene) =>
        scene.sceneNumber === 1
          ? {
              ...scene,
              situationLock: {
                eventMode: "physical_comparison",
                requiredSubjects: ["shopper", "candidate A", "candidate B"],
                visibleActionOrState: "compare the two alternatives",
                relationship: "decision unresolved",
                locationConstraint: "open",
                humanPresenceConstraint: "person",
              },
            }
          : scene,
      ),
    };
    const { instructions, input } = buildExpandProductionPrompt({
      projection,
      approvedStoryboard: personBoard,
    });
    expect(input).toContain('"humanPresenceConstraint": "person"');
    expect(input).toContain("shopper");
    expect(input).toContain("candidate A");
    expect(instructions).toMatch(/person: a clearly visible person is a primary subject/);
    expect(instructions).toMatch(/the face and a substantial upper body may not be cropped away/);
    expect(instructions).toMatch(/They are illegal when the lock is partial or person/);
    expect(instructions).not.toMatch(/\bteacher\b/i);
    expect(instructions).not.toMatch(/\bdiner\b/i);
  });

  it("hands lock fixture permits POV and does not require a face", () => {
    const handsBoard: YouTubeShortsStoryboard = {
      ...approvedStoryboard,
      scenes: approvedStoryboard.scenes.map((scene) =>
        scene.sceneNumber === 1
          ? {
              ...scene,
              situationLock: {
                eventMode: "physical_comparison",
                requiredSubjects: ["hands", "candidate A", "candidate B"],
                visibleActionOrState: "handle the two alternatives",
                relationship: "both alternatives remain in play",
                locationConstraint: "open",
                humanPresenceConstraint: "hands",
              },
            }
          : scene,
      ),
    };
    const { instructions, input } = buildExpandProductionPrompt({
      projection,
      approvedStoryboard: handsBoard,
    });
    expect(input).toContain('"humanPresenceConstraint": "hands"');
    expect(input).toContain('"requiredSubjects": [');
    expect(input).toContain("hands");
    expect(instructions).toMatch(/hands: only hands and forearms may appear/);
    expect(instructions).toMatch(/a face or torso is illegal/);
    expect(instructions).toMatch(/POV or anonymous hands satisfy the hands lock only/);
    expect(instructions).not.toMatch(/\bknead\b/i);
    expect(instructions).not.toMatch(/\bcable\b/i);
  });

  it("presence classes stay exclusive and chosen form holds inside one expand", () => {
    const { instructions } = buildExpandProductionPrompt({
      projection,
      approvedStoryboard,
    });
    expect(instructions).toMatch(/none: no human may appear/);
    expect(instructions).toMatch(/do not invent a person if Scene Description stages none/);
    expect(instructions).toMatch(/hands: only hands and forearms may appear; a face or torso is illegal/);
    expect(instructions).toMatch(/person: a clearly visible person is a primary subject/);
    expect(instructions).toMatch(
      /The form chosen in this expand holds on every plate, whether the Atom named it or production chose it/,
    );
    expect(instructions).toMatch(/Hero product\/form identity does not change/);
    expect(instructions).not.toMatch(/\bteacher\b/i);
    expect(instructions).not.toMatch(/\bdiner\b/i);
    expect(instructions).not.toMatch(/\bknead\b/i);
  });

  it("physical-comparison scene description reaches expand input and doctrine forbids unauthorized screens", () => {
    const physicalBoard: YouTubeShortsStoryboard = {
      ...approvedStoryboard,
      scenes: approvedStoryboard.scenes.map((scene) =>
        scene.sceneNumber === 1
          ? {
              ...scene,
              sceneDescription:
                "A person physically compares two alternatives side by side, choice still open.",
            }
          : scene,
      ),
    };
    const { instructions, input } = buildExpandProductionPrompt({
      projection,
      approvedStoryboard: physicalBoard,
    });
    expect(input).toContain(
      "A person physically compares two alternatives side by side, choice still open.",
    );
    expect(instructions).toMatch(/SITUATION FIDELITY/);
    expect(instructions).toMatch(/Do not replace a locked physical story situation/);
    expect(instructions).toMatch(/mediating surface/);
    expect(instructions).not.toMatch(/\btablet\b/i);
    expect(instructions).not.toMatch(/\bamber\b/i);
    expect(instructions).not.toMatch(/magnesium/i);
  });

  it("synthetic continuity fixture stays production-only with one shared world", () => {
    const parsed = YouTubeShortsProductionModelSchema.safeParse({
      projectVisualContinuity: "One shared room, one unnamed adult, one unlabeled product form.",
      characterName: "Recurring adult",
      characterIdentity: "Same unnamed adult across all seven plates.",
      characterContinuity: "Same wardrobe, same hair, same face.",
      scenes: [1, 2, 3, 4, 5, 6, 7].map((n) => ({
        sceneNumber: n,
        visualPrompt: `Same unnamed adult, same room, same unlabeled product form. Beat ${n} action only.`,
        voiceDirection: "steady",
        assetType: "image",
        motionPrompt: "",
        continuityDelta: `Scene ${n}: action and crop only. Identity and room stay locked.`,
      })),
    });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    const sceneShape = YouTubeShortsProductionModelSchema.shape.scenes._def.type.shape;
    expect("narration" in sceneShape).toBe(false);
    expect("onScreenText" in sceneShape).toBe(false);
    expect("sceneDescription" in sceneShape).toBe(false);
    expect(parsed.data.scenes).toHaveLength(7);
    expect(
      new Set(parsed.data.scenes.map((scene) => scene.continuityDelta)).size,
    ).toBe(7);
  });
});
