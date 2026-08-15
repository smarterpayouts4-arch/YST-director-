import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

beforeAll(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
});
import { YouTubeShortsStoryboardReview } from "@/features/social-media/youtube-shorts/components/storyboard-review";
import type { YouTubeShortsSession } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-session";
import type { YouTubeShortsStoryboard } from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-storyboard";

const EXPECTED_TABS = [
  "Role",
  "Purpose",
  "Scene Description",
  "Timing",
  "Narration",
  "On-Screen Text",
  "Visual Prompt",
  "Voice Direction",
  "Asset Type",
  "Motion Prompt",
  "Continuity",
];

function makeBoard(): YouTubeShortsStoryboard {
  return {
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
}

function makeSession(
  stage: YouTubeShortsSession["stage"] = "storyboard_draft",
): YouTubeShortsSession {
  const board = makeBoard();
  return {
    topicPacketId: "tp_a",
    projectId: "proj_1",
    artifactId: "art_1",
    ingestedAtom: {
      topicPacketId: "tp_a",
      topicId: "topic_a",
      territoryId: "terr_1",
      libraryId: "lib_1",
      artifactId: "art_1",
      projectId: "proj_1",
      version: 1,
      status: "selected",
      createdAt: "2026-08-13T00:00:00.000Z",
      confidence: "high",
      title: "Title A",
      premise: "p",
      audience: "a",
      customerMoment: "m",
      decisionQuestion: "q",
      tension: "t",
      opportunity: "o",
      whyItMatters: "w",
      supportingInsights: ["i"],
      evidenceQuotes: [],
      sourceRefs: [],
      provenanceNotes: [],
      supportingItemIds: ["i1"],
      desiredTakeaway: "d",
      hypothesisDependencies: [],
      unresolvedAssumptions: [],
      restrictions: [],
      limitations: [],
      doNotClaim: [],
    },
    stage,
    createdAt: "2026-08-13T00:00:00.000Z",
    updatedAt: "2026-08-13T00:00:00.000Z",
    promptVersion: "v",
    generatedStoryboard: board,
    workingStoryboard: board,
    approvedStoryboard: stage === "storyboard_approved" ? board : null,
  };
}

let root: Root | null = null;
let container: HTMLDivElement | null = null;

async function renderReview(
  session: YouTubeShortsSession,
  onChangeWorking = vi.fn(),
  onChangeWorkingProduction = vi.fn(),
  onExpand = vi.fn(),
  onGenerate = vi.fn(),
  onReopen = vi.fn(),
) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root!.render(
      <YouTubeShortsStoryboardReview
        session={session}
        busy={false}
        onGenerate={onGenerate}
        onExpand={onExpand}
        onChangeWorking={onChangeWorking}
        onChangeWorkingProduction={onChangeWorkingProduction}
        onApprove={vi.fn()}
        onReopen={onReopen}
      />,
    );
  });
  return {
    container,
    onChangeWorking,
    onChangeWorkingProduction,
    onExpand,
    onGenerate,
    onReopen,
  };
}

async function rerenderReview(
  session: YouTubeShortsSession,
  handlers: {
    onChangeWorking?: ReturnType<typeof vi.fn>;
    onChangeWorkingProduction?: ReturnType<typeof vi.fn>;
    onExpand?: ReturnType<typeof vi.fn>;
    onGenerate?: ReturnType<typeof vi.fn>;
  } = {},
) {
  if (!root) throw new Error("no root");
  await act(async () => {
    root!.render(
      <YouTubeShortsStoryboardReview
        session={session}
        busy={false}
        onGenerate={handlers.onGenerate ?? vi.fn()}
        onExpand={handlers.onExpand ?? vi.fn()}
        onChangeWorking={handlers.onChangeWorking ?? vi.fn()}
        onChangeWorkingProduction={
          handlers.onChangeWorkingProduction ?? vi.fn()
        }
        onApprove={vi.fn()}
        onReopen={vi.fn()}
      />,
    );
  });
}

function withProduction(
  session: YouTubeShortsSession,
  generatedAt = "2026-08-14T12:00:00.000Z",
): YouTubeShortsSession {
  const board = {
    projectVisualContinuity: "Shared look",
    scenes: [1, 2, 3, 4, 5, 6, 7].map((n) => ({
      sceneNumber: n,
      visualPrompt: `visual-${n}`,
      voiceDirection: "steady",
      assetType: "video" as const,
      motionPrompt: `motion-${n}`,
      continuityDelta: `delta-${n}`,
    })),
  };
  return {
    ...session,
    stage: "storyboard_approved",
    approvedStoryboard: session.approvedStoryboard ?? makeBoard(),
    workingProduction: board,
    generatedProduction: board,
    productionPromptVersion: "ci-shorts-production-1.0.0",
    productionGeneratedAt: generatedAt,
  };
}

function tabButtons(el: HTMLElement) {
  return Array.from(el.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
}

function clickTab(el: HTMLElement, label: string) {
  const tab = tabButtons(el).find((button) =>
    (button.textContent ?? "").includes(label),
  );
  expect(tab, `missing tab ${label}`).toBeTruthy();
  return act(async () => {
    tab!.click();
  });
}

afterEach(async () => {
  if (root) {
    await act(async () => {
      root!.unmount();
    });
  }
  container?.remove();
  root = null;
  container = null;
});

describe("storyboard workspace UI", () => {
  it("renders contact sheet and 11 field tabs with one active panel", async () => {
    const { container: el } = await renderReview(makeSession());
    const frames = el.querySelectorAll("[data-scene-number]");
    expect(frames).toHaveLength(7);
    expect(el.textContent).toContain("STORYBOARD SUMMARY");
    expect(el.textContent).toContain("7 scenes · ~49s");

    const tabs = tabButtons(el);
    expect(tabs).toHaveLength(11);
    expect(tabs.map((tab) => tab.textContent?.replace(/\s*P1C\s*$/, "").trim())).toEqual(
      EXPECTED_TABS,
    );

    expect(el.querySelector("input[value='role-1']")).toBeTruthy();
    expect(el.textContent).not.toContain("purpose-1");
    expect(el.querySelector("textarea")).toBeNull();

    const copyScene = Array.from(el.querySelectorAll("button")).find(
      (button) => (button.textContent ?? "").includes("Copy scene"),
    );
    expect(copyScene).toBeTruthy();
    expect(copyScene?.disabled).toBe(false);

    const copyButtons = Array.from(el.querySelectorAll("button")).filter(
      (button) =>
        /Copy (Visual Prompt|Motion Prompt|Full Scene Package)/.test(
          button.textContent ?? "",
        ),
    );
    expect(copyButtons).toHaveLength(3);
    expect(copyButtons.every((button) => button.disabled)).toBe(true);

    const scene4 = el.querySelector(
      "[data-scene-number='4']",
    ) as HTMLButtonElement;
    await act(async () => {
      scene4.click();
    });
    expect(el.textContent).toContain("Scene 4 — role-4");
    expect(el.querySelector("input[value='role-4']")).toBeTruthy();
  });

  it("switching tabs does not mutate story state", async () => {
    const { container: el, onChangeWorking } = await renderReview(makeSession());
    await clickTab(el, "Purpose");
    await clickTab(el, "Narration");
    expect(onChangeWorking).not.toHaveBeenCalled();
    expect(el.querySelector("textarea")?.value).toBe("narration-1");
  });

  it("shows only the active field panel", async () => {
    const { container: el } = await renderReview(makeSession());
    await clickTab(el, "Purpose");
    expect(el.querySelector("textarea")?.value).toBe("purpose-1");
    expect(el.querySelector("input[value='role-1']")).toBeNull();
    await clickTab(el, "Timing");
    expect(el.querySelector('input[type="number"]')).toBeTruthy();
    expect(el.querySelector("textarea")).toBeNull();
  });

  it("narration and on-screen text show schema counters", async () => {
    const { container: el } = await renderReview(makeSession());
    await clickTab(el, "Narration");
    expect(el.textContent).toMatch(/Characters:\s*\d+\s*\/\s*800/);
    expect(el.textContent).toMatch(/Words:\s*\d+/);
    await clickTab(el, "On-Screen Text");
    expect(el.textContent).toMatch(/Characters:\s*\d+\s*\/\s*200/);
  });

  it("P1C tabs show expand placeholders until production exists", async () => {
    const { container: el, onChangeWorking } = await renderReview(makeSession());
    await clickTab(el, "Visual Prompt");
    expect(el.textContent).toContain(
      "Expand production after storyboard approval",
    );
    expect(el.querySelector("textarea")).toBeNull();
    await clickTab(el, "Asset Type");
    expect(el.textContent).toContain(
      "Expand production after storyboard approval",
    );
    expect(onChangeWorking).not.toHaveBeenCalled();
  });

  it("approved stage shows Expand Production CTA", async () => {
    const { container: el, onExpand } = await renderReview(
      makeSession("storyboard_approved"),
    );
    const expand = Array.from(el.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Expand Production",
    );
    expect(expand).toBeTruthy();
    await act(async () => {
      expand!.click();
    });
    expect(onExpand).toHaveBeenCalledOnce();
  });

  it("fills production tabs and enables Copy when workingProduction exists", async () => {
    const session = withProduction(makeSession("storyboard_approved"));
    const { container: el, onChangeWorkingProduction } = await renderReview(
      session,
    );
    // Visual Prompt is the default panel when production exists — no tab click.
    const visual = el.querySelector("textarea") as HTMLTextAreaElement;
    expect(el.textContent).toContain("Scene 1 — role-1");
    expect(visual?.value).toBe("visual-1");
    expect(visual.disabled).toBe(false);

    const copyButtons = Array.from(el.querySelectorAll("button")).filter(
      (button) =>
        /Copy (Visual Prompt|Motion Prompt|Full Scene Package)/.test(
          button.textContent ?? "",
        ),
    );
    expect(copyButtons.every((button) => !button.disabled)).toBe(true);

    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value",
      )?.set;
      setter?.call(visual, "visual-1-edited");
      visual.dispatchEvent(new Event("input", { bubbles: true }));
      visual.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(onChangeWorkingProduction).toHaveBeenCalled();
    const next = onChangeWorkingProduction.mock.calls[0][0];
    expect(next.scenes.find((s: { sceneNumber: number }) => s.sceneNumber === 1)
      ?.visualPrompt).toBe("visual-1-edited");
    expect(next.scenes.find((s: { sceneNumber: number }) => s.sceneNumber === 2)
      ?.visualPrompt).toBe("visual-2");
  });

  it("new productionGeneratedAt focuses Scene 1 Visual Prompt without expand call", async () => {
    const first = withProduction(
      makeSession("storyboard_approved"),
      "2026-08-14T12:00:00.000Z",
    );
    const onExpand = vi.fn();
    const onGenerate = vi.fn();
    const { container: el } = await renderReview(
      first,
      vi.fn(),
      vi.fn(),
      onExpand,
      onGenerate,
    );
    expect(el.querySelector("textarea")?.value).toBe("visual-1");

    const scene4 = el.querySelector(
      "[data-scene-number='4']",
    ) as HTMLButtonElement;
    await act(async () => {
      scene4.click();
    });
    expect(el.textContent).toContain("Scene 4 — role-4");
    await clickTab(el, "Role");
    expect(el.querySelector("input[value='role-4']")).toBeTruthy();
    expect(onExpand).not.toHaveBeenCalled();
    expect(onGenerate).not.toHaveBeenCalled();

    const reexpanded = withProduction(
      makeSession("storyboard_approved"),
      "2026-08-14T12:05:00.000Z",
    );
    await rerenderReview(reexpanded, { onExpand, onGenerate });
    expect(el.textContent).toContain("Scene 1 — role-1");
    expect(el.querySelector("textarea")?.value).toBe("visual-1");
    // Focus is UI-only; same promptVersion may re-expand with a new generatedAt.
    expect(reexpanded.productionPromptVersion).toBe(
      first.productionPromptVersion,
    );
    expect(onExpand).not.toHaveBeenCalled();
    expect(onGenerate).not.toHaveBeenCalled();
  });

  it("scene and tab selection do not invoke expand or generate", async () => {
    const session = withProduction(makeSession("storyboard_approved"));
    const onExpand = vi.fn();
    const onGenerate = vi.fn();
    const { container: el } = await renderReview(
      session,
      vi.fn(),
      vi.fn(),
      onExpand,
      onGenerate,
    );
    await clickTab(el, "Motion Prompt");
    await clickTab(el, "Visual Prompt");
    const scene3 = el.querySelector(
      "[data-scene-number='3']",
    ) as HTMLButtonElement;
    await act(async () => {
      scene3.click();
    });
    expect(onExpand).not.toHaveBeenCalled();
    expect(onGenerate).not.toHaveBeenCalled();
  });

  it("preserves the active field tab across Next Scene", async () => {
    const { container: el } = await renderReview(makeSession());
    await clickTab(el, "Narration");
    expect(el.querySelector("textarea")?.value).toBe("narration-1");
    const next = Array.from(el.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Next Scene",
    ) as HTMLButtonElement;
    await act(async () => {
      next.click();
    });
    expect(el.textContent).toContain("Scene 2 — role-2");
    expect(el.querySelector("textarea")?.value).toBe("narration-2");
  });

  it("approved storyboard disables P1B field inputs", async () => {
    const { container: el } = await renderReview(
      makeSession("storyboard_approved"),
    );
    const roleInput = el.querySelector(
      "input[value='role-1']",
    ) as HTMLInputElement;
    expect(roleInput.disabled).toBe(true);
    await clickTab(el, "Narration");
    expect((el.querySelector("textarea") as HTMLTextAreaElement).disabled).toBe(
      true,
    );
  });

  it("View Story Map opens as overlay drawer without mutating story state", async () => {
    const { container: el, onChangeWorking } = await renderReview(
      makeSession(),
    );
    const toggle = Array.from(el.querySelectorAll("button")).find((button) =>
      button.textContent?.trim() === "View Story Map",
    );
    expect(toggle).toBeTruthy();
    await act(async () => {
      toggle!.click();
    });
    const region = el.querySelector('[role="dialog"][aria-label="Story map"]');
    expect(region).toBeTruthy();
    expect(region?.closest(".fixed")).toBeTruthy();
    expect(region?.getAttribute("data-story-map-drawer")).toBe("true");
    expect(region?.getAttribute("data-full-story-drawer")).toBeNull();
    expect(region?.querySelectorAll("article")).toHaveLength(7);
    expect(region?.textContent).toContain("purpose-1");
    expect(region?.textContent).toContain("purpose-7");
    expect(region?.textContent).toContain("narration-1");
    expect(region?.textContent).toContain("narration-7");
    expect(region?.textContent).toContain("role-1");
    expect(region?.querySelector("textarea")).toBeNull();
    expect(onChangeWorking).not.toHaveBeenCalled();
    expect(el.querySelector("input[value='role-1']")).toBeTruthy();
  });

  it("Story Map reflects current workingStoryboard edits, not a separate cache", async () => {
    const session = makeSession();
    const edited = structuredClone(session.workingStoryboard!);
    const scene1 = edited.scenes.find((scene) => scene.sceneNumber === 1)!;
    scene1.purpose = "edited-job-1";
    scene1.narration = "edited-beat-1";
    session.workingStoryboard = edited;
    // generated remains unedited defaults — map must follow working board
    expect(session.generatedStoryboard?.scenes[0]?.purpose).toBe("purpose-1");

    const { container: el } = await renderReview(session);
    const toggle = Array.from(el.querySelectorAll("button")).find((button) =>
      button.textContent?.trim() === "View Story Map",
    );
    await act(async () => {
      toggle!.click();
    });
    const region = el.querySelector('[role="dialog"][aria-label="Story map"]');
    expect(region?.textContent).toContain("edited-job-1");
    expect(region?.textContent).toContain("edited-beat-1");
    expect(region?.textContent).not.toContain("purpose-1");
    expect(region?.textContent).not.toContain("narration-1");
  });

  it("approved + production teaches reopen clears production; no Regenerate Storyboard", async () => {
    const onReopen = vi.fn();
    const { container: el } = await renderReview(
      withProduction(makeSession("storyboard_approved")),
      vi.fn(),
      vi.fn(),
      vi.fn(),
      vi.fn(),
      onReopen,
    );
    const labels = Array.from(el.querySelectorAll("button")).map((button) =>
      button.textContent?.trim(),
    );
    expect(labels).toContain("Re-expand Production");
    expect(labels).toContain("Reopen to edit");
    expect(labels).not.toContain("Regenerate Storyboard");
    expect(labels).not.toContain("Regenerate");
    expect(el.textContent).toContain(
      "Need to change the story? Reopen to edit. This clears the current production so you can edit or regenerate the storyboard.",
    );

    const reopen = Array.from(el.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Reopen to edit",
    );
    expect(reopen).toBeTruthy();
    await act(async () => {
      reopen!.click();
    });
    expect(onReopen).toHaveBeenCalledOnce();
  });

  it("draft after production cleared shows Regenerate Storyboard and wires onGenerate", async () => {
    const draft = makeSession("storyboard_draft");
    const onGenerate = vi.fn();
    const { container: el } = await renderReview(
      draft,
      vi.fn(),
      vi.fn(),
      vi.fn(),
      onGenerate,
    );
    const labels = Array.from(el.querySelectorAll("button")).map((button) =>
      button.textContent?.trim(),
    );
    expect(labels).toContain("Regenerate Storyboard");
    expect(labels).toContain("Approve Storyboard");
    expect(labels).not.toContain("Expand Production");
    expect(labels).not.toContain("Re-expand Production");
    expect(el.textContent).toContain(
      "Regenerate Storyboard runs the current Shorts story brain and replaces the current draft.",
    );

    const regen = Array.from(el.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Regenerate Storyboard",
    );
    expect(regen).toBeTruthy();
    await act(async () => {
      regen!.click();
    });
    expect(onGenerate).toHaveBeenCalledOnce();
  });

  it("editing narration patches only that scene", async () => {
    const { container: el, onChangeWorking } = await renderReview(
      makeSession(),
    );
    await clickTab(el, "Narration");
    const narration = el.querySelector("textarea") as HTMLTextAreaElement;
    expect(narration?.value).toBe("narration-1");
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value",
      )?.set;
      setter?.call(narration, "only-scene-1");
      narration.dispatchEvent(new Event("input", { bubbles: true }));
      narration.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(onChangeWorking).toHaveBeenCalled();
    const next = onChangeWorking.mock.calls[0][0] as YouTubeShortsStoryboard;
    expect(next.scenes.find((scene) => scene.sceneNumber === 1)?.narration).toBe(
      "only-scene-1",
    );
    expect(next.scenes.find((scene) => scene.sceneNumber === 2)?.narration).toBe(
      "narration-2",
    );
  });
});
