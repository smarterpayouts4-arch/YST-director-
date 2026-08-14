import { describe, expect, it } from "vitest";
import type { TopicPacket } from "@/features/content-intelligence/contracts/topic-packet";
import { TOPICS_RUNTIME_PROMPT_VERSION } from "@/features/content-intelligence/topics/prompts/prompt-version";
import type { TopicDirection } from "@/features/content-intelligence/topics/schemas/direction";
import type { TopicOpportunity } from "@/features/content-intelligence/topics/schemas/topic-opportunity";
import type { TopicEngineSession } from "@/features/content-intelligence/topics/schemas/topic-session";
import {
  isResumableTopicSession,
  topicSessionPromptVersionDiffers,
} from "@/features/content-intelligence/topics/state/resume-topic-session";

const direction: TopicDirection = {
  territoryId: "terr_1",
  name: "n",
  description: "d",
  decisionQuestion: "q?",
  primaryAudience: "a",
  primaryMoment: "m",
  primaryTension: "t",
  primaryOpportunity: "o",
  supportingItemIds: ["i1", "i2"],
  confidence: "medium",
  priority: 1,
  rationale: "r",
  hypothesisDependent: false,
  unresolvedDependent: false,
};

const topic: TopicOpportunity = {
  topicId: "topic_1",
  territoryId: "terr_1",
  title: "Title",
  premise: "Premise",
  audience: "Audience",
  customerMoment: "Moment",
  primaryTension: "Tension",
  opportunity: "Opportunity",
  whyItMatters: "Why",
  desiredTakeaway: "Takeaway",
  priority: 1,
  confidence: "medium",
  supportingItemIds: ["i1", "i2"],
  hypothesisDependencies: [],
  unresolvedAssumptions: [],
  restrictionItemIds: [],
  limitationItemIds: [],
};

const packet: TopicPacket = {
  topicPacketId: "tp_1",
  topicId: "topic_1",
  territoryId: "terr_1",
  libraryId: "lib_1",
  artifactId: "art_1",
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

function baseSession(
  overrides: Partial<TopicEngineSession> = {},
): TopicEngineSession {
  return {
    libraryId: "lib_1",
    projectId: "proj_1",
    artifactId: "art_1",
    basedOnLabel: "research intelligence published Aug 13, 2026",
    promptVersion: TOPICS_RUNTIME_PROMPT_VERSION,
    stage: "directions",
    directions: [],
    selectedTerritoryId: null,
    topics: [],
    selectedTopicId: null,
    packet: null,
    ...overrides,
  };
}

describe("isResumableTopicSession", () => {
  it("resumes Ready + packet even when promptVersion differs", () => {
    const session = baseSession({
      promptVersion: "ci-topics-1.0.1",
      stage: "ready",
      packet,
      directions: [direction],
    });
    expect(isResumableTopicSession(session, "lib_1")).toBe(true);
    expect(topicSessionPromptVersionDiffers(session)).toBe(true);
  });

  it("resumes topics and directions without matching promptVersion", () => {
    expect(
      isResumableTopicSession(
        baseSession({
          promptVersion: "ci-topics-old",
          stage: "topics",
          topics: [topic],
        }),
        "lib_1",
      ),
    ).toBe(true);

    expect(
      isResumableTopicSession(
        baseSession({
          promptVersion: "ci-topics-old",
          directions: [direction],
        }),
        "lib_1",
      ),
    ).toBe(true);
  });

  it("rejects library mismatch and empty generated work", () => {
    expect(
      isResumableTopicSession(
        baseSession({ stage: "ready", packet }),
        "lib_other",
      ),
    ).toBe(false);
    expect(isResumableTopicSession(baseSession(), "lib_1")).toBe(false);
    expect(isResumableTopicSession(null, "lib_1")).toBe(false);
  });
});
