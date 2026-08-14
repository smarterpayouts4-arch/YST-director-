import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock(
  "@/features/content-intelligence/topics/services/propose-directions",
  () => ({
    proposeTopicDirections: vi.fn(),
  }),
);

import { POST } from "@/app/api/content-intelligence/propose-directions/route";
import { proposeTopicDirections } from "@/features/content-intelligence/topics/services/propose-directions";

describe("POST /api/content-intelligence/propose-directions", () => {
  beforeEach(() => {
    vi.mocked(proposeTopicDirections).mockReset();
  });

  it("returns directions from service", async () => {
    vi.mocked(proposeTopicDirections).mockResolvedValue({
      directions: [
        {
          territoryId: "terr_1",
          name: "Equivalence before price",
          description: "d",
          decisionQuestion: "Are these products comparable?",
          primaryAudience: "a",
          primaryMoment: "m",
          primaryTension: "t",
          primaryOpportunity: "o",
          supportingItemIds: ["i1", "i2"],
          confidence: "high",
          priority: 1,
          rationale: "r",
          hypothesisDependent: false,
          unresolvedDependent: false,
        },
      ],
      dropped: [],
      diagnostics: {
        draftCount: 1,
        keptCount: 1,
        droppedCount: 0,
        droppedReasons: [],
        promptVersion: "ci-topics-1.1.9",
        model: "gpt-5.6-sol",
      },
    });

    const res = await POST(
      new Request("http://localhost/api/content-intelligence/propose-directions", {
        method: "POST",
        body: JSON.stringify({
          artifactId: "art_1",
          publishedLibrary: { libraryId: "lib_1", publishedAt: "2026-08-12T12:00:00.000Z", items: [] },
        }),
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.directions).toHaveLength(1);
  });
});
