import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock(
  "@/features/content-intelligence/topics/services/propose-topics",
  () => ({
    proposeTopicOpportunities: vi.fn(),
  }),
);

import { POST } from "@/app/api/content-intelligence/propose-topics/route";
import { proposeTopicOpportunities } from "@/features/content-intelligence/topics/services/propose-topics";

describe("POST /api/content-intelligence/propose-topics", () => {
  beforeEach(() => {
    vi.mocked(proposeTopicOpportunities).mockReset();
  });

  it("returns six topics from service", async () => {
    const topic = {
      topicId: "topic_1",
      territoryId: "terr_1",
      title: "t",
      premise: "p",
      audience: "a",
      customerMoment: "m",
      primaryTension: "ten",
      opportunity: "o",
      whyItMatters: "w",
      desiredTakeaway: "d",
      priority: 1,
      confidence: "high" as const,
      supportingItemIds: ["a", "b"],
      hypothesisDependencies: [],
      unresolvedAssumptions: [],
      restrictionItemIds: [],
      limitationItemIds: [],
    };
    vi.mocked(proposeTopicOpportunities).mockResolvedValue({
      topics: Array.from({ length: 6 }, (_, i) => ({
        ...topic,
        topicId: `topic_${i}`,
        priority: i + 1,
      })),
      dropped: [],
    });

    const res = await POST(
      new Request("http://localhost/api/content-intelligence/propose-topics", {
        method: "POST",
        body: JSON.stringify({
          artifactId: "art_1",
          direction: { territoryId: "terr_1" },
          publishedLibrary: { libraryId: "lib_1", publishedAt: "2026-08-12T12:00:00.000Z", items: [] },
        }),
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.topics).toHaveLength(6);
  });
});
