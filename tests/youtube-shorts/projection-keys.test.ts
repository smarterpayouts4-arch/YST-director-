import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { TopicPacket } from "@/features/content-intelligence/contracts/topic-packet";
import {
  projectTopicPacketToYouTubeShortsInput,
  YOUTUBE_SHORTS_PROJECTION_KEYS,
} from "@/features/social-media/youtube-shorts/contracts/project-topic-packet";

const fixture = JSON.parse(
  readFileSync(
    resolve(process.cwd(), "scripts/_live-atom-118-dual.json"),
    "utf8",
  ),
) as { evidenceDense: { packet: TopicPacket } };

const seedPacket: TopicPacket = {
  topicPacketId: "tp_1",
  topicId: "topic_1",
  territoryId: "terr_1",
  libraryId: "lib_1",
  artifactId: "art_1",
  projectId: "proj_1",
  version: 1,
  status: "selected",
  createdAt: "2026-08-13T00:00:00.000Z",
  confidence: "high",
  title: "t",
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
};

describe("projectTopicPacketToYouTubeShortsInput", () => {
  it("returns exactly the 16 locked keys (sorted)", () => {
    const projection = projectTopicPacketToYouTubeShortsInput(seedPacket);
    expect(Object.keys(projection).sort()).toEqual(
      [...YOUTUBE_SHORTS_PROJECTION_KEYS].sort(),
    );
    expect(Object.keys(projection)).toHaveLength(16);
  });

  it("projects live fixture packet to the same 16 keys", () => {
    const projection = projectTopicPacketToYouTubeShortsInput(
      fixture.evidenceDense.packet,
    );
    expect(Object.keys(projection).sort()).toEqual(
      [...YOUTUBE_SHORTS_PROJECTION_KEYS].sort(),
    );
    expect(projection.title).toBe(fixture.evidenceDense.packet.title);
  });
});
