import { describe, expect, it } from "vitest";
import {
  INTERVIEW_LENGTH_CAPS,
  validateInterviewQuestion,
} from "@/features/research-prompt-builder/validation/interview";
import {
  makeInterviewQuestion,
  makeStrategicDirectionQuestion,
  makeStrategicSuggestion,
} from "../fixtures/api/interview-question";

describe("interview short-form validation", () => {
  it("accepts the standard fixture question within short-form caps", () => {
    expect(validateInterviewQuestion(makeInterviewQuestion())).toEqual([]);
  });

  it("rejects an overlong question", () => {
    const issues = validateInterviewQuestion(
      makeInterviewQuestion({
        question: `${"Which decision should we lock first".padEnd(INTERVIEW_LENGTH_CAPS.question + 5, "?")}`,
      }),
    );
    expect(issues.some((i) => /question must be/i.test(i))).toBe(true);
  });

  it("rejects em dashes in owner-facing strings", () => {
    const issues = validateInterviewQuestion(
      makeInterviewQuestion({
        suggestedAnswer: "Yes — lock the form-comparison moment before purchase.",
      }),
    );
    expect(issues.some((i) => /em or en dashes/i.test(i))).toBe(true);
  });

  it("accepts a valid strategic_direction question with allowlist refs", () => {
    const question = makeStrategicDirectionQuestion();
    const allowlist = new Set(
      question.strategicSuggestions.flatMap((c) => c.evidenceRefs),
    );
    expect(
      validateInterviewQuestion(question, { evidenceAllowlist: allowlist }),
    ).toEqual([]);
  });

  it("rejects strategic_direction with fewer than 3 cards", () => {
    const issues = validateInterviewQuestion(
      makeStrategicDirectionQuestion({
        strategicSuggestions: [
          makeStrategicSuggestion(),
          makeStrategicSuggestion({ suggestionId: "b", title: "Other angle" }),
        ],
      }),
    );
    expect(issues.some((i) => /3 to 5/i.test(i))).toBe(true);
  });

  it("rejects evidenceRefs outside the allowlist", () => {
    const question = makeStrategicDirectionQuestion();
    const issues = validateInterviewQuestion(question, {
      evidenceAllowlist: new Set(["offer"]),
    });
    expect(issues.some((i) => /not a non-rejected profile field key/i.test(i))).toBe(
      true,
    );
  });

  it("rejects tactic titles on strategic cards", () => {
    const base = makeStrategicDirectionQuestion();
    const cards = [...base.strategicSuggestions];
    cards[0] = makeStrategicSuggestion({
      ...cards[0],
      title: "Post more on Instagram weekly",
    });
    const issues = validateInterviewQuestion(
      makeStrategicDirectionQuestion({ strategicSuggestions: cards }),
    );
    expect(issues.some((i) => /channel\/tactic/i.test(i))).toBe(true);
  });

  it("rejects market-fact questions", () => {
    const issues = validateInterviewQuestion(
      makeInterviewQuestion({
        question: "Who are your competitors in the US supplement market?",
      }),
    );
    expect(issues.some((i) => /market fact/i.test(i))).toBe(true);
  });

  it("requires null suggestedAnswer for strategic_direction", () => {
    const issues = validateInterviewQuestion(
      makeStrategicDirectionQuestion({
        suggestedAnswer: "Pick all three directions for now.",
      }),
    );
    expect(issues.some((i) => /suggestedAnswer must be null/i.test(i))).toBe(true);
  });

  it("requires empty strategicSuggestions for standard questions", () => {
    const issues = validateInterviewQuestion(
      makeInterviewQuestion({
        strategicSuggestions: [makeStrategicSuggestion()],
      }),
    );
    expect(issues.some((i) => /empty strategicSuggestions/i.test(i))).toBe(true);
  });
});
