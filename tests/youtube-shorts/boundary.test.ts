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
      expect(text, file).not.toContain("YOUTUBE_SHORTS_MODEL");
    }
  });

  it("has no P1B/P1C scaffolding directories or renderer APIs", () => {
    expect(existsSync(join(shortsRoot, "prompts"))).toBe(false);
    expect(existsSync(join(shortsRoot, "services"))).toBe(false);
    expect(
      existsSync(resolve(repoRoot, "src/app/api/social-media")),
    ).toBe(false);
    expect(
      existsSync(join(shortsRoot, "schemas/youtube-shorts-storyboard.ts")),
    ).toBe(false);
  });

  it("surfaces persist save_failed as an error, not silent empty", () => {
    const shell = readFileSync(shellPath, "utf8");
    expect(shell).toMatch(
      /if\s*\(!saved\.ok\)\s*\{[\s\S]*setError\([\s\S]*Could not save this Shorts session/,
    );
  });
});
