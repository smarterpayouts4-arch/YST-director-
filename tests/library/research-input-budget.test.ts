import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CI_STORAGE_KEY } from "@/features/content-intelligence/library/config/constants";
import {
  MAX_RESEARCH_INPUT_CHARS,
  RESEARCH_INPUT_WARN_RATIO,
  researchInputWarnThreshold,
  shouldWarnResearchInputLength,
} from "@/features/content-intelligence/library/config/research-input-limits";
import { ResearchArtifactSchema } from "@/features/content-intelligence/library/schemas/artifact";
import { ExtractResearchTextSchema } from "@/features/content-intelligence/library/schemas/extract-request";
import { acceptResearchHandoff, peekHandoff } from "@/features/content-intelligence/library/state/handoff";
import { hashText } from "@/features/content-intelligence/library/state/hash-text";

const LEGACY_48K = 48_000;

function stubBrowserStorage() {
  const store = new Map<string, string>();
  const session = new Map<string, string>();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    },
    sessionStorage: {
      getItem: (k: string) => session.get(k) ?? null,
      setItem: (k: string, v: string) => {
        session.set(k, v);
      },
      removeItem: (k: string) => {
        session.delete(k);
      },
    },
  });
  vi.stubGlobal("crypto", {
    randomUUID: () => "22222222-2222-2222-2222-222222222222",
    subtle: globalThis.crypto.subtle,
  });
  return { store, session };
}

function makeResearchOfLength(length: number): string {
  if (length <= 0) return "";
  const header = "Completed research body. ";
  if (length <= header.length) return "x".repeat(length);
  return header + "x".repeat(length - header.length);
}

describe("research input limits", () => {
  it("defines the interim 150k JS-length ceiling and 85% warn ratio", () => {
    expect(MAX_RESEARCH_INPUT_CHARS).toBe(150_000);
    expect(RESEARCH_INPUT_WARN_RATIO).toBe(0.85);
    expect(researchInputWarnThreshold()).toBe(127_500);
  });

  it("hides capacity warning below 85% and shows at the threshold", () => {
    expect(shouldWarnResearchInputLength(127_499)).toBe(false);
    expect(shouldWarnResearchInputLength(127_500)).toBe(true);
  });
});

describe("research input boundary matrix", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects empty paste", async () => {
    stubBrowserStorage();
    await expect(acceptResearchHandoff({ researchText: "   " })).rejects.toThrow(
      /paste the completed research/i,
    );
  });

  it.each([
    [47_999, "below legacy 48k"],
    [LEGACY_48K, "exact legacy 48k"],
    [48_001, "regression past legacy 48k"],
    [127_499, "just under warn threshold"],
    [127_500, "warn threshold"],
    [149_999, "just under max"],
    [MAX_RESEARCH_INPUT_CHARS, "exact max"],
  ] as const)("accepts length %i (%s)", async (length, label) => {
    expect(label).toEqual(expect.any(String));
    const { store } = stubBrowserStorage();
    const text = makeResearchOfLength(length);
    expect(text.length).toBe(length);

    const { artifactId } = await acceptResearchHandoff({ researchText: text });
    const envelope = JSON.parse(store.get(CI_STORAGE_KEY)!);
    const artifact = envelope.library.artifacts.find(
      (a: { artifactId: string }) => a.artifactId === artifactId,
    );
    expect(artifact.rawText).toBe(text);
    expect(artifact.rawText.length).toBe(length);
    expect(ExtractResearchTextSchema.safeParse(artifact.rawText).success).toBe(true);
    expect(ResearchArtifactSchema.safeParse(artifact).success).toBe(true);
  });

  it("rejects length one past the hard ceiling", async () => {
    stubBrowserStorage();
    const text = makeResearchOfLength(MAX_RESEARCH_INPUT_CHARS + 1);
    await expect(acceptResearchHandoff({ researchText: text })).rejects.toThrow(
      /will not silently truncate/i,
    );
    expect(ExtractResearchTextSchema.safeParse(text).success).toBe(false);
  });
});

describe("completed research intactness (~94k fixture)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stores and handoffs the fixture unchanged except end-trim", async () => {
    const { store } = stubBrowserStorage();
    const report = readFileSync(
      resolve(__dirname, "../fixtures/ci/zynava-completed-research.md"),
      "utf8",
    );
    expect(report.length).toBeGreaterThan(LEGACY_48K);
    expect(report.length).toBeLessThanOrEqual(MAX_RESEARCH_INPUT_CHARS);

    // Sole allowed mutation on handoff: trim leading/trailing whitespace.
    const expected = report.trim();
    const expectedHash = await hashText(expected);

    const { artifactId } = await acceptResearchHandoff({
      researchText: report,
      projectId: "proj_zynava",
    });

    const envelope = JSON.parse(store.get(CI_STORAGE_KEY)!);
    const artifact = envelope.library.artifacts.find(
      (a: { artifactId: string }) => a.artifactId === artifactId,
    );

    expect(artifact.rawText).toBe(expected);
    expect(artifact.rawText.length).toBe(expected.length);
    expect(artifact.contentHash).toBe(expectedHash);

    const handoff = peekHandoff();
    expect(handoff?.researchText).toBe(expected);
    expect(handoff?.contentHash).toBe(expectedHash);

    // Extract request boundary must accept the same bytes as stored rawText.
    const extractParse = ExtractResearchTextSchema.safeParse(artifact.rawText);
    expect(extractParse.success).toBe(true);
    if (extractParse.success) {
      expect(extractParse.data).toBe(expected);
    }
  });
});
