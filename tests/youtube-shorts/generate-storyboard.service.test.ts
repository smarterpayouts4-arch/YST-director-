import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TopicPacket } from "@/features/content-intelligence/contracts/topic-packet";
import { YOUTUBE_SHORTS_PROJECTION_KEYS } from "@/features/social-media/youtube-shorts/contracts/project-topic-packet";
import { getRepairPolicy } from "@/ai/operations/repair-policy";

vi.mock("server-only", () => ({}));

const parseStructuredOutput = vi.fn();
vi.mock("@/ai/structured-output/parse-structured-output", () => ({
  parseStructuredOutput: (...args: unknown[]) => parseStructuredOutput(...args),
}));

vi.mock("@/lib/openai", () => ({
  getYouTubeShortsModel: () => "gpt-5.6-terra",
}));

import { generateYouTubeShortsStoryboard } from "@/features/social-media/youtube-shorts/services/generate-storyboard";

function makePacket(): TopicPacket {
  return {
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
    sourceRefs: ["secret-ref"],
    provenanceNotes: ["note"],
    supportingItemIds: ["i1"],
    desiredTakeaway: "d",
    hypothesisDependencies: [],
    unresolvedAssumptions: [],
    restrictions: ["Do not give medical advice."],
    limitations: [],
    doNotClaim: ["Do not give medical advice."],
  };
}

function makeBoard() {
  return {
    estimatedTotalSeconds: 49,
    scenes: [1, 2, 3, 4, 5, 6, 7].map((n) => ({
      sceneNumber: n,
      storyRole: `role-${n}`,
      purpose: "p",
      narration: "n",
      sceneDescription: "d",
      onScreenText: "t",
      durationTargetSeconds: 7,
    })),
  };
}

beforeEach(() => {
  parseStructuredOutput.mockReset();
});

describe("generateYouTubeShortsStoryboard", () => {
  it("projects the 16-key Atom slice and calls one storyboard operation", async () => {
    parseStructuredOutput.mockResolvedValue(makeBoard());
    const result = await generateYouTubeShortsStoryboard({
      packet: makePacket(),
      projectId: "proj_1",
      artifactId: "art_1",
      topicPacketId: "tp_a",
    });
    expect(result.storyboard.scenes).toHaveLength(7);
    expect(parseStructuredOutput).toHaveBeenCalledTimes(1);
    const args = parseStructuredOutput.mock.calls[0]?.[0] as {
      operation: string;
      model: string;
      input: string;
      repair: { buildPrompt: unknown; context?: { projection?: unknown } };
    };
    expect(args.operation).toBe("generate-shorts-storyboard");
    expect(args.model).toBe("gpt-5.6-terra");
    expect(args.repair.buildPrompt).toBeTypeOf("function");
    expect(args.repair.context?.projection).toEqual(
      expect.objectContaining({ title: "Title A" }),
    );
    const start = args.input.indexOf(
      "BEGIN_UNTRUSTED_YOUTUBE_SHORTS_ATOM_PROJECTION",
    );
    const end = args.input.indexOf(
      "END_UNTRUSTED_YOUTUBE_SHORTS_ATOM_PROJECTION",
    );
    const projected = JSON.parse(
      args.input.slice(
        start + "BEGIN_UNTRUSTED_YOUTUBE_SHORTS_ATOM_PROJECTION".length,
        end,
      ),
    );
    expect(Object.keys(projected).sort()).toEqual(
      [...YOUTUBE_SHORTS_PROJECTION_KEYS].sort(),
    );
    expect(projected).not.toHaveProperty("topicPacketId");
    expect(projected).not.toHaveProperty("sourceRefs");
  });

  it("rejects identity disagreement before any model call", async () => {
    await expect(
      generateYouTubeShortsStoryboard({
        packet: makePacket(),
        projectId: "proj_other",
        artifactId: "art_1",
      }),
    ).rejects.toMatchObject({ code: "INVALID_INPUT" });
    expect(parseStructuredOutput).not.toHaveBeenCalled();
  });

  it("uses the default ≤1 repair policy for the storyboard schema", () => {
    expect(getRepairPolicy("youtube_shorts_storyboard").maxAttempts).toBe(1);
  });
});
