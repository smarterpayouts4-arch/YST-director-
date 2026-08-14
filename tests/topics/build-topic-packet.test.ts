import { describe, expect, it } from "vitest";
import type { PublishedLibraryDto } from "@/features/content-intelligence/contracts/published-library";
import type { TopicPacket } from "@/features/content-intelligence/contracts/topic-packet";
import { buildTopicPacket } from "@/features/content-intelligence/topics/services/build-topic-packet";
import type { TopicDirection } from "@/features/content-intelligence/topics/schemas/direction";
import type { TopicOpportunity } from "@/features/content-intelligence/topics/schemas/topic-opportunity";

/** Exclude nondeterministic identity fields for payload-stability asserts. */
function stablePacketJson(packet: TopicPacket): string {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(packet).filter(
        ([key]) => key !== "topicPacketId" && key !== "createdAt",
      ),
    ),
  );
}

const dto: PublishedLibraryDto = {
  libraryId: "lib_1",
  projectId: "proj_1",
  publishedAt: "2026-08-12T12:00:00.000Z",
  items: [
    {
      itemId: "item_opp",
      artifactId: "art_1",
      kind: "opportunity",
      statement: "Transparent comparison",
      provenance: "§2",
      origin: "extracted",
      confidence: "high",
      evidenceQuote: "comparable dimensions",
      sourceRefs: ["CRN"],
      tags: [],
      isHypothesis: false,
    },
    {
      itemId: "item_opp_dup",
      artifactId: "art_1",
      kind: "fact",
      statement: "Transparent comparison",
      provenance: "Executive answer",
      origin: "extracted",
      confidence: "high",
      evidenceQuote: "same claim again",
      sourceRefs: ["CRN"],
      tags: [],
      isHypothesis: false,
    },
    {
      itemId: "item_blank",
      artifactId: "art_1",
      kind: "fact",
      statement: "   ",
      provenance: "Competitor map",
      origin: "extracted",
      confidence: "medium",
      evidenceQuote: null,
      sourceRefs: [],
      tags: [],
      isHypothesis: false,
    },
    {
      itemId: "item_fact_2",
      artifactId: "art_1",
      kind: "fact",
      statement: "Match serving basis before price",
      provenance: "§3",
      origin: "extracted",
      confidence: "high",
      evidenceQuote: "per-serving basis",
      sourceRefs: ["Label"],
      tags: [],
      isHypothesis: false,
    },
    {
      itemId: "item_rest",
      artifactId: "art_1",
      kind: "restriction",
      statement: "Do not recommend dosage",
      provenance: "§8",
      origin: "extracted",
      confidence: "high",
      evidenceQuote: null,
      sourceRefs: [],
      tags: [],
      isHypothesis: false,
    },
    {
      itemId: "item_lim",
      artifactId: "art_1",
      kind: "limitation",
      statement: "Sample size is limited",
      provenance: "§7",
      origin: "extracted",
      confidence: "medium",
      evidenceQuote: null,
      sourceRefs: [],
      tags: [],
      isHypothesis: false,
    },
    {
      itemId: "item_unres",
      artifactId: "art_1",
      kind: "unresolved",
      statement: "Unknown marketplace preference",
      provenance: "§9",
      origin: "extracted",
      confidence: "low",
      evidenceQuote: null,
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
  supportingItemIds: ["item_opp"],
  confidence: "high",
  priority: 1,
  rationale: "Strong",
  hypothesisDependent: false,
  unresolvedDependent: true,
};

const topic: TopicOpportunity = {
  topicId: "topic_1",
  territoryId: "terr_1",
  title: "What has to match before price-per-serving means anything?",
  premise: "Price alone misleads without equivalence.",
  audience: "Shoppers",
  customerMoment: "Shortlist",
  primaryTension: "Equivalence",
  opportunity: "Transparent compare",
  whyItMatters: "Avoid false savings",
  desiredTakeaway: "Match basis first",
  priority: 1,
  confidence: "high",
  supportingItemIds: ["item_opp", "item_opp_dup", "item_blank", "item_fact_2"],
  hypothesisDependencies: ["Maybe form matters"],
  unresolvedAssumptions: [],
  restrictionItemIds: ["item_rest"],
  limitationItemIds: ["item_lim"],
};

describe("buildTopicPacket", () => {
  it("hydrates decisionQuestion + supportingInsights and keeps safety/proof fields", () => {
    const packet = buildTopicPacket({
      dto,
      direction,
      topic,
      artifactId: "art_1",
      projectId: "proj_1",
    });
    expect(packet.topicPacketId.startsWith("tp_")).toBe(true);
    expect(packet.artifactId).toBe("art_1");
    expect(packet.territoryId).toBe("terr_1");
    expect(packet.topicId).toBe("topic_1");
    expect(packet.decisionQuestion).toBe("Are these products actually comparable?");
    // Topic-relative score ranks the serving/price fact above the opportunity; exact-dedupe.
    expect(packet.supportingInsights).toEqual([
      "Match serving basis before price",
      "Transparent comparison",
    ]);
    expect(packet.supportingInsights).toHaveLength(2);
    expect(packet.sourceRefs).toEqual(expect.arrayContaining(["CRN", "Label"]));
    expect(packet.restrictions).toContain("Do not recommend dosage");
    expect(packet.limitations).toContain("Sample size is limited");
    expect(packet.doNotClaim).toEqual(packet.restrictions);
    expect(packet.unresolvedAssumptions).toContain("Unknown marketplace preference");
    expect(packet.hypothesisDependencies).toContain("Maybe form matters");
    expect(packet.evidenceQuotes).toContain("comparable dimensions");
    expect(JSON.stringify(packet)).not.toMatch(/youtube|reddit|script|hook/i);
    expect(packet).not.toHaveProperty("rawText");
    expect(packet).not.toHaveProperty("desiredAction");
  });

  it("keeps doNotClaim as a compatibility mirror of restrictions", () => {
    const packet = buildTopicPacket({
      dto,
      direction,
      topic,
      artifactId: "art_1",
      projectId: "proj_1",
    });
    expect(packet.doNotClaim).toEqual(packet.restrictions);
  });

  it("serializes a stable payload for the same Topic+DTO except id/timestamp", () => {
    const input = {
      dto,
      direction,
      topic,
      artifactId: "art_1",
      projectId: "proj_1",
    };
    const a = buildTopicPacket(input);
    const b = buildTopicPacket(input);
    expect(a.topicPacketId).not.toBe(b.topicPacketId);
    expect(stablePacketJson(a)).toBe(stablePacketJson(b));
  });

  it("hard-caps supportingInsights at 8 after hygiene", () => {
    const manyIds = Array.from({ length: 10 }, (_, i) => `item_many_${i}`);
    const manyItems = manyIds.map((itemId, i) => ({
      itemId,
      artifactId: "art_1",
      kind: "fact" as const,
      statement: `Insight number ${i + 1}`,
      provenance: `§${i}`,
      origin: "extracted" as const,
      confidence: "high" as const,
      evidenceQuote: null,
      sourceRefs: [] as string[],
      tags: [] as string[],
      isHypothesis: false,
    }));
    const fatDto: PublishedLibraryDto = {
      ...dto,
      items: [...dto.items, ...manyItems],
    };
    const fatTopic: TopicOpportunity = {
      ...topic,
      supportingItemIds: manyIds,
    };
    const packet = buildTopicPacket({
      dto: fatDto,
      direction,
      topic: fatTopic,
      artifactId: "art_1",
    });
    expect(packet.supportingInsights).toHaveLength(8);
    expect(packet.supportingInsights[0]).toBe("Insight number 1");
    expect(packet.supportingInsights[7]).toBe("Insight number 8");
  });

  it("excludes hypothesis statements from supportingInsights and their sourceRefs", () => {
    const hypDto: PublishedLibraryDto = {
      ...dto,
      items: [
        ...dto.items,
        {
          itemId: "item_hyp",
          artifactId: "art_1",
          kind: "fact",
          statement: "Form-plus-price is the right hypothesis frame",
          provenance: "Hypothesis map",
          origin: "extracted",
          confidence: "low",
          evidenceQuote: null,
          sourceRefs: ["NIH ODS Title Leak"],
          tags: [],
          isHypothesis: true,
        },
      ],
    };
    const hypTopic: TopicOpportunity = {
      ...topic,
      supportingItemIds: ["item_opp", "item_fact_2", "item_hyp"],
    };
    const packet = buildTopicPacket({
      dto: hypDto,
      direction,
      topic: hypTopic,
      artifactId: "art_1",
    });
    expect(packet.supportingInsights).not.toContain(
      "Form-plus-price is the right hypothesis frame",
    );
    expect(packet.supportingInsights).toEqual([
      "Match serving basis before price",
      "Transparent comparison",
    ]);
    expect(packet.sourceRefs).not.toContain("NIH ODS Title Leak");
  });

  it("never hydrates audience/moment; keeps thesis tension/opportunity when they match the Topic", () => {
    const denseDto: PublishedLibraryDto = {
      ...dto,
      items: [
        ...dto.items,
        {
          itemId: "item_aud",
          artifactId: "art_1",
          kind: "audience",
          statement: "U.S. adults who shop online are the market addressed",
          provenance: "header",
          origin: "extracted",
          confidence: "high",
          evidenceQuote: null,
          sourceRefs: [],
          tags: [],
          isHypothesis: false,
        },
        {
          itemId: "item_mom",
          artifactId: "art_1",
          kind: "moment",
          statement: "The supported decision sequence begins after a shortlist",
          provenance: "moment",
          origin: "extracted",
          confidence: "high",
          evidenceQuote: null,
          sourceRefs: [],
          tags: [],
          isHypothesis: false,
        },
        {
          itemId: "item_ten",
          artifactId: "art_1",
          kind: "tension",
          statement: "The core near-checkout tension is equivalence for price",
          provenance: "tension",
          origin: "extracted",
          confidence: "high",
          evidenceQuote: null,
          sourceRefs: [],
          tags: [],
          isHypothesis: false,
        },
        {
          itemId: "item_mg",
          artifactId: "art_1",
          kind: "fact",
          statement: "Magnesium absorption varies among forms",
          provenance: "NIH",
          origin: "extracted",
          confidence: "high",
          evidenceQuote: "soluble forms",
          sourceRefs: ["NIH ODS Mg"],
          tags: [],
          isHypothesis: false,
        },
        {
          itemId: "item_b12",
          artifactId: "art_1",
          kind: "fact",
          statement: "NIH reports no evidence B12 absorption varies by form",
          provenance: "NIH",
          origin: "extracted",
          confidence: "high",
          evidenceQuote: "no form difference",
          sourceRefs: ["NIH ODS B12"],
          tags: [],
          isHypothesis: false,
        },
      ],
    };
    const denseTopic: TopicOpportunity = {
      ...topic,
      supportingItemIds: [
        "item_aud",
        "item_mom",
        "item_ten",
        "item_opp",
        "item_mg",
        "item_b12",
      ],
    };
    const packet = buildTopicPacket({
      dto: denseDto,
      direction,
      topic: denseTopic,
      artifactId: "art_1",
    });
    // Off-topic Mg/B12 facts score 0 and drop; thesis tension + opportunity survive.
    expect(packet.supportingInsights).toEqual([
      "The core near-checkout tension is equivalence for price",
      "Transparent comparison",
    ]);
    expect(packet.supportingItemIds).toEqual(denseTopic.supportingItemIds);
    expect(packet.supportingInsights.join(" ")).not.toMatch(
      /market addressed|decision sequence|Magnesium|B12/i,
    );
  });

  it("keeps methodology thesis carriers (competitor/opportunity) in Teach when they match the Topic", () => {
    const methodDto: PublishedLibraryDto = {
      ...dto,
      items: [
        {
          itemId: "item_aud",
          artifactId: "art_1",
          kind: "audience",
          statement: "Label-focused supplement shoppers",
          provenance: "aud",
          origin: "extracted",
          confidence: "high",
          evidenceQuote: null,
          sourceRefs: [],
          tags: [],
          isHypothesis: false,
        },
        {
          itemId: "item_comp",
          artifactId: "art_1",
          kind: "competitor",
          statement:
            "Competitors often cite third-party label reviews as if the product were clinically tested",
          provenance: "comp",
          origin: "extracted",
          confidence: "high",
          evidenceQuote: "label review vs clinical test",
          sourceRefs: ["CRN"],
          tags: [],
          isHypothesis: false,
        },
        {
          itemId: "item_opp_method",
          artifactId: "art_1",
          kind: "opportunity",
          statement:
            "Teach the distinction between a product being tested and its label merely being reviewed",
          provenance: "opp",
          origin: "extracted",
          confidence: "high",
          evidenceQuote: null,
          sourceRefs: [],
          tags: [],
          isHypothesis: false,
        },
        {
          itemId: "item_pad_a",
          artifactId: "art_1",
          kind: "fact",
          statement: "Category loyalty scores rose five points last year",
          provenance: "pad",
          origin: "extracted",
          confidence: "medium",
          evidenceQuote: null,
          sourceRefs: [],
          tags: [],
          isHypothesis: false,
        },
        {
          itemId: "item_pad_b",
          artifactId: "art_1",
          kind: "fact",
          statement: "Platform reach metrics improved for wellness creators",
          provenance: "pad",
          origin: "extracted",
          confidence: "medium",
          evidenceQuote: null,
          sourceRefs: [],
          tags: [],
          isHypothesis: false,
        },
      ],
    };
    const methodTopic: TopicOpportunity = {
      ...topic,
      title: "Was the supplement tested, or was its label just reviewed?",
      premise: "Shoppers confuse clinical testing with label review.",
      primaryTension: "Tested versus reviewed looks the same on a claim",
      opportunity: "Teach the tested-versus-reviewed distinction",
      desiredTakeaway: "Ask whether the product was tested or only label-reviewed",
      supportingItemIds: [
        "item_aud",
        "item_comp",
        "item_opp_method",
        "item_pad_a",
        "item_pad_b",
      ],
    };
    const packet = buildTopicPacket({
      dto: methodDto,
      direction,
      topic: methodTopic,
      artifactId: "art_1",
    });
    expect(packet.supportingInsights).toEqual(
      expect.arrayContaining([
        "Competitors often cite third-party label reviews as if the product were clinically tested",
        "Teach the distinction between a product being tested and its label merely being reviewed",
      ]),
    );
    expect(packet.supportingInsights.join(" ")).not.toMatch(
      /loyalty|platform reach|Label-focused/i,
    );
    expect(packet.supportingItemIds).toEqual(methodTopic.supportingItemIds);
  });

  it("keeps Mg/Fe form teaching facts when the Topic is about nutrient form differences", () => {
    const formDto: PublishedLibraryDto = {
      ...dto,
      items: [
        {
          itemId: "item_aud",
          artifactId: "art_1",
          kind: "audience",
          statement: "Shoppers comparing mineral forms",
          provenance: "aud",
          origin: "extracted",
          confidence: "high",
          evidenceQuote: null,
          sourceRefs: [],
          tags: [],
          isHypothesis: false,
        },
        {
          itemId: "item_ten_form",
          artifactId: "art_1",
          kind: "tension",
          statement: "Form advice that works for one mineral misleads for another",
          provenance: "ten",
          origin: "extracted",
          confidence: "high",
          evidenceQuote: null,
          sourceRefs: [],
          tags: [],
          isHypothesis: false,
        },
        {
          itemId: "item_mg",
          artifactId: "art_1",
          kind: "fact",
          statement: "Magnesium absorption varies among forms",
          provenance: "NIH",
          origin: "extracted",
          confidence: "high",
          evidenceQuote: "soluble forms",
          sourceRefs: ["NIH ODS Mg"],
          tags: [],
          isHypothesis: false,
        },
        {
          itemId: "item_fe",
          artifactId: "art_1",
          kind: "fact",
          statement: "Iron absorption also differs by form and food context",
          provenance: "NIH",
          origin: "extracted",
          confidence: "high",
          evidenceQuote: "heme nonheme",
          sourceRefs: ["NIH ODS Fe"],
          tags: [],
          isHypothesis: false,
        },
        {
          itemId: "item_opp_form",
          artifactId: "art_1",
          kind: "opportunity",
          statement: "Compare magnesium and iron form rules side by side",
          provenance: "opp",
          origin: "extracted",
          confidence: "high",
          evidenceQuote: null,
          sourceRefs: [],
          tags: [],
          isHypothesis: false,
        },
      ],
    };
    const formTopic: TopicOpportunity = {
      ...topic,
      title: "Does magnesium form advice also apply to iron?",
      premise: "Form rules are nutrient-specific, not universal.",
      primaryTension: "One mineral's best form is treated as a rule for another",
      opportunity: "Side-by-side magnesium and iron form comparison",
      desiredTakeaway: "Check form evidence per nutrient before copying advice",
      supportingItemIds: [
        "item_aud",
        "item_ten_form",
        "item_mg",
        "item_fe",
        "item_opp_form",
      ],
    };
    const packet = buildTopicPacket({
      dto: formDto,
      direction,
      topic: formTopic,
      artifactId: "art_1",
    });
    expect(packet.supportingInsights).toEqual(
      expect.arrayContaining([
        "Magnesium absorption varies among forms",
        "Iron absorption also differs by form and food context",
        "Compare magnesium and iron form rules side by side",
      ]),
    );
    expect(packet.supportingInsights.join(" ")).not.toMatch(/Shoppers comparing/i);
  });

  it("when all topic-relative scores are zero, fail-open allows facts then tension|opportunity but never audience|moment", () => {
    const sparseDto: PublishedLibraryDto = {
      ...dto,
      items: [
        {
          itemId: "item_aud",
          artifactId: "art_1",
          kind: "audience",
          statement: "U.S. adults who shop online are the market addressed",
          provenance: "header",
          origin: "extracted",
          confidence: "high",
          evidenceQuote: null,
          sourceRefs: [],
          tags: [],
          isHypothesis: false,
        },
        {
          itemId: "item_mom",
          artifactId: "art_1",
          kind: "moment",
          statement: "The supported decision sequence begins after a shortlist",
          provenance: "moment",
          origin: "extracted",
          confidence: "high",
          evidenceQuote: null,
          sourceRefs: [],
          tags: [],
          isHypothesis: false,
        },
        {
          itemId: "item_ten",
          artifactId: "art_1",
          kind: "tension",
          statement: "Alpha zeta framing remains unresolved in the dossier",
          provenance: "tension",
          origin: "extracted",
          confidence: "high",
          evidenceQuote: null,
          sourceRefs: [],
          tags: [],
          isHypothesis: false,
        },
        {
          itemId: "item_opp_only",
          artifactId: "art_1",
          kind: "opportunity",
          statement: "Beta gamma pathway remains teachable in the dossier",
          provenance: "opp",
          origin: "extracted",
          confidence: "high",
          evidenceQuote: null,
          sourceRefs: [],
          tags: [],
          isHypothesis: false,
        },
        {
          itemId: "item_one_fact",
          artifactId: "art_1",
          kind: "fact",
          statement: "CRN published a zeta-only panel without alpha terms",
          provenance: "CRN",
          origin: "extracted",
          confidence: "medium",
          evidenceQuote: "67% labels",
          sourceRefs: ["CRN"],
          tags: [],
          isHypothesis: false,
        },
        {
          itemId: "item_rest",
          artifactId: "art_1",
          kind: "restriction",
          statement: "Do not recommend dosage",
          provenance: "§8",
          origin: "extracted",
          confidence: "high",
          evidenceQuote: null,
          sourceRefs: [],
          tags: [],
          isHypothesis: false,
        },
      ],
    };
    // Topic brief tokens intentionally miss support statements → score-all-zero fail-open.
    const sparseTopic: TopicOpportunity = {
      ...topic,
      title: "Why does checkout feel unfair?",
      premise: "Buyers sense a mismatch near purchase.",
      primaryTension: "Checkout fairness",
      opportunity: "Name the mismatch plainly",
      desiredTakeaway: "Slow down near the purchase click",
      supportingItemIds: [
        "item_aud",
        "item_mom",
        "item_ten",
        "item_opp_only",
        "item_one_fact",
        "item_rest",
      ],
      restrictionItemIds: ["item_rest"],
      limitationItemIds: [],
    };
    const packet = buildTopicPacket({
      dto: sparseDto,
      direction,
      topic: sparseTopic,
      artifactId: "art_1",
    });
    expect(packet.supportingInsights).toEqual([
      "CRN published a zeta-only panel without alpha terms",
      "Alpha zeta framing remains unresolved in the dossier",
      "Beta gamma pathway remains teachable in the dossier",
    ]);
    expect(packet.supportingInsights.join(" ")).not.toMatch(
      /market addressed|shortlist|dosage/i,
    );
  });
});
