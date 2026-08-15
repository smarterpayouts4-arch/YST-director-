import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock(
  "@/features/social-media/youtube-shorts/services/generate-storyboard",
  () => ({
    generateYouTubeShortsStoryboard: vi.fn(),
  }),
);

import { POST } from "@/app/api/social-media/youtube-shorts/storyboard/route";
import { generateYouTubeShortsStoryboard } from "@/features/social-media/youtube-shorts/services/generate-storyboard";

describe("POST /api/social-media/youtube-shorts/storyboard", () => {
  beforeEach(() => {
    vi.mocked(generateYouTubeShortsStoryboard).mockReset();
  });

  it("returns a seven-scene storyboard from the service", async () => {
    vi.mocked(generateYouTubeShortsStoryboard).mockResolvedValue({
      promptVersion: "ci-shorts-1.0.0",
      storyboard: {
        estimatedTotalSeconds: 49,
        scenes: [1, 2, 3, 4, 5, 6, 7].map((n) => ({
          sceneNumber: n,
          storyRole: `r${n}`,
          purpose: "p",
          narration: "n",
          sceneDescription: "d",
          onScreenText: "t",
          durationTargetSeconds: 7,
        })),
      },
    });

    const res = await POST(
      new Request("http://localhost/api/social-media/youtube-shorts/storyboard", {
        method: "POST",
        body: JSON.stringify({
          ingestedAtom: { topicPacketId: "tp_a" },
          topicPacketId: "tp_a",
          projectId: "proj_1",
          artifactId: "art_1",
        }),
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.storyboard.scenes).toHaveLength(7);
    expect(body.promptVersion).toBe("ci-shorts-1.0.0");
  });

  it("maps a second invalid model result to a controlled failure", async () => {
    vi.mocked(generateYouTubeShortsStoryboard).mockRejectedValue(
      Object.assign(new Error("Storyboard did not contain exactly 7 numbered scenes."), {
        code: "MODEL_OUTPUT_INVALID",
      }),
    );
    const res = await POST(
      new Request("http://localhost/api/social-media/youtube-shorts/storyboard", {
        method: "POST",
        body: JSON.stringify({ ingestedAtom: {} }),
      }),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("MODEL_OUTPUT_INVALID");
  });
});
