export const CONTEXT_BUDGETS = {
  companyAnalysisChars: 36_000,
  interviewChars: 18_000,
  briefChars: 16_000,
  promptChars: 14_000,
  evidenceRowsMax: 80,
  columnSummariesMax: 40,
  sampleValuesMax: 4,
  profileFieldsMax: 40,
  priorQaPairsMax: 7,
  unresolvedUnknownsMax: 12,
  answerExcerptChars: 900,
  documentSummaryChars: 1200,
} as const;

export type ContextBudgetKey = keyof typeof CONTEXT_BUDGETS;

export function measureJsonChars(value: unknown): number {
  return JSON.stringify(value).length;
}

export function truncateString(value: string, maxChars: number): {
  value: string;
  truncated: boolean;
} {
  if (value.length <= maxChars) return { value, truncated: false };
  return {
    value: `${value.slice(0, Math.max(0, maxChars - 1))}…`,
    truncated: true,
  };
}
