import { describe, expect, it } from "vitest";
import type { PublishedLibraryDto } from "@/features/content-intelligence/contracts/published-library";
import {
  formatGroundingIssueForRepair,
  validateDraftTopicGrounding,
  validateTopicGrounding,
} from "@/features/content-intelligence/topics/services/topic-grounding";
import { curateTopics } from "@/features/content-intelligence/topics/services/validate-grounding";

function dto(items: PublishedLibraryDto["items"]): PublishedLibraryDto {
  return {
    libraryId: "lib_test",
    publishedAt: "2026-08-12T12:00:00.000Z",
    items,
  };
}

const baseItems: PublishedLibraryDto["items"] = [
  {
    itemId: "item_opp",
    artifactId: "art_1",
    kind: "opportunity",
    statement: "Transparent comparison opportunity",
    provenance: "s1",
    origin: "extracted",
    confidence: "high",
    evidenceQuote: "quote",
    sourceRefs: [],
    tags: [],
    isHypothesis: false,
  },
  {
    itemId: "item_aud",
    artifactId: "art_1",
    kind: "audience",
    statement: "US adult shoppers",
    provenance: "s1",
    origin: "extracted",
    confidence: "high",
    evidenceQuote: "quote",
    sourceRefs: [],
    tags: [],
    isHypothesis: false,
  },
  {
    itemId: "item_mom",
    artifactId: "art_1",
    kind: "moment",
    statement: "After shortlist",
    provenance: "s1",
    origin: "extracted",
    confidence: "high",
    evidenceQuote: "quote",
    sourceRefs: [],
    tags: [],
    isHypothesis: false,
  },
  {
    itemId: "item_ten",
    artifactId: "art_1",
    kind: "tension",
    statement: "Equivalence uncertainty",
    provenance: "s1",
    origin: "extracted",
    confidence: "high",
    evidenceQuote: "quote",
    sourceRefs: [],
    tags: [],
    isHypothesis: false,
  },
  {
    itemId: "item_rest",
    artifactId: "art_1",
    kind: "restriction",
    statement: "No dosage claims",
    provenance: "s1",
    origin: "extracted",
    confidence: "high",
    evidenceQuote: "quote",
    sourceRefs: [],
    tags: [],
    isHypothesis: false,
  },
  {
    itemId: "item_fact",
    artifactId: "art_1",
    kind: "fact",
    statement: "60% used supplements",
    provenance: "s1",
    origin: "extracted",
    confidence: "high",
    evidenceQuote: "quote",
    sourceRefs: [],
    tags: [],
    isHypothesis: false,
  },
];

function draftTopic(overrides: {
  title?: string;
  supportingItemIds: readonly string[];
  priority?: number;
}) {
  return {
    title: overrides.title ?? "Topic",
    premise: "Premise",
    audience: "US shoppers",
    customerMoment: "After shortlist",
    primaryTension: "Equivalence",
    opportunity: "Transparent compare",
    whyItMatters: "Clarity",
    desiredTakeaway: "Compare fairly",
    priority: overrides.priority ?? 1,
    confidence: "high" as const,
    supportingItemIds: [...overrides.supportingItemIds],
    hypothesisDependencies: [],
    unresolvedAssumptions: [],
    restrictionItemIds: [] as string[],
    limitationItemIds: [] as string[],
  };
}

describe("validateTopicGrounding", () => {
  it("returns empty for IDs that exist with both kind groups", () => {
    const issues = validateTopicGrounding(
      { title: "Good", supportingItemIds: ["item_opp", "item_aud"] },
      dto(baseItems),
      0,
    );
    expect(issues).toEqual([]);
  });

  it("rejects unknown itemId with topicIndex + itemId", () => {
    const issues = validateTopicGrounding(
      { title: "Bad id", supportingItemIds: ["item_missing", "item_opp"] },
      dto(baseItems),
      2,
    );
    expect(issues).toContainEqual({
      type: "unknown_item_id",
      topicIndex: 2,
      itemId: "item_missing",
      title: "Bad id",
    });
    expect(formatGroundingIssueForRepair(issues[0]!)).toMatch(
      /topics\[2\].*unknown supportingItemId "item_missing"/,
    );
  });

  it("rejects fact + restriction only with both missing kind groups", () => {
    const issues = validateTopicGrounding(
      { title: "Facts only", supportingItemIds: ["item_fact", "item_rest"] },
      dto(baseItems),
      0,
    );
    expect(issues.map((i) => (i.type === "missing_kind" ? i.required : i.type))).toEqual([
      "opportunity|tension",
      "audience|moment",
    ]);
    expect(issues.every((i) => i.type === "missing_kind" && i.actualKinds.includes("fact"))).toBe(
      true,
    );
  });

  it("tension without audience|moment only reports missing audience|moment", () => {
    const issues = validateTopicGrounding(
      { title: "Tension only", supportingItemIds: ["item_ten", "item_fact"] },
      dto(baseItems),
      1,
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      type: "missing_kind",
      required: "audience|moment",
      topicIndex: 1,
    });
  });

  it("moment without opportunity|tension only reports missing opportunity|tension", () => {
    const issues = validateTopicGrounding(
      { title: "Moment only", supportingItemIds: ["item_mom", "item_fact"] },
      dto(baseItems),
      0,
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      type: "missing_kind",
      required: "opportunity|tension",
    });
  });
});

describe("teaching-support sufficiency", () => {
  const teachItems: PublishedLibraryDto["items"] = [
    ...baseItems,
    {
      itemId: "item_fact_price",
      artifactId: "art_1",
      kind: "fact",
      statement: "Shoppers compare supplement price after a shortlist exists",
      provenance: "s2",
      origin: "extracted",
      confidence: "high",
      evidenceQuote: "price after shortlist",
      sourceRefs: ["CRN"],
      tags: [],
      isHypothesis: false,
    },
    {
      itemId: "item_fact_equiv",
      artifactId: "art_1",
      kind: "fact",
      statement: "Equivalence of serving basis must match before price comparison",
      provenance: "s3",
      origin: "extracted",
      confidence: "high",
      evidenceQuote: "serving basis",
      sourceRefs: ["Label"],
      tags: [],
      isHypothesis: false,
    },
    {
      itemId: "item_fact_hyp",
      artifactId: "art_1",
      kind: "fact",
      statement: "Form may change equivalence for shoppers comparing price",
      provenance: "s4",
      origin: "extracted",
      confidence: "low",
      evidenceQuote: null,
      sourceRefs: ["NIH"],
      tags: [],
      isHypothesis: true,
    },
  ];

  it("fails when pool ≥2 relevant facts but fewer than 2 teaching facts selected", () => {
    const topic = draftTopic({
      title: "What must match before you compare supplement prices?",
      supportingItemIds: ["item_opp", "item_aud"],
    });
    const issues = validateTopicGrounding(topic, dto(teachItems), 0);
    const teach = issues.find((i) => i.type === "insufficient_teaching_facts");
    expect(teach).toMatchObject({
      type: "insufficient_teaching_facts",
      requiredFloor: 2,
      selectedTeachingFacts: 0,
    });
    expect(formatGroundingIssueForRepair(teach!)).toMatch(
      /Add or replace supportingItemIds only/,
    );
    expect(formatGroundingIssueForRepair(teach!)).toMatch(
      /Do not rewrite title/,
    );
  });

  it("passes hard floor with 2 teaching facts; does not hard-fail for missing a 3rd", () => {
    const topic = draftTopic({
      title: "What must match before you compare supplement prices?",
      supportingItemIds: [
        "item_opp",
        "item_aud",
        "item_fact_price",
        "item_fact_equiv",
      ],
    });
    const issues = validateTopicGrounding(topic, dto(teachItems), 0);
    expect(issues.filter((i) => i.type === "insufficient_teaching_facts")).toEqual(
      [],
    );
  });

  it("does not count hypotheses toward teaching-fact density", () => {
    const topic = draftTopic({
      title: "What must match before you compare supplement prices?",
      supportingItemIds: ["item_opp", "item_aud", "item_fact_hyp"],
    });
    const issues = validateTopicGrounding(topic, dto(teachItems), 0);
    expect(
      issues.some(
        (i) =>
          i.type === "insufficient_teaching_facts" &&
          i.selectedTeachingFacts === 0,
      ),
    ).toBe(true);
  });

  it("fail-opens when fewer than 2 relevant teaching facts exist in the DTO", () => {
    const sparse = baseItems; // only item_fact, and brief may not even match it
    const topic = draftTopic({
      title: "Good",
      supportingItemIds: ["item_opp", "item_aud"],
    });
    expect(validateTopicGrounding(topic, dto(sparse), 0)).toEqual([]);
  });

  it("curate drops framing-only topics when teaching facts are available", () => {
    const topic = draftTopic({
      title: "Case",
      supportingItemIds: ["item_opp", "item_aud"],
    });
    const { topics: kept, dropped } = curateTopics({
      dto: dto(teachItems),
      territoryId: "terr_1",
      idFactory: () => "topic_x",
      draft: {
        topics: [
          topic,
          ...[2, 3, 4, 5, 6].map((i) =>
            draftTopic({
              title: `Pad ${i}`,
              priority: i,
              supportingItemIds: [
                "item_opp",
                "item_aud",
                "item_fact_price",
                "item_fact_equiv",
              ],
            }),
          ),
        ],
      },
    });
    expect(kept.map((t) => t.title)).not.toContain("Case");
    expect(dropped.some((d) => d.startsWith("Case:"))).toBe(true);
  });
});

describe("validateDirectionGrounding", () => {
  it("shares the same kind contract as topics", async () => {
    const { validateDirectionGrounding } = await import(
      "@/features/content-intelligence/topics/services/topic-grounding"
    );
    expect(
      validateDirectionGrounding(
        { name: "Good", supportingItemIds: ["item_opp", "item_aud"] },
        dto(baseItems),
        0,
      ),
    ).toEqual([]);
    const bad = validateDirectionGrounding(
      { name: "Facts", supportingItemIds: ["item_fact", "item_rest"] },
      dto(baseItems),
      0,
    );
    expect(bad.map((i) => (i.type === "missing_kind" ? i.required : i.type))).toEqual([
      "opportunity|tension",
      "audience|moment",
    ]);
  });
});

describe("validateDraftTopicGrounding + curateTopics parity", () => {
  it("six valid topics: validate empty and curator keeps 6", () => {
    const topics = [1, 2, 3, 4, 5, 6].map((i) =>
      draftTopic({
        title: `Topic ${i}`,
        priority: i,
        supportingItemIds: ["item_opp", "item_aud", "item_mom", "item_ten"],
      }),
    );
    expect(validateDraftTopicGrounding(topics, dto(baseItems))).toEqual([]);
    const { topics: kept, dropped } = curateTopics({
      dto: dto(baseItems),
      territoryId: "terr_1",
      idFactory: () => `topic_${Math.random()}`,
      draft: { topics },
    });
    expect(kept).toHaveLength(6);
    expect(dropped).toHaveLength(0);
  });

  it.each([
    {
      name: "fully grounded",
      supportingItemIds: ["item_opp", "item_aud"],
      expectIssues: false,
    },
    {
      name: "unknown id",
      supportingItemIds: ["nope", "item_opp"],
      expectIssues: true,
    },
    {
      name: "fact+restriction",
      supportingItemIds: ["item_fact", "item_rest"],
      expectIssues: true,
    },
    {
      name: "tension only",
      supportingItemIds: ["item_ten", "item_fact"],
      expectIssues: true,
    },
    {
      name: "moment only",
      supportingItemIds: ["item_mom", "item_fact"],
      expectIssues: true,
    },
  ] as const)(
    "parity: $name — zero issues kept, any issues dropped",
    ({ supportingItemIds, expectIssues }) => {
      const topic = draftTopic({ title: "Case", supportingItemIds });
      const issues = validateTopicGrounding(topic, dto(baseItems), 0);
      expect(issues.length > 0).toBe(expectIssues);

      const { topics: kept, dropped } = curateTopics({
        dto: dto(baseItems),
        territoryId: "terr_1",
        idFactory: () => "topic_x",
        draft: {
          topics: [
            topic,
            ...[2, 3, 4, 5, 6].map((i) =>
              draftTopic({
                title: `Pad ${i}`,
                priority: i,
                supportingItemIds: ["item_opp", "item_aud"],
              }),
            ),
          ],
        },
      });

      if (expectIssues) {
        expect(kept.map((t) => t.title)).not.toContain("Case");
        expect(dropped.some((d) => d.startsWith("Case:"))).toBe(true);
      } else {
        expect(kept.map((t) => t.title)).toContain("Case");
        expect(dropped.some((d) => d.startsWith("Case:"))).toBe(false);
      }
    },
  );
});
