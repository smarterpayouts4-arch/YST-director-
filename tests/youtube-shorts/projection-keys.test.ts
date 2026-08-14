import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { TopicPacketSchema } from "@/features/content-intelligence/contracts/topic-packet";
import {
  projectTopicPacketToYouTubeShortsInput,
  YOUTUBE_SHORTS_PROJECTION_KEYS,
} from "@/features/social-media/youtube-shorts/contracts/project-topic-packet";

const fixturePacket = TopicPacketSchema.parse(
  JSON.parse(
    readFileSync(
      resolve(
        process.cwd(),
        "tests/fixtures/youtube-shorts/atom-projection-packet.json",
      ),
      "utf8",
    ),
  ),
);

describe("projectTopicPacketToYouTubeShortsInput", () => {
  it("returns exactly the 16 locked keys (sorted)", () => {
    const projection = projectTopicPacketToYouTubeShortsInput(fixturePacket);
    expect(Object.keys(projection).sort()).toEqual(
      [...YOUTUBE_SHORTS_PROJECTION_KEYS].sort(),
    );
    expect(Object.keys(projection)).toHaveLength(16);
  });

  it("projects the committed fixture packet to the same 16 keys", () => {
    const projection = projectTopicPacketToYouTubeShortsInput(fixturePacket);
    expect(Object.keys(projection).sort()).toEqual(
      [...YOUTUBE_SHORTS_PROJECTION_KEYS].sort(),
    );
    expect(projection.title).toBe(fixturePacket.title);
    expect(projection.restrictions).toEqual(fixturePacket.restrictions);
    expect(projection).not.toHaveProperty("topicPacketId");
    expect(projection).not.toHaveProperty("projectId");
    expect(projection).not.toHaveProperty("artifactId");
    expect(projection).not.toHaveProperty("sourceRefs");
    expect(projection).not.toHaveProperty("doNotClaim");
  });
});
