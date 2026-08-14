import { describe, expect, it } from "vitest";
import { buildProposeTopicsPrompt } from "@/features/content-intelligence/topics/prompts/propose-topics";
import { TOPICS_RUNTIME_PROMPT_VERSION } from "@/features/content-intelligence/topics/prompts/prompt-version";
import { buildTopicsRepairPrompt } from "@/features/content-intelligence/topics/prompts/repair-output";
import { TopicOpportunitiesDraftSchema } from "@/features/content-intelligence/topics/schemas/topic-opportunity";

const direction = {
  territoryId: "terr_1",
  name: "Equivalence before price",
  description: "Fair compare",
  decisionQuestion: "Are these products actually comparable?",
  primaryAudience: "Shoppers",
  primaryMoment: "Shortlist",
  primaryTension: "Equivalence",
  primaryOpportunity: "Transparent compare",
  supportingItemIds: ["item_opp", "item_ten"],
  confidence: "high" as const,
  priority: 1,
  rationale: "Strong",
  hypothesisDependent: false,
  unresolvedDependent: false,
};

describe("propose-topic-opportunities contract", () => {
  it("requires exactly 6 topics and bans platform/script fields in schema", () => {
    expect(TOPICS_RUNTIME_PROMPT_VERSION.startsWith("ci-topics")).toBe(true);
    const keys = Object.keys(TopicOpportunitiesDraftSchema.shape.topics.element.shape);
    expect(keys).not.toContain("hook");
    expect(keys).not.toContain("script");
    expect(keys).not.toContain("platform");
    expect(keys).not.toContain("youtube");
    expect(keys).not.toContain("recommended");
  });

  it("prompt requires grounding, voice, and create-first ranking", () => {
    const { instructions, input, promptVersion } = buildProposeTopicsPrompt({
      publishedLibrary: {
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
        ],
      },
      direction,
    });
    expect(promptVersion).toBe("ci-topics-1.1.9");
    expect(instructions).toMatch(/Never put raw itemId values there/i);
    expect(instructions).toMatch(/EXACTLY 6/i);
    expect(instructions).toMatch(/generic SEO/i);
    expect(instructions).toMatch(/Do not write scripts/i);
    expect(instructions).toMatch(/decisionQuestion/i);
    expect(instructions).toMatch(/Topic Strategy Doctrine/i);
    expect(instructions).toMatch(/unresolved distinction/i);
    expect(instructions).toMatch(/latent quality lens/i);
    expect(instructions).toMatch(/Story Lens/i);
    expect(instructions).toMatch(/creator intelligence substrate/i);
    expect(instructions).toMatch(/supportingItemIds grounding contract/i);
    expect(instructions).toMatch(/opportunity OR tension/i);
    expect(instructions).toMatch(/audience OR moment/i);
    expect(instructions).toMatch(/Teaching-support sufficiency/i);
    expect(instructions).toMatch(/stop at 2/i);
    expect(instructions).toMatch(/decision rule/i);
    expect(instructions).toMatch(/Never pad/i);
    expect(instructions).toMatch(/competitor, opportunity, tension, demand/i);
    expect(instructions).toMatch(/Title and premise voice/i);
    expect(instructions).toMatch(/normal member of the target audience/i);
    expect(instructions).toMatch(/Curiosity comes from the distinction/i);
    expect(instructions).toMatch(/translate internal research\/strategy/i);
    expect(instructions).toMatch(/do not paste the Direction name or decisionQuestion/i);
    expect(instructions).toMatch(/one clear audience-facing sentence/i);
    expect(instructions).toMatch(/Do not sacrifice accuracy for clickbait/i);
    expect(instructions).toMatch(/simple front door/i);
    expect(instructions).toMatch(/Recommended canonical topic to create first/i);
    expect(instructions).toMatch(/cross-channel versatility/i);
    expect(instructions).toMatch(/Do not rank primarily on clickability, virality, SEO/i);
    expect(instructions).toMatch(/short-form hook/i);
    expect(input).toContain("Equivalence before price");
    expect(input).toContain("Are these products actually comparable?");
    expect(input).toContain('"kind": "opportunity"');
    expect(input).toContain('"itemId": "item_opp"');
  });

  it("topics repair requires EXACTLY 6 and forbids prefer-dropping", () => {
    const repair = buildTopicsRepairPrompt({
      schemaName: "topic_opportunities",
      validationErrors: ['topics[0]: unknown supportingItemId "x"'],
      previousOutput: { topics: [] },
    });
    expect(repair.instructions).toMatch(/EXACTLY 6/i);
    expect(repair.instructions).toMatch(/never pad/i);
    expect(repair.instructions).not.toMatch(/Prefer dropping/i);
    expect(repair.instructions).toMatch(
      /ONLY add\/replace supportingItemIds/i,
    );
    expect(repair.instructions).toMatch(
      /Do NOT rewrite title, premise, audience/i,
    );
    expect(repair.promptVersion).toBe("ci-topics-1.1.9");
  });

  it("directions repair allows 1–3 and forbids inventing a third", () => {
    const repair = buildTopicsRepairPrompt({
      schemaName: "topic_directions",
      validationErrors: ['directions[0]: missing opportunity|tension'],
      previousOutput: { directions: [] },
    });
    expect(repair.instructions).toMatch(/1–3|1-3/i);
    expect(repair.instructions).toMatch(/Do not invent a third/i);
    expect(repair.instructions).toMatch(/supportingItemIds grounding contract/i);
  });

  it("schema enforces length 6", () => {
    const topic = {
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
    expect(() =>
      TopicOpportunitiesDraftSchema.parse({ topics: [topic] }),
    ).toThrow();
    expect(
      TopicOpportunitiesDraftSchema.parse({
        topics: Array.from({ length: 6 }, (_, i) => ({ ...topic, priority: i + 1 })),
      }).topics,
    ).toHaveLength(6);
  });
});
