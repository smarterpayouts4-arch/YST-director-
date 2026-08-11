import { describe, expect, it } from "vitest";
import { assembleBriefContext } from "@/ai/context/assemble-brief-context";
import { buildStrategyInterviewAnswer } from "@/features/research-prompt-builder/lib/compose-strategy-answer";
import { makeConfirmedProfile } from "../fixtures/api/confirmed-profile";
import { makeStrategicDirectionQuestion } from "../fixtures/api/interview-question";

describe("unselected strategic hypotheses must not leak into brief context", () => {
  it("brief packet contains selected titles only, never full strategicSuggestions", () => {
    const question = makeStrategicDirectionQuestion();
    const selectedId = question.strategicSuggestions[0]!.suggestionId;
    const answer = buildStrategyInterviewAnswer({
      question,
      selectedSuggestionIds: [selectedId],
      customDirection: null,
    });

    const packet = assembleBriefContext({
      confirmedProfile: makeConfirmedProfile(),
      questions: [question],
      answers: [answer],
    });

    const serialized = JSON.stringify(packet.packet);
    expect(serialized).not.toContain("strategicSuggestions");
    expect(packet.packet.acceptedAnswers[0]?.selectedSuggestionIds).toEqual([
      selectedId,
    ]);
    expect(packet.packet.acceptedAnswers[0]?.answerText).toContain(
      question.strategicSuggestions[0]!.title,
    );

    for (const card of question.strategicSuggestions.slice(1)) {
      expect(packet.packet.acceptedAnswers[0]?.answerText).not.toContain(card.title);
      expect(serialized).not.toContain(card.suggestionId);
    }
  });
});
