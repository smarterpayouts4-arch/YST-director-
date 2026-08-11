import type { InterviewQuestion } from "@/features/research-prompt-builder/schemas";

/** Hard short-form caps (slightly above prompt soft targets). */
export const INTERVIEW_LENGTH_CAPS = {
  question: 180,
  whyThisMatters: 140,
  whatWeNoticed: 200,
  suggestedAnswer: 280,
  suggestionTitle: 80,
  suggestionBody: 280,
} as const;

/** Title-only channel/tactic names — bodies may name channels for researchFocus. */
const TITLE_TACTICS =
  /\b(instagram|tiktok|youtube|google ads|seo|newsletter|email list|influencer|billboard)\b/i;

/** Narrow rejection of market-fact questions the owner should not invent. */
const MARKET_FACT_QUESTION =
  /\b(who (are|is) (your|my) competitors?|what (is|are) trending|what (do|are) customers search|which platforms? (perform|work) best|what content gaps? exist|market size|demographics? of (the|your) market)\b/i;

export type ValidateInterviewQuestionOptions = {
  /** Legal profile field keys for strategic card evidenceRefs. */
  evidenceAllowlist?: Set<string>;
};

function hasEmOrEnDash(text: string): boolean {
  return /[\u2014\u2013]/.test(text);
}

function validateStrategicSuggestions(
  question: InterviewQuestion,
  issues: string[],
  evidenceAllowlist?: Set<string>,
): void {
  const cards = question.strategicSuggestions;
  if (cards.length < 3 || cards.length > 5) {
    issues.push("strategic_direction requires 3 to 5 strategicSuggestions.");
  }
  if (question.suggestedAnswer !== null) {
    issues.push("strategic_direction suggestedAnswer must be null.");
  }

  const ids = new Set<string>();
  const titles = new Set<string>();
  for (const card of cards) {
    if (ids.has(card.suggestionId)) {
      issues.push(`Duplicate suggestionId: ${card.suggestionId}`);
    }
    ids.add(card.suggestionId);

    const titleKey = card.title.trim().toLowerCase();
    if (titles.has(titleKey)) {
      issues.push(`Duplicate suggestion title: ${card.title}`);
    }
    titles.add(titleKey);

    if (TITLE_TACTICS.test(card.title)) {
      issues.push(
        `Suggestion title looks like a channel/tactic, not a strategic hypothesis: ${card.title}`,
      );
    }

    if (card.title.length > INTERVIEW_LENGTH_CAPS.suggestionTitle) {
      issues.push(`suggestion title must be ≤${INTERVIEW_LENGTH_CAPS.suggestionTitle} characters.`);
    }
    for (const [label, value] of [
      ["description", card.description],
      ["rationale", card.rationale],
      ["researchFocus", card.researchFocus],
    ] as const) {
      if (value.length > INTERVIEW_LENGTH_CAPS.suggestionBody) {
        issues.push(
          `suggestion ${label} must be ≤${INTERVIEW_LENGTH_CAPS.suggestionBody} characters.`,
        );
      }
      if (hasEmOrEnDash(value)) {
        issues.push(`suggestion ${label} must not use em or en dashes.`);
      }
    }
    if (hasEmOrEnDash(card.title)) {
      issues.push("suggestion title must not use em or en dashes.");
    }

    if (card.evidenceRefs.length === 0) {
      issues.push(`suggestion ${card.suggestionId} needs at least one evidenceRef.`);
    }
    if (evidenceAllowlist) {
      for (const ref of card.evidenceRefs) {
        if (!evidenceAllowlist.has(ref)) {
          issues.push(
            `evidenceRef "${ref}" is not a non-rejected profile field key.`,
          );
        }
      }
    }
  }
}

function validateStandardSuggestion(
  question: InterviewQuestion,
  issues: string[],
): void {
  if (question.strategicSuggestions.length > 0) {
    issues.push("standard questions must have an empty strategicSuggestions array.");
  }
  if (question.suggestedAnswer === null) {
    issues.push("standard questions require a non-null suggestedAnswer.");
    return;
  }
  if (/be specific|describe your|what are your goals/i.test(question.suggestedAnswer)) {
    issues.push("Suggested answer is too generic.");
  }
  if (question.suggestedAnswer.length > INTERVIEW_LENGTH_CAPS.suggestedAnswer) {
    issues.push(
      `suggestedAnswer must be ≤${INTERVIEW_LENGTH_CAPS.suggestedAnswer} characters.`,
    );
  }
  if (hasEmOrEnDash(question.suggestedAnswer)) {
    issues.push("Owner-facing strings must not use em or en dashes.");
  }
}

export function validateInterviewQuestion(
  question: InterviewQuestion,
  options: ValidateInterviewQuestionOptions = {},
): string[] {
  const issues: string[] = [];
  const scores = Object.values(question.qualityScores);
  if (scores.some((score) => score < 4)) {
    issues.push("All quality scores must be at least 4.");
  }
  const marks = (question.question.match(/\?/g) ?? []).length;
  if (marks > 1) {
    issues.push("Question must ask one decision only.");
  }
  if (/\band\b.+\?/i.test(question.question) && /,\s*and\b/i.test(question.question)) {
    issues.push("Question appears multi-part.");
  }

  if (MARKET_FACT_QUESTION.test(question.question)) {
    issues.push(
      "Question asks the owner for a market fact that rigorous external research should discover.",
    );
  }

  if (question.question.length > INTERVIEW_LENGTH_CAPS.question) {
    issues.push(
      `question must be ≤${INTERVIEW_LENGTH_CAPS.question} characters (short-form owner UX).`,
    );
  }
  if (question.whyThisMatters.length > INTERVIEW_LENGTH_CAPS.whyThisMatters) {
    issues.push(
      `whyThisMatters must be ≤${INTERVIEW_LENGTH_CAPS.whyThisMatters} characters.`,
    );
  }
  if (question.whatWeNoticed.length > INTERVIEW_LENGTH_CAPS.whatWeNoticed) {
    issues.push(
      `whatWeNoticed must be ≤${INTERVIEW_LENGTH_CAPS.whatWeNoticed} characters.`,
    );
  }

  if (
    hasEmOrEnDash(
      [question.question, question.whyThisMatters, question.whatWeNoticed].join(" "),
    )
  ) {
    issues.push("Owner-facing strings must not use em or en dashes.");
  }

  if (question.questionKind === "strategic_direction") {
    if (question.decisionCategory !== "strategic_direction") {
      issues.push(
        "strategic_direction questionKind requires decisionCategory strategic_direction.",
      );
    }
    validateStrategicSuggestions(question, issues, options.evidenceAllowlist);
  } else {
    if (question.decisionCategory === "strategic_direction") {
      issues.push(
        "standard questionKind cannot use decisionCategory strategic_direction.",
      );
    }
    validateStandardSuggestion(question, issues);
  }

  return issues;
}
