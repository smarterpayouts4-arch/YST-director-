import { describe, expect, it } from "vitest";
import type { PublishedLibraryDto } from "@/features/content-intelligence/contracts/published-library";
import { curateDirections, curateTopics } from "@/features/content-intelligence/topics/services/validate-grounding";

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
  {
    itemId: "item_ten_premium",
    artifactId: "art_1",
    kind: "tension",
    statement: "Some shoppers question whether a premium brand is worth the cost",
    provenance: "s1",
    origin: "extracted",
    confidence: "medium",
    evidenceQuote: "quote",
    sourceRefs: [],
    tags: [],
    isHypothesis: false,
  },
  {
    itemId: "item_demand",
    artifactId: "art_1",
    kind: "demand",
    statement: "Equal quality at lower price",
    provenance: "s1",
    origin: "extracted",
    confidence: "medium",
    evidenceQuote: "quote",
    sourceRefs: [],
    tags: [],
    isHypothesis: false,
  },
  {
    itemId: "item_hyp",
    artifactId: "art_1",
    kind: "other",
    statement: "Equivalence-first should replace form-plus-price as the core comparison",
    provenance: "hypothesis section",
    origin: "extracted",
    confidence: "medium",
    evidenceQuote: "quote",
    sourceRefs: [],
    tags: [],
    isHypothesis: true,
  },
  {
    itemId: "item_unres",
    artifactId: "art_1",
    kind: "unresolved",
    statement: "No validated weighting hierarchy for comparison dimensions",
    provenance: "open questions",
    origin: "extracted",
    confidence: "low",
    evidenceQuote: null,
    sourceRefs: [],
    tags: [],
    isHypothesis: false,
  },
];

describe("curateDirections", () => {
  it("keeps grounded directions, maps decisionQuestion, and allows 1–2 (max 3)", () => {
    const { directions, dropped } = curateDirections({
      dto: dto(baseItems),
      idFactory: () => "terr_1",
      draft: {
        directions: [
          {
            name: "Equivalence before price",
            description: "Compare fairly after shortlist",
            decisionQuestion: "Are these products actually comparable?",
            primaryAudience: "US shoppers",
            primaryMoment: "After shortlist",
            primaryTension: "Equivalence uncertainty",
            primaryOpportunity: "Transparent comparison",
            supportingItemIds: ["item_opp", "item_aud", "item_mom", "item_ten"],
            confidence: "high",
            priority: 1,
            rationale: "Strong cluster",
            hypothesisDependent: false,
            unresolvedDependent: false,
          },
        ],
      },
    });
    expect(directions).toHaveLength(1);
    expect(directions[0]!.name).toBe("Equivalence before price");
    expect(directions[0]!.decisionQuestion).toBe(
      "Are these products actually comparable?",
    );
    expect(dropped).toHaveLength(0);
  });

  it("keeps three content lanes that share audience/moment/opportunity evidence", () => {
    let n = 0;
    const shared = ["item_opp", "item_aud", "item_mom", "item_ten"] as const;
    const { directions, dropped } = curateDirections({
      dto: dto(baseItems),
      idFactory: () => `terr_${++n}`,
      draft: {
        directions: [
          {
            name: "Establish comparability",
            description: "Gate before price",
            decisionQuestion: "Are these products actually comparable?",
            primaryAudience: "US shoppers",
            primaryMoment: "After shortlist",
            primaryTension: "Equivalence uncertainty",
            primaryOpportunity: "Transparent comparison",
            supportingItemIds: [...shared],
            confidence: "high",
            priority: 1,
            rationale: "Lane A",
            hypothesisDependent: false,
            unresolvedDependent: false,
          },
          {
            name: "Meaningful differences",
            description: "Which differences matter",
            decisionQuestion:
              "Which form, amount, or label differences actually change the comparison?",
            primaryAudience: "US shoppers",
            primaryMoment: "After shortlist",
            primaryTension: "Equivalence uncertainty",
            primaryOpportunity: "Transparent comparison",
            supportingItemIds: [...shared],
            confidence: "high",
            priority: 2,
            rationale: "Lane B",
            hypothesisDependent: false,
            unresolvedDependent: false,
          },
          {
            name: "Non-meaningful differences",
            description: "When difference should not change the decision",
            decisionQuestion:
              "When does an apparent difference not justify treating products differently?",
            primaryAudience: "US shoppers",
            primaryMoment: "After shortlist",
            primaryTension: "Equivalence uncertainty",
            primaryOpportunity: "Transparent comparison",
            supportingItemIds: [...shared],
            confidence: "medium",
            priority: 3,
            rationale: "Lane C",
            hypothesisDependent: false,
            unresolvedDependent: false,
          },
        ],
      },
    });
    expect(dropped).toHaveLength(0);
    expect(directions).toHaveLength(3);
    expect(new Set(directions.map((d) => d.decisionQuestion)).size).toBe(3);
    expect(directions.map((d) => d.priority)).toEqual([1, 2, 3]);
  });

  it("rejects restriction/fact-only and unknown itemIds", () => {
    const { directions, dropped } = curateDirections({
      dto: dto(baseItems),
      idFactory: () => "terr_x",
      draft: {
        directions: [
          {
            name: "Only restrictions",
            description: "Safety dump",
            decisionQuestion: "What claims are forbidden?",
            primaryAudience: "Everyone",
            primaryMoment: "Anytime",
            primaryTension: "None",
            primaryOpportunity: "None",
            supportingItemIds: ["item_rest", "item_fact"],
            confidence: "high",
            priority: 1,
            rationale: "bad",
            hypothesisDependent: false,
            unresolvedDependent: false,
          },
          {
            name: "Invented ids",
            description: "Missing",
            decisionQuestion: "Invented?",
            primaryAudience: "a",
            primaryMoment: "b",
            primaryTension: "c",
            primaryOpportunity: "d",
            supportingItemIds: ["item_missing", "item_opp"],
            confidence: "medium",
            priority: 2,
            rationale: "bad",
            hypothesisDependent: false,
            unresolvedDependent: false,
          },
        ],
      },
    });
    expect(directions).toHaveLength(0);
    expect(dropped.length).toBeGreaterThanOrEqual(2);
    expect(dropped.some((d) => /unknown itemId|missing opportunity\|tension/i.test(d))).toBe(
      true,
    );
  });
});

describe("curateTopics", () => {
  it("requires grounding and caps at 6", () => {
    const make = (i: number) => ({
      title: `Topic ${i}`,
      premise: `Premise ${i}`,
      audience: "US shoppers",
      customerMoment: "After shortlist",
      primaryTension: "Equivalence",
      opportunity: "Transparent compare",
      whyItMatters: "Clarity",
      desiredTakeaway: "Compare fairly",
      priority: i,
      confidence: "high" as const,
      supportingItemIds: ["item_opp", "item_aud", "item_mom", "item_ten"],
      hypothesisDependencies: [],
      unresolvedAssumptions: [],
      restrictionItemIds: ["item_rest"],
      limitationItemIds: [],
    });
    const { topics } = curateTopics({
      dto: dto(baseItems),
      territoryId: "terr_1",
      idFactory: () => `topic_${Math.random()}`,
      draft: {
        topics: [1, 2, 3, 4, 5, 6].map(make) as never,
      },
    });
    expect(topics).toHaveLength(6);
    expect(topics.every((t) => t.territoryId === "terr_1")).toBe(true);
    const priorities = topics.map((t) => t.priority).sort((a, b) => a - b);
    expect(priorities).toEqual([1, 2, 3, 4, 5, 6]);
    expect(topics.filter((t) => t.priority === 1)).toHaveLength(1);
  });

  it("drops unlinked topics", () => {
    const { topics, dropped } = curateTopics({
      dto: dto(baseItems),
      territoryId: "terr_1",
      idFactory: () => "topic_bad",
      draft: {
        topics: Array.from({ length: 6 }, (_, i) => ({
          title: `Generic ${i}`,
          premise: "SEO",
          audience: "everyone",
          customerMoment: "always",
          primaryTension: "none",
          opportunity: "rank",
          whyItMatters: "clicks",
          desiredTakeaway: "buy",
          priority: i + 1,
          confidence: "low" as const,
          supportingItemIds: ["nope", "still_nope"],
          hypothesisDependencies: [],
          unresolvedAssumptions: [],
          restrictionItemIds: [],
          limitationItemIds: [],
        })),
      },
    });
    expect(topics).toHaveLength(0);
    expect(dropped.length).toBe(6);
    expect(dropped[0]).toMatch(/unknown itemId "nope"/);
  });

  it("resolves hypothesis/unresolved itemIds to statements with semantic checks", () => {
    const { topics } = curateTopics({
      dto: dto(baseItems),
      territoryId: "terr_1",
      idFactory: () => "topic_hyp",
      draft: {
        topics: [
          {
            title: "When is cheaper actually cheaper?",
            premise: "Match the set before price",
            audience: "US shoppers",
            customerMoment: "After shortlist",
            primaryTension: "Equivalence",
            opportunity: "Transparent compare",
            whyItMatters: "Clarity",
            desiredTakeaway: "Compare fairly",
            priority: 1,
            confidence: "high",
            supportingItemIds: ["item_opp", "item_aud", "item_mom", "item_ten"],
            hypothesisDependencies: [
              "item_hyp",
              "item_fact",
              "Maybe form matters as prose",
            ],
            unresolvedAssumptions: ["item_unres", "item_opp", "Open weighting question"],
            restrictionItemIds: ["item_rest"],
            limitationItemIds: [],
          },
        ],
      },
    });
    expect(topics).toHaveLength(1);
    const t = topics[0]!;
    expect(t.hypothesisDependencies).toContain(
      "Equivalence-first should replace form-plus-price as the core comparison",
    );
    expect(t.hypothesisDependencies).toContain("Maybe form matters as prose");
    expect(t.hypothesisDependencies).toContain("item_fact");
    expect(t.hypothesisDependencies).not.toContain("item_hyp");
    expect(t.unresolvedAssumptions).toContain(
      "No validated weighting hierarchy for comparison dimensions",
    );
    expect(t.unresolvedAssumptions).toContain("Open weighting question");
    expect(t.unresolvedAssumptions).toContain("item_opp");
    expect(t.unresolvedAssumptions).not.toContain("item_unres");
  });
});
