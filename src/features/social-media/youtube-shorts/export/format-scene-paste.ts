import type { YouTubeShortsStoryboardScene } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-storyboard";
import {
  hasCharacterProfile,
  type YouTubeShortsProduction,
  type YouTubeShortsProductionScene,
} from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-production";

function section(header: string, body: string): string {
  return `${header}\n${body.trimEnd()}`;
}

/** Body only — for Copy Visual Prompt → external Gemini paste. */
export function formatVisualPromptBody(
  scene: YouTubeShortsProductionScene,
): string {
  return scene.visualPrompt.trimEnd();
}

/** Body only — for Copy Motion Prompt when assetType is video. */
export function formatMotionPromptBody(
  scene: YouTubeShortsProductionScene,
): string {
  if (scene.assetType !== "video" || !scene.motionPrompt.trim()) {
    return "";
  }
  return scene.motionPrompt.trimEnd();
}

/** Headered paste — used inside full scene package export. */
export function formatVisualPromptPaste(
  scene: YouTubeShortsProductionScene,
): string {
  return section("VISUAL PROMPT", formatVisualPromptBody(scene));
}

/** Headered paste — used inside full scene package export. */
export function formatMotionPromptPaste(
  scene: YouTubeShortsProductionScene,
): string {
  const body = formatMotionPromptBody(scene);
  if (!body) return "";
  return section("MOTION PROMPT", body);
}

export function formatCharacterExportBlock(
  production: Pick<
    YouTubeShortsProduction,
    "characterName" | "characterIdentity" | "characterContinuity"
  >,
): string {
  if (!hasCharacterProfile(production)) return "";
  return [
    section("CHARACTER NAME", production.characterName!.trim()),
    "",
    section("CHARACTER IDENTITY", production.characterIdentity!.trim()),
    "",
    section("CHARACTER CONTINUITY", production.characterContinuity!.trim()),
  ].join("\n");
}

/**
 * Deterministic full scene paste for external Studio.
 * Merges approved storyboard Scene N + workingProduction Scene N + optional CHARACTER*.
 * Never exports storyRole/purpose/sceneDescription/timing/projectVisualContinuity/bare CONTINUITY.
 */
export function formatFullScenePaste(input: {
  storyboardScene: YouTubeShortsStoryboardScene;
  productionScene: YouTubeShortsProductionScene;
  production: Pick<
    YouTubeShortsProduction,
    "characterName" | "characterIdentity" | "characterContinuity"
  >;
}): string {
  const { storyboardScene, productionScene, production } = input;
  if (storyboardScene.sceneNumber !== productionScene.sceneNumber) {
    throw new Error("storyboardScene and productionScene sceneNumber mismatch");
  }

  const parts: string[] = [];
  const character = formatCharacterExportBlock(production);
  if (character) {
    parts.push(character);
    parts.push("");
  }

  parts.push(formatVisualPromptPaste(productionScene));
  parts.push("");
  parts.push(section("NARRATION", storyboardScene.narration));

  if (productionScene.voiceDirection.trim()) {
    parts.push("");
    parts.push(section("VOICE DIRECTION", productionScene.voiceDirection));
  }

  if (storyboardScene.onScreenText.trim()) {
    parts.push("");
    parts.push(section("ON-SCREEN TEXT", storyboardScene.onScreenText));
  }

  parts.push("");
  parts.push(section("ASSET TYPE", productionScene.assetType));

  if (productionScene.assetType === "video") {
    parts.push("");
    parts.push(formatMotionPromptPaste(productionScene));
  }

  return parts.join("\n").trimEnd() + "\n";
}

/**
 * Owner note dump for the selected scene — all storyboard fields, plus
 * production fields when expanded. Not the Studio paste contract.
 */
export function formatSceneNotesPaste(input: {
  storyboardScene: YouTubeShortsStoryboardScene;
  productionScene?: YouTubeShortsProductionScene | null;
  production?: Pick<
    YouTubeShortsProduction,
    | "characterName"
    | "characterIdentity"
    | "characterContinuity"
    | "projectVisualContinuity"
  > | null;
}): string {
  const { storyboardScene, productionScene, production } = input;
  const parts: string[] = [
    `Scene ${storyboardScene.sceneNumber} — ${storyboardScene.storyRole}`,
    "",
    section("STORY ROLE", storyboardScene.storyRole),
    "",
    section("PURPOSE", storyboardScene.purpose),
    "",
    section("SCENE DESCRIPTION", storyboardScene.sceneDescription),
    "",
    section(
      "TIMING",
      `${storyboardScene.durationTargetSeconds}s`,
    ),
    "",
    section("NARRATION", storyboardScene.narration),
    "",
    section("ON-SCREEN TEXT", storyboardScene.onScreenText || "(none)"),
  ];

  if (productionScene) {
    parts.push("");
    parts.push(section("VISUAL PROMPT", productionScene.visualPrompt));
    parts.push("");
    parts.push(
      section(
        "VOICE DIRECTION",
        productionScene.voiceDirection.trim() || "(none)",
      ),
    );
    parts.push("");
    parts.push(section("ASSET TYPE", productionScene.assetType));
    parts.push("");
    parts.push(
      section(
        "MOTION PROMPT",
        productionScene.assetType === "video"
          ? productionScene.motionPrompt.trim() || "(none)"
          : "(n/a — image)",
      ),
    );
    parts.push("");
    parts.push(
      section(
        "CONTINUITY DELTA",
        productionScene.continuityDelta.trim() || "(none)",
      ),
    );
  }

  if (production?.projectVisualContinuity?.trim()) {
    parts.push("");
    parts.push(
      section("PROJECT VISUAL CONTINUITY", production.projectVisualContinuity),
    );
  }

  const character = production ? formatCharacterExportBlock(production) : "";
  if (character) {
    parts.push("");
    parts.push(character);
  }

  return parts.join("\n").trimEnd() + "\n";
}
