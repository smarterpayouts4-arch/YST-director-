import { afterEach, describe, expect, it, vi } from "vitest";
import { CI_STORAGE_KEY } from "@/features/content-intelligence/library/config/constants";
import { STORAGE_KEY as RPB_STORAGE_KEY } from "@/features/research-prompt-builder/config/constants";
import { acceptResearchHandoff } from "@/features/content-intelligence/library/state/handoff";

describe("acceptResearchHandoff boundary", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("writes CI storage only and never touches RPB storage key", async () => {
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
      randomUUID: () => "11111111-1111-1111-1111-111111111111",
      subtle: globalThis.crypto.subtle,
    });

    const result = await acceptResearchHandoff({
      researchText: "Completed ChatGPT research about demand and competitors.",
      projectId: "proj_test",
    });

    expect(result.artifactId).toMatch(/^art_/);
    expect(store.has(CI_STORAGE_KEY)).toBe(true);
    expect(store.has(RPB_STORAGE_KEY)).toBe(false);
    expect(store.get(RPB_STORAGE_KEY)).toBeUndefined();

    const envelope = JSON.parse(store.get(CI_STORAGE_KEY)!);
    expect(envelope.library.artifacts[0].rawText).toContain("Completed ChatGPT research");
    expect(envelope.library.artifacts[0].promptVersion).toBeUndefined();
    expect(envelope.library.stage).toBe("pending_extract");
  });
});
