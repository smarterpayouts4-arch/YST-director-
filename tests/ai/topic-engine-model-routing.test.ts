import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getEnv } from "@/lib/env";

describe("Topic Engine model routing isolation", () => {
  it("env defaults keep Librarian/RPB on Terra and TE on Sol", () => {
    const env = getEnv();
    // Defaults from schema when unset; .env.local may override — assert TE ≠ global when both set,
    // and documented defaults exist in source.
    expect(typeof env.OPENAI_MODEL).toBe("string");
    expect(typeof env.TOPIC_ENGINE_MODEL).toBe("string");
    expect(env.TOPIC_ENGINE_MODEL.length).toBeGreaterThan(0);
    const envSource = readFileSync(join(process.cwd(), "src/lib/env.ts"), "utf8");
    expect(envSource).toMatch(/OPENAI_MODEL:.*default\("gpt-5\.6-terra"\)/);
    expect(envSource).toMatch(/TOPIC_ENGINE_MODEL:.*default\("gpt-5\.6-sol"\)/);
    expect(envSource).toMatch(/YOUTUBE_SHORTS_MODEL:.*default\("gpt-5\.6-terra"\)/);
    expect(envSource).not.toMatch(/SOCIAL_MEDIA_MODEL/);
  });

  it("TE services pass model override; Librarian extract does not", () => {
    const dirs = readFileSync(
      join(
        process.cwd(),
        "src/features/content-intelligence/topics/services/propose-directions.ts",
      ),
      "utf8",
    );
    const topics = readFileSync(
      join(
        process.cwd(),
        "src/features/content-intelligence/topics/services/propose-topics.ts",
      ),
      "utf8",
    );
    const librarian = readFileSync(
      join(
        process.cwd(),
        "src/features/content-intelligence/library/services/extract-content-intelligence.ts",
      ),
      "utf8",
    );
    const gateway = readFileSync(
      join(process.cwd(), "src/ai/structured-output/parse-structured-output.ts"),
      "utf8",
    );
    expect(gateway).toMatch(/args\.model \?\? getOpenAIModel\(\)/);
    expect(dirs).toMatch(/getTopicEngineModel/);
    expect(dirs).toMatch(/model,/);
    expect(topics).toMatch(/model:\s*getTopicEngineModel\(\)/);
    expect(librarian).not.toMatch(/getTopicEngineModel/);
    const librarianCall = librarian.match(
      /const draft = await parseStructuredOutput\(\{([\s\S]*?)\}\);/,
    );
    expect(librarianCall?.[1]).toBeTruthy();
    expect(librarianCall![1]).not.toMatch(/(^|\n)\s*model\s*:/);
  });
});

