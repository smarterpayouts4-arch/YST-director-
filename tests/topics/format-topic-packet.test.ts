import { describe, expect, it } from "vitest";
import type { TopicPacket } from "@/features/content-intelligence/contracts/topic-packet";
import {
  formatTopicPacketJson,
  formatTopicPacketMarkdown,
} from "@/features/content-intelligence/topics/services/format-topic-packet";

const packet: TopicPacket = {
  topicPacketId: "tp_test_1",
  projectId: "proj_1",
  artifactId: "art_1",
  libraryId: "lib_1",
  territoryId: "terr_1",
  topicId: "topic_1",
  version: 1,
  status: "selected",
  createdAt: "2026-08-12T12:00:00.000Z",
  title: "What has to match before price means anything?",
  premise: "Price alone misleads without equivalence.",
  audience: "Shoppers comparing options",
  customerMoment: "Shortlist before buy",
  tension: "Equivalence before price",
  opportunity: "Transparent compare",
  decisionQuestion: "Are these products actually comparable?",
  desiredTakeaway: "Match basis first",
  whyItMatters: "Avoid false savings",
  supportingInsights: ["Match serving basis", "Transparent comparison"],
  supportingItemIds: ["item_a", "item_b"],
  sourceRefs: ["CRN", "Label"],
  evidenceQuotes: ["comparable dimensions", "per-serving basis"],
  provenanceNotes: ["§2", "§3"],
  confidence: "high",
  hypothesisDependencies: ["Maybe form matters"],
  unresolvedAssumptions: ["Unknown marketplace preference"],
  restrictions: ["Do not recommend dosage"],
  limitations: ["Sample size is limited"],
  doNotClaim: ["Do not recommend dosage"],
};

describe("formatTopicPacketJson", () => {
  it("pretty-prints a TopicPacket-valid payload without platform fields", () => {
    const json = formatTopicPacketJson(packet);
    const parsed = JSON.parse(json) as TopicPacket;
    expect(parsed.topicPacketId).toBe("tp_test_1");
    expect(parsed.title).toBe(packet.title);
    expect(parsed.opportunity).toBe("Transparent compare");
    expect(parsed.supportingItemIds).toEqual(["item_a", "item_b"]);
    expect(json).toMatch(/\n$/);
    expect(json).not.toMatch(/youtube|shorts|reddit|hook|script/i);
    expect(parsed).not.toHaveProperty("hook");
    expect(parsed).not.toHaveProperty("script");
    expect(parsed).not.toHaveProperty("platform");
  });

  it("does not inject commentary into the machine JSON payload", () => {
    const json = formatTopicPacketJson(packet);
    expect(json).not.toContain("Topic-selection confidence");
    expect(json).not.toContain("compatibility mirror");
    expect(json).not.toContain("do not authorize");
  });
});

describe("formatTopicPacketMarkdown", () => {
  it("exports a human-readable strategic brief with core fields", () => {
    const md = formatTopicPacketMarkdown(packet);
    expect(md).toContain("# What has to match before price means anything?");
    expect(md).toContain("## Premise");
    expect(md).toContain(packet.premise);
    expect(md).toContain("## Opportunity");
    expect(md).toContain("Transparent compare");
    expect(md).toContain("## Restrictions");
    expect(md).toContain("Do not recommend dosage");
    expect(md).toContain("## Limitations");
    expect(md).toContain("Sample size is limited");
    expect(md).toContain("## Hypothesis dependencies");
    expect(md).toContain("Maybe form matters");
    expect(md).toContain("topicPacketId: tp_test_1");
    expect(md).not.toMatch(/youtube|shorts|reddit|hook|script/i);
  });

  it("labels sources as provenance and confidence as topic-selection", () => {
    const md = formatTopicPacketMarkdown(packet);
    expect(md).toContain("## Sources / provenance");
    expect(md).toContain(
      "These references show where the governed supporting material came from. They do not authorize additional claims beyond the evidence carried in this packet.",
    );
    expect(md).toContain("Confidence: high");
    expect(md).toContain(
      "Topic-selection confidence; not a measure of overall research certainty or permission to strengthen claims.",
    );
    expect(md).toContain(
      "JSON field `doNotClaim` is a compatibility mirror of this list — not a second safety system.",
    );
  });

  it("renders None for empty optional lists", () => {
    const sparse: TopicPacket = {
      ...packet,
      evidenceQuotes: [],
      hypothesisDependencies: [],
      unresolvedAssumptions: [],
      limitations: [],
    };
    const md = formatTopicPacketMarkdown(sparse);
    expect(md).toContain("## Evidence quotes\n_None_");
    expect(md).toContain("## Limitations\n_None_");
  });
});
