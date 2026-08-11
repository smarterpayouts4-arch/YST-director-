import type {
  InterviewAnswer,
  InterviewQuestion,
  StrategicSuggestion,
} from "@/features/research-prompt-builder/schemas";

export type StrategySelectionInput = {
  question: InterviewQuestion;
  selectedSuggestionIds: string[];
  customDirection: string | null;
  supportingDocuments?: InterviewAnswer["supportingDocuments"];
};

/**
 * Compose answerText that enumerates only selected hypotheses (+ optional custom).
 * Unselected card titles never appear. Content stays hypothesis-grade;
 * selection itself is owner-confirmed research scope.
 */
export function composeStrategyAnswerText(input: {
  selected: StrategicSuggestion[];
  customDirection: string | null;
}): string {
  const lines: string[] = [
    "Owner selected these strategic hypotheses for the research to test:",
  ];
  input.selected.forEach((card, index) => {
    lines.push(`(${index + 1}) ${card.title} — ${card.description}`);
    lines.push(`Research should test: ${card.researchFocus}`);
  });
  const custom = input.customDirection?.trim();
  if (custom) {
    lines.push(
      `(custom) Owner-added research direction (working hypothesis): ${custom}`,
    );
  }
  return lines.join("\n");
}

export function resolveSelectedSuggestions(
  question: InterviewQuestion,
  selectedSuggestionIds: string[],
): StrategicSuggestion[] {
  const byId = new Map(
    question.strategicSuggestions.map((card) => [card.suggestionId, card]),
  );
  const selected: StrategicSuggestion[] = [];
  for (const id of selectedSuggestionIds) {
    const card = byId.get(id);
    if (card) selected.push(card);
  }
  return selected;
}

export function canContinueStrategySelection(input: {
  selectedSuggestionIds: string[];
  customDirection: string | null;
}): boolean {
  if (input.selectedSuggestionIds.length > 0) return true;
  return Boolean(input.customDirection?.trim());
}

export function buildStrategyInterviewAnswer(
  input: StrategySelectionInput,
): InterviewAnswer {
  const selected = resolveSelectedSuggestions(
    input.question,
    input.selectedSuggestionIds,
  );
  const custom = input.customDirection?.trim() || null;
  if (selected.length === 0 && !custom) {
    throw new Error("At least one strategic direction or a custom direction is required.");
  }
  // Drop any ids that did not resolve (defense against stale UI state).
  const selectedIds = selected.map((card) => card.suggestionId);
  return {
    questionId: input.question.questionId,
    answerText: composeStrategyAnswerText({
      selected,
      customDirection: custom,
    }),
    usedSuggestion: selectedIds.length > 0 && !custom,
    selectedSuggestionIds: selectedIds,
    customDirection: custom,
    supportingDocuments: input.supportingDocuments ?? [],
    answeredAt: new Date().toISOString(),
  };
}

/** Titles of unselected cards — must never appear in composed answerText. */
export function unselectedSuggestionTitles(
  question: InterviewQuestion,
  selectedSuggestionIds: string[],
): string[] {
  const selected = new Set(selectedSuggestionIds);
  return question.strategicSuggestions
    .filter((card) => !selected.has(card.suggestionId))
    .map((card) => card.title);
}
