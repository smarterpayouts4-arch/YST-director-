import type { YouTubeShortsSession } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-session";
import type {
  YouTubeShortsProduction,
  YouTubeShortsProductionScene,
} from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-production";
import type {
  YouTubeShortsStoryboard,
  YouTubeShortsStoryboardScene,
} from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-storyboard";

export type StoryboardScenePatch = Partial<
  Pick<
    YouTubeShortsStoryboardScene,
    | "storyRole"
    | "purpose"
    | "narration"
    | "sceneDescription"
    | "onScreenText"
    | "durationTargetSeconds"
  >
>;

export type ProductionScenePatch = Partial<
  Pick<
    YouTubeShortsProductionScene,
    | "visualPrompt"
    | "voiceDirection"
    | "assetType"
    | "motionPrompt"
    | "continuityDelta"
  >
>;

export function orderedStoryboardScenes(
  board: YouTubeShortsStoryboard,
): YouTubeShortsStoryboardScene[] {
  return board.scenes.slice().sort((a, b) => a.sceneNumber - b.sceneNumber);
}

export function orderedProductionScenes(
  board: YouTubeShortsProduction,
): YouTubeShortsProductionScene[] {
  return board.scenes.slice().sort((a, b) => a.sceneNumber - b.sceneNumber);
}

/** Patch one scene. Other scenes and generated/approved snapshots stay untouched. */
export function updateWorkingScene(
  board: YouTubeShortsStoryboard,
  sceneNumber: number,
  patch: StoryboardScenePatch,
): YouTubeShortsStoryboard {
  return {
    ...board,
    scenes: board.scenes.map((scene) =>
      scene.sceneNumber === sceneNumber ? { ...scene, ...patch } : scene,
    ),
  };
}

/** Patch one production scene. Does not mutate generatedProduction. */
export function updateWorkingProductionScene(
  board: YouTubeShortsProduction,
  sceneNumber: number,
  patch: ProductionScenePatch,
): YouTubeShortsProduction {
  return {
    ...board,
    scenes: board.scenes.map((scene) =>
      scene.sceneNumber === sceneNumber ? { ...scene, ...patch } : scene,
    ),
  };
}

function cloneStoryboard(
  board: YouTubeShortsStoryboard,
): YouTubeShortsStoryboard {
  return JSON.parse(JSON.stringify(board)) as YouTubeShortsStoryboard;
}

function cloneProduction(
  board: YouTubeShortsProduction,
): YouTubeShortsProduction {
  return JSON.parse(JSON.stringify(board)) as YouTubeShortsProduction;
}

function stamp(
  session: YouTubeShortsSession,
  patch: Partial<YouTubeShortsSession>,
): YouTubeShortsSession {
  return {
    ...session,
    ...patch,
    ingestedAtom: session.ingestedAtom,
    createdAt: session.createdAt,
    updatedAt: new Date().toISOString(),
  };
}

function clearProductionFields(): Pick<
  YouTubeShortsSession,
  | "generatedProduction"
  | "workingProduction"
  | "productionPromptVersion"
  | "productionGeneratedAt"
> {
  return {
    generatedProduction: null,
    workingProduction: null,
    productionPromptVersion: undefined,
    productionGeneratedAt: undefined,
  };
}

export function applyGeneratedStoryboard(
  session: YouTubeShortsSession,
  storyboard: YouTubeShortsStoryboard,
  promptVersion: string,
): YouTubeShortsSession {
  const next = cloneStoryboard(storyboard);
  return stamp(session, {
    stage: "storyboard_draft",
    promptVersion,
    generatedStoryboard: next,
    workingStoryboard: cloneStoryboard(next),
    approvedStoryboard: null,
    ...clearProductionFields(),
  });
}

export function applyWorkingStoryboard(
  session: YouTubeShortsSession,
  working: YouTubeShortsStoryboard,
): YouTubeShortsSession {
  if (session.stage === "storyboard_approved") {
    throw Object.assign(
      new Error("Reopen the approved storyboard before editing."),
      { code: "INVALID_INPUT" as const },
    );
  }
  return stamp(session, {
    stage: "storyboard_draft",
    workingStoryboard: cloneStoryboard(working),
    approvedStoryboard: null,
    ...clearProductionFields(),
  });
}

export function approveWorkingStoryboard(
  session: YouTubeShortsSession,
): YouTubeShortsSession {
  if (!session.workingStoryboard) {
    throw Object.assign(new Error("No working storyboard to approve."), {
      code: "INVALID_INPUT" as const,
    });
  }
  return stamp(session, {
    stage: "storyboard_approved",
    approvedStoryboard: cloneStoryboard(session.workingStoryboard),
  });
}

export function reopenApprovedStoryboard(
  session: YouTubeShortsSession,
): YouTubeShortsSession {
  return stamp(session, {
    stage: "storyboard_draft",
    approvedStoryboard: null,
    ...clearProductionFields(),
  });
}

export function applyGeneratedProduction(
  session: YouTubeShortsSession,
  production: YouTubeShortsProduction,
  productionPromptVersion: string,
  generatedAt: string = new Date().toISOString(),
): YouTubeShortsSession {
  if (session.stage !== "storyboard_approved" || !session.approvedStoryboard) {
    throw Object.assign(
      new Error("Approve the storyboard before expanding production."),
      { code: "INVALID_INPUT" as const },
    );
  }
  const next = cloneProduction(production);
  return stamp(session, {
    generatedProduction: next,
    workingProduction: cloneProduction(next),
    productionPromptVersion,
    productionGeneratedAt: generatedAt,
  });
}

export function applyWorkingProduction(
  session: YouTubeShortsSession,
  working: YouTubeShortsProduction,
): YouTubeShortsSession {
  if (!session.generatedProduction) {
    throw Object.assign(new Error("No generated production to edit."), {
      code: "INVALID_INPUT" as const,
    });
  }
  return stamp(session, {
    workingProduction: cloneProduction(working),
  });
}

export function workingDiffersFromGenerated(
  session: YouTubeShortsSession,
): boolean {
  if (!session.generatedStoryboard || !session.workingStoryboard) return false;
  return (
    JSON.stringify(session.generatedStoryboard) !==
    JSON.stringify(session.workingStoryboard)
  );
}

export function productionDiffersFromGenerated(
  session: YouTubeShortsSession,
): boolean {
  if (!session.generatedProduction || !session.workingProduction) return false;
  return (
    JSON.stringify(session.generatedProduction) !==
    JSON.stringify(session.workingProduction)
  );
}
