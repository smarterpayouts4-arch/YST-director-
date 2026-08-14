import { describe, expect, it } from "vitest";
import { buildProposeDirectionsPrompt } from "@/features/content-intelligence/topics/prompts/propose-directions";
import { TOPICS_RUNTIME_PROMPT_VERSION } from "@/features/content-intelligence/topics/prompts/prompt-version";
import {
  TopicDirectionSchema,
  TopicDirectionsDraftSchema,
} from "@/features/content-intelligence/topics/schemas/direction";

describe("propose-topic-directions contract", () => {
  it("stamps Topic Engine prompt version (not Librarian)", () => {
    const { instructions, promptVersion } = buildProposeDirectionsPrompt({
      publishedLibrary: {
        libraryId: "lib_1",
        publishedAt: "2026-08-12T12:00:00.000Z",
        items: [],
      },
    });
    expect(promptVersion).toBe(TOPICS_RUNTIME_PROMPT_VERSION);
    expect(TOPICS_RUNTIME_PROMPT_VERSION).toBe("ci-topics-1.1.9");
    expect(instructions).toContain(`Prompt version: ${TOPICS_RUNTIME_PROMPT_VERSION}`);
    expect(instructions).not.toMatch(/ci-librarian/);
  });

  it("fences DTO, shared grounding, and forbids filler / topic titles", () => {
    const { instructions, input } = buildProposeDirectionsPrompt({
      publishedLibrary: {
        libraryId: "lib_1",
        publishedAt: "2026-08-12T12:00:00.000Z",
        items: [
          {
            itemId: "item_1",
            artifactId: "art_1",
            kind: "opportunity",
            statement: "Transparent comparison",
            provenance: "p",
            origin: "extracted",
            confidence: "high",
            evidenceQuote: null,
            sourceRefs: [],
            tags: [],
            isHypothesis: false,
          },
        ],
      },
    });
    expect(input).toContain("BEGIN_UNTRUSTED_PUBLISHED_LIBRARY_DTO");
    expect(instructions).toMatch(/Never invent a third Direction just to fill the screen/i);
    expect(instructions).toMatch(/decisionQuestion/i);
    expect(instructions).toMatch(/not a topic title/i);
    expect(instructions).toMatch(/supportingItemIds grounding contract/i);
    expect(instructions).toMatch(/opportunity OR tension/i);
    expect(instructions).toMatch(/audience OR moment/i);
    expect(instructions).toMatch(/Recommended lane to explore first/i);
    expect(instructions).not.toMatch(/recommended=true/i);
  });

  it("1.1.x doctrine uses content lanes; normally 3; never invent filler", () => {
    expect(TOPICS_RUNTIME_PROMPT_VERSION).toBe("ci-topics-1.1.9");
    const { instructions } = buildProposeDirectionsPrompt({
      publishedLibrary: {
        libraryId: "lib_1",
        publishedAt: "2026-08-12T12:00:00.000Z",
        items: [],
      },
    });
    expect(instructions).toMatch(/content lane/i);
    expect(instructions).toMatch(/Normally present three useful Directions/i);
    expect(instructions).toMatch(/subdivide it into distinct/i);
    expect(instructions).toMatch(/MAY share audience/i);
    expect(instructions).toMatch(/maximum 3/i);
    expect(instructions).toMatch(/1 or 2 remains valid/i);
    expect(instructions).toMatch(/Never invent a third Direction just to fill the screen/i);
  });

  it("draft schema requires decisionQuestion, allows 1–3, and has no recommended field", () => {
    expect(
      Object.keys(TopicDirectionsDraftSchema.shape.directions.element.shape),
    ).not.toContain("recommended");
    expect(Object.keys(TopicDirectionSchema.shape)).not.toContain("recommended");

    expect(() =>
      TopicDirectionsDraftSchema.parse({ directions: [] }),
    ).toThrow();
    expect(() =>
      TopicDirectionsDraftSchema.parse({
        directions: [
          {
            name: "A",
            description: "d",
            primaryAudience: "aud",
            primaryMoment: "mom",
            primaryTension: "ten",
            primaryOpportunity: "opp",
            supportingItemIds: ["a", "b"],
            confidence: "high",
            priority: 1,
            rationale: "r",
            hypothesisDependent: false,
            unresolvedDependent: false,
          },
        ],
      }),
    ).toThrow();
    const one = TopicDirectionsDraftSchema.parse({
      directions: [
        {
          name: "A",
          description: "d",
          decisionQuestion: "Are these products comparable?",
          primaryAudience: "aud",
          primaryMoment: "mom",
          primaryTension: "ten",
          primaryOpportunity: "opp",
          supportingItemIds: ["a", "b"],
          confidence: "high",
          priority: 1,
          rationale: "r",
          hypothesisDependent: false,
          unresolvedDependent: false,
        },
      ],
    });
    expect(one.directions).toHaveLength(1);
    expect(one.directions[0]!.decisionQuestion).toMatch(/comparable/i);
  });
});
