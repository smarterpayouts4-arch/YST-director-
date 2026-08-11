import { describe, expect, it } from "vitest";
import {
  allCoreResolved,
  resolveCoreCoverage,
} from "@/features/research-prompt-builder/lib/core-coverage";
import { buildStrategyInterviewAnswer } from "@/features/research-prompt-builder/lib/compose-strategy-answer";
import { makeConfirmedProfile } from "../fixtures/api/confirmed-profile";
import {
  makeInterviewAnswer,
  makeInterviewQuestion,
  makeStrategicDirectionQuestion,
} from "../fixtures/api/interview-question";

describe("resolveCoreCoverage", () => {
  it("counts owner answers for CORE categories", () => {
    const question = makeInterviewQuestion({
      decisionCategory: "customer_moment",
    });
    const { covered } = resolveCoreCoverage({
      confirmedProfile: makeConfirmedProfile(),
      previousQuestions: [question],
      previousAnswers: [makeInterviewAnswer({ questionId: question.questionId })],
    });
    expect(covered.has("customer_moment")).toBe(true);
  });

  it("counts selected strategic hypotheses via resolvesBriefFields", () => {
    const question = makeStrategicDirectionQuestion({
      resolvesBriefFields: ["contentHypothesis", "challengeHypothesis"],
    });
    const answer = buildStrategyInterviewAnswer({
      question,
      selectedSuggestionIds: [question.strategicSuggestions[0]!.suggestionId],
      customDirection: null,
    });
    const { covered, resolutions } = resolveCoreCoverage({
      confirmedProfile: makeConfirmedProfile(),
      previousQuestions: [question],
      previousAnswers: [answer],
    });
    expect(covered.has("challenge_assumption")).toBe(true);
    expect(
      resolutions.some((r) => r.source === "owner_selected_hypothesis"),
    ).toBe(true);
    expect(allCoreResolved(covered)).toBe(false);
  });

  it("treats confirmed claim_* fields as trust_boundaries evidence", () => {
    const profile = makeConfirmedProfile();
    const { covered } = resolveCoreCoverage({
      confirmedProfile: profile,
      previousQuestions: [],
      previousAnswers: [],
    });
    // Fixture profile includes claim_0 when built from company understanding.
    if (Object.keys(profile.fields).some((k) => /^claim_/.test(k))) {
      expect(covered.has("trust_boundaries")).toBe(true);
    }
  });
});
