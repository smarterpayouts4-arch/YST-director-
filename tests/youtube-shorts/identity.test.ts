import { describe, expect, it } from "vitest";
import type { TopicPacket } from "@/features/content-intelligence/contracts/topic-packet";
import { resolveShortsIdentity } from "@/features/social-media/youtube-shorts/contracts/resolve-shorts-identity";

const packet: TopicPacket = {
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

describe("resolveShortsIdentity", () => {
  it("agrees when sources share one projectId and artifactId", () => {
    const result = resolveShortsIdentity({
      packet,
      sessionProjectId: "proj_1",
      sessionArtifactId: "art_1",
      queryProjectId: "proj_1",
      queryArtifactId: "art_1",
    });
    expect(result).toEqual({
      ok: true,
      projectId: "proj_1",
      artifactId: "art_1",
    });
  });

  it("fails on projectId disagreement", () => {
    const result = resolveShortsIdentity({
      packet,
      sessionProjectId: "proj_other",
      queryProjectId: "proj_1",
    });
    expect(result).toEqual({ ok: false, reason: "identity_disagreement" });
  });

  it("fails on artifactId disagreement vs packet", () => {
    const result = resolveShortsIdentity({
      packet,
      queryArtifactId: "art_other",
    });
    expect(result).toEqual({ ok: false, reason: "identity_disagreement" });
  });

  it("fails when no projectId is available", () => {
    const { projectId: _omit, ...withoutProject } = packet;
    const result = resolveShortsIdentity({
      packet: withoutProject,
      sessionProjectId: "",
      queryProjectId: null,
    });
    expect(result).toEqual({ ok: false, reason: "missing_projectId" });
  });

  it("uses session projectId when packet omits it", () => {
    const { projectId: _omit, ...withoutProject } = packet;
    const result = resolveShortsIdentity({
      packet: withoutProject,
      sessionProjectId: "proj_session",
    });
    expect(result).toEqual({
      ok: true,
      projectId: "proj_session",
      artifactId: "art_1",
    });
  });
});
