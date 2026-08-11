import { describe, expect, it } from "vitest";
import {
  buildStrategyInterviewAnswer,
  canContinueStrategySelection,
  composeStrategyAnswerText,
  unselectedSuggestionTitles,
} from "@/features/research-prompt-builder/lib/compose-strategy-answer";
import { makeStrategicDirectionQuestion } from "../fixtures/api/interview-question";

describe("composeStrategyAnswerText", () => {
  const question = makeStrategicDirectionQuestion();

  it("enumerates a single selected hypothesis", () => {
    const selected = [question.strategicSuggestions[0]!];
    const text = composeStrategyAnswerText({
      selected,
      customDirection: null,
    });
    expect(text).toContain("Owner selected these strategic hypotheses");
    expect(text).toContain(selected[0]!.title);
    expect(text).toContain(selected[0]!.description);
    expect(text).toContain("Research should test:");
  });

  it("enumerates multiple selections without blending", () => {
    const selected = question.strategicSuggestions.slice(0, 2);
    const text = composeStrategyAnswerText({
      selected,
      customDirection: null,
    });
    expect(text).toContain("(1) ");
    expect(text).toContain("(2) ");
    expect(text).toContain(selected[0]!.title);
    expect(text).toContain(selected[1]!.title);
  });

  it("includes custom direction and excludes unselected titles", () => {
    const selectedIds = [question.strategicSuggestions[0]!.suggestionId];
    const answer = buildStrategyInterviewAnswer({
      question,
      selectedSuggestionIds: selectedIds,
      customDirection: "Test a membership-led education model for repeat buyers.",
    });
    expect(answer.customDirection).toMatch(/membership-led/i);
    expect(answer.answerText).toContain("(custom)");
    expect(answer.selectedSuggestionIds).toEqual(selectedIds);

    const excluded = unselectedSuggestionTitles(question, selectedIds);
    for (const title of excluded) {
      expect(answer.answerText).not.toContain(title);
    }
  });

  it("allows custom-only selection", () => {
    expect(
      canContinueStrategySelection({
        selectedSuggestionIds: [],
        customDirection: "Investigate local trust partnerships.",
      }),
    ).toBe(true);
    const answer = buildStrategyInterviewAnswer({
      question,
      selectedSuggestionIds: [],
      customDirection: "Investigate local trust partnerships.",
    });
    expect(answer.selectedSuggestionIds).toEqual([]);
    expect(answer.answerText).toContain("Investigate local trust partnerships.");
    for (const card of question.strategicSuggestions) {
      expect(answer.answerText).not.toContain(card.title);
    }
  });

  it("rejects empty selection", () => {
    expect(
      canContinueStrategySelection({
        selectedSuggestionIds: [],
        customDirection: null,
      }),
    ).toBe(false);
    expect(() =>
      buildStrategyInterviewAnswer({
        question,
        selectedSuggestionIds: [],
        customDirection: "   ",
      }),
    ).toThrow(/required/i);
  });
});
