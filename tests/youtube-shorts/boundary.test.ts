import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const socialMediaRoot = resolve(repoRoot, "src/features/social-media");
const shortsRoot = resolve(socialMediaRoot, "youtube-shorts");
const hubPath = resolve(socialMediaRoot, "components/social-media-hub.tsx");
const shellPath = resolve(
  shortsRoot,
  "components/youtube-shorts-shell.tsx",
);

function collectSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(full));
      continue;
    }
    if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      files.push(full);
    }
  }
  return files;
}

describe("YouTube Shorts / Social Media import boundary", () => {
  it("keeps the Social Media hub free of Shorts contracts, state, and ingest", () => {
    const hub = readFileSync(hubPath, "utf8");
    expect(hub).not.toMatch(/youtube-shorts\/(contracts|state|schemas)/);
    expect(hub).not.toContain("ingestTopicPacket");
    expect(hub).not.toContain("persistSession");
    expect(hub).not.toContain("loadShortsSession");
  });

  it("forbids TE creative imports, Reference runtime imports, and shared brains", () => {
    const sources = collectSourceFiles(socialMediaRoot);
    expect(sources.length).toBeGreaterThan(0);
    for (const file of sources) {
      const text = readFileSync(file, "utf8");
      expect(text, file).not.toMatch(
        /content-intelligence\/topics\/prompts/,
      );
      expect(text, file).not.toMatch(/topic-strategy-doctrine/);
      expect(text, file).not.toMatch(/from ["'][^"']*Reference\//);
      expect(text, file).not.toContain("SOCIAL_MEDIA_MODEL");
    }
    const hub = readFileSync(hubPath, "utf8");
    expect(hub).not.toContain("YOUTUBE_SHORTS_MODEL");
  });

  it("keeps P1C expansion present without shared-brain or mount auto-run", () => {
    expect(
      existsSync(resolve(repoRoot, "src/app/api/social-media/youtube-shorts/expand")),
    ).toBe(true);
    expect(
      existsSync(join(shortsRoot, "schemas/youtube-shorts-production.ts")),
    ).toBe(true);
    expect(
      existsSync(join(shortsRoot, "export/format-scene-paste.ts")),
    ).toBe(true);
    const storyboard = readFileSync(
      join(shortsRoot, "schemas/youtube-shorts-storyboard.ts"),
      "utf8",
    );
    expect(storyboard).not.toContain("imagePrompt");
    expect(storyboard).not.toContain("motionPrompt");
    expect(storyboard).not.toContain("visualPrompt");
    const production = readFileSync(
      join(shortsRoot, "schemas/youtube-shorts-production.ts"),
      "utf8",
    );
    expect(production).toContain("visualPrompt");
    expect(production).toContain("motionPrompt");
    expect(production).not.toMatch(/\bnarration\s*:/);
    expect(production).not.toMatch(/\bonScreenText\s*:/);
    expect(production).not.toContain("approvedProduction");

    const shell = readFileSync(shellPath, "utf8");
    const mountEffect = shell.match(
      /useEffect\(\(\) => \{[\s\S]*?\}, \[topicPacketId, projectId, artifactId\]\);/,
    );
    expect(mountEffect?.[0]).toBeTruthy();
    expect(mountEffect?.[0]).not.toContain("generateStoryboard");
    expect(mountEffect?.[0]).not.toContain("expandProduction");
    expect(mountEffect?.[0]).not.toContain(
      "/api/social-media/youtube-shorts/storyboard",
    );
    expect(mountEffect?.[0]).not.toContain(
      "/api/social-media/youtube-shorts/expand",
    );
    expect(shell).toContain("generateStoryboard");
    expect(shell).toContain("expandProduction");

    const editor = readFileSync(
      join(shortsRoot, "components/storyboard-scene-editor.tsx"),
      "utf8",
    );
    expect(editor).toContain("visualPrompt");
    expect(editor).toContain("motionPrompt");
    expect(editor).toContain("voiceDirection");
    expect(editor).toContain("assetType");
    expect(editor).toContain("Copy Visual Prompt");
    expect(editor).toContain("Copy Motion Prompt");
    expect(editor).toContain("Copy Full Scene Package");
    expect(editor).toContain('role="tab"');
    expect(editor).toContain("overflow-hidden");
    expect(editor).not.toContain("overflow-x-auto");
    expect(editor).toContain("formatVisualPromptBody");
    expect(editor).toContain("formatMotionPromptBody");
    expect(editor).not.toMatch(/formatVisualPromptPaste\(/);
    expect(editor).not.toMatch(/gemini|GenerativeModel|uploadImage|image-generation/i);
    expect(editor).not.toContain("Pending P1C expansion");
    expect(editor).not.toContain("approvedProduction");

    expect(
      readFileSync(join(shortsRoot, "components/storyboard-scene-card.tsx"), "utf8"),
    ).toContain("aspect-[9/16]");
    expect(
      readFileSync(join(shortsRoot, "components/storyboard-scene-card.tsx"), "utf8"),
    ).toContain("flex-1");
    expect(
      readFileSync(join(shortsRoot, "components/storyboard-scene-strip.tsx"), "utf8"),
    ).toContain("gap-4");
    const fullStory = readFileSync(
      join(shortsRoot, "components/storyboard-full-story.tsx"),
      "utf8",
    );
    expect(fullStory).toContain('role="dialog"');
    expect(fullStory).toContain("fixed");
    expect(fullStory).toContain("data-story-map-drawer");
    expect(fullStory).not.toContain("data-full-story-drawer");
    expect(fullStory).toContain("scene.purpose");
    expect(fullStory).toContain("scene.narration");

    const review = readFileSync(
      join(shortsRoot, "components/storyboard-review.tsx"),
      "utf8",
    );
    expect(review).toContain("View Story Map");
    expect(review).not.toContain("View Full Story");
    expect(review).toContain("Expand Production");
    expect(review).toContain("productionGeneratedAt");
    expect(review).not.toMatch(
      /productionFocusKey=\{[^}]*productionPromptVersion/,
    );
    expect(review).not.toMatch(/gemini|uploadImage|image-generation/i);

    const readyView = readFileSync(
      join(shortsRoot, "components/youtube-shorts-ready-view.tsx"),
      "utf8",
    );
    expect(readyView).toContain("View Story Map");
    expect(readyView).not.toMatch(/View full story/i);
  });

  it("surfaces persist save_failed as an error, not silent empty", () => {
    const shell = readFileSync(shellPath, "utf8");
    expect(shell).toMatch(
      /if\s*\(!saved\.ok\)\s*\{[\s\S]*setError\([\s\S]*Could not save this Shorts session/,
    );
  });
});
