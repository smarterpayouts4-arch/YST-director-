import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PublishedLibraryDto } from "@/features/content-intelligence/contracts/published-library";
import type { TopicDirection } from "@/features/content-intelligence/topics/schemas/direction";

vi.mock("server-only", () => ({}));

const parseMock = vi.fn();
vi.mock("@/ai/structured-output/parse-structured-output", () => ({
  parseStructuredOutput: (...args: unknown[]) => parseMock(...args),
}));

vi.mock("@/lib/openai", () => ({
  getTopicEngineModel: () => "gpt-5.6-sol",
}));

import { proposeTopicOpportunities } from "@/features/content-intelligence/topics/services/propose-topics";

const publishedLibrary: PublishedLibraryDto = {
  libraryId: "lib_1",
  publishedAt: "2026-08-12T12:00:00.000Z",
  items: [
    {
      itemId: "item_opp",
      artifactId: "art_1",
      kind: "opportunity",
      statement: "Transparent comparison",
      provenance: "s1",
      origin: "extracted",
      confidence: "high",
      evidenceQuote: "q",
      sourceRefs: [],
      tags: [],
      isHypothesis: false,
    },
    {
      itemId: "item_aud",
      artifactId: "art_1",
      kind: "audience",
      statement: "Shoppers",
      provenance: "s1",
      origin: "extracted",
      confidence: "high",
      evidenceQuote: "q",
      sourceRefs: [],
      tags: [],
      isHypothesis: false,
    },
    {
      itemId: "item_ten",
      artifactId: "art_1",
      kind: "tension",
      statement: "Equivalence",
      provenance: "s1",
      origin: "extracted",
      confidence: "high",
      evidenceQuote: "q",
      sourceRefs: [],
      tags: [],
      isHypothesis: false,
    },
    {
      itemId: "item_fact",
      artifactId: "art_1",
      kind: "fact",
      statement: "A fact",
      provenance: "s1",
      origin: "extracted",
      confidence: "high",
      evidenceQuote: "q",
      sourceRefs: [],
      tags: [],
      isHypothesis: false,
    },
    {
      itemId: "item_rest",
      artifactId: "art_1",
      kind: "restriction",
      statement: "No claims",
      provenance: "s1",
      origin: "extracted",
      confidence: "high",
      evidenceQuote: "q",
      sourceRefs: [],
      tags: [],
      isHypothesis: false,
    },
  ],
};

const direction: TopicDirection = {
  territoryId: "terr_1",
  name: "Equivalence before price",
  description: "Fair compare",
  decisionQuestion: "Are these products actually comparable?",
  primaryAudience: "Shoppers",
  primaryMoment: "Shortlist",
  primaryTension: "Equivalence",
  primaryOpportunity: "Transparent compare",
  supportingItemIds: ["item_opp", "item_aud"],
  confidence: "high",
  priority: 1,
  rationale: "Strong",
  hypothesisDependent: false,
  unresolvedDependent: false,
};

function topic(supportingItemIds: string[], title: string, priority: number) {
  return {
    title,
    premise: "p",
    audience: "a",
    customerMoment: "m",
    primaryTension: "t",
    opportunity: "o",
    whyItMatters: "w",
    desiredTakeaway: "d",
    priority,
    confidence: "high" as const,
    supportingItemIds,
    hypothesisDependencies: [],
    unresolvedAssumptions: [],
    restrictionItemIds: [],
    limitationItemIds: [],
  };
}

describe("proposeTopicOpportunities grounding boundary", () => {
  beforeEach(() => {
    parseMock.mockReset();
  });

  it("wires validate that surfaces topic-specific grounding repair issues", async () => {
    const badDraft = {
      topics: [1, 2, 3, 4, 5, 6].map((i) =>
        topic(["item_fact", "item_rest"], `Weak ${i}`, i),
      ),
    };
    const goodDraft = {
      topics: [1, 2, 3, 4, 5, 6].map((i) =>
        topic(["item_opp", "item_aud", "item_ten"], `Strong ${i}`, i),
      ),
    };

    parseMock.mockImplementation(async (args: { validate?: (v: unknown) => string[] }) => {
      const issues = args.validate?.(badDraft) ?? [];
      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some((s) => /topics\[\d+\]/.test(s))).toBe(true);
      expect(issues.some((s) => /missing opportunity\|tension/.test(s))).toBe(true);
      expect(issues.some((s) => /missing audience\|moment/.test(s))).toBe(true);
      // Simulate informed repair success
      expect(args.validate?.(goodDraft) ?? []).toEqual([]);
      return goodDraft;
    });

    const result = await proposeTopicOpportunities({
      publishedLibrary,
      direction,
      artifactId: "art_1",
    });
    expect(result.topics).toHaveLength(6);
    expect(parseMock).toHaveBeenCalledTimes(1);
  });

  it("fail-closed after curate includes capped drop reasons, not only got N", async () => {
    // Bypass gateway validate (mock returns draft directly) — curator still enforces.
    parseMock.mockResolvedValue({
      topics: [
        ...[1, 2, 3].map((i) =>
          topic(["item_opp", "item_aud"], `Kept ${i}`, i),
        ),
        ...[4, 5, 6].map((i) =>
          topic(["item_fact", "item_rest"], `Dropped ${i}`, i),
        ),
      ],
    });

    await expect(
      proposeTopicOpportunities({
        publishedLibrary,
        direction,
        artifactId: "art_1",
      }),
    ).rejects.toMatchObject({
      code: "MODEL_OUTPUT_INVALID",
      message: expect.stringMatching(
        /Expected 6 grounded topics; got 3\..*(missing opportunity\|tension|Dropped)/,
      ),
      dropped: expect.arrayContaining([
        expect.stringMatching(/Dropped 4:.*missing opportunity\|tension/),
      ]),
    });
  });
});
