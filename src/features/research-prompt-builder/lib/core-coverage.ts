import type {
  BriefFieldKey,
  ConfirmedCompanyProfile,
  InterviewAnswer,
  InterviewQuestion,
} from "@/features/research-prompt-builder/schemas";

export const CORE_CATEGORIES = [
  "customer_moment",
  "viewer_reward",
  "business_bridge",
  "trust_boundaries",
  "challenge_assumption",
] as const;

export type CoreCategory = (typeof CORE_CATEGORIES)[number];

const BRIEF_FIELD_TO_CORE: Partial<Record<BriefFieldKey, CoreCategory>> = {
  customerMoment: "customer_moment",
  viewerReward: "viewer_reward",
  businessBridge: "business_bridge",
  trustBoundaries: "trust_boundaries",
  challengeHypothesis: "challenge_assumption",
};

export type CoreResolution = {
  category: CoreCategory;
  source:
    | "owner_answer"
    | "owner_selected_hypothesis"
    | "confirmed_profile";
  sourceKey: string;
};

/**
 * CORE items may be satisfied by an owner answer, a selected strategic
 * hypothesis that names a matching brief field, or an explicit confirmed
 * profile field — without inventing a new strategic inference.
 */
export function resolveCoreCoverage(input: {
  confirmedProfile: ConfirmedCompanyProfile;
  previousQuestions: InterviewQuestion[];
  previousAnswers: InterviewAnswer[];
}): {
  covered: Set<CoreCategory>;
  resolutions: CoreResolution[];
} {
  const resolutions: CoreResolution[] = [];
  const covered = new Set<CoreCategory>();

  const answersById = new Map(
    input.previousAnswers.map((a) => [a.questionId, a]),
  );

  for (const question of input.previousQuestions) {
    if (!answersById.has(question.questionId)) continue;

    if (
      (CORE_CATEGORIES as readonly string[]).includes(question.decisionCategory)
    ) {
      const category = question.decisionCategory as CoreCategory;
      covered.add(category);
      resolutions.push({
        category,
        source: "owner_answer",
        sourceKey: question.questionId,
      });
    }

    if (question.questionKind !== "strategic_direction") continue;
    const answer = answersById.get(question.questionId)!;
    if (
      (answer.selectedSuggestionIds?.length ?? 0) === 0 &&
      !answer.customDirection?.trim()
    ) {
      continue;
    }
    for (const briefField of question.resolvesBriefFields) {
      const category = BRIEF_FIELD_TO_CORE[briefField];
      if (!category || covered.has(category)) continue;
      // Only count when the mapping is explicit on the question — no inference.
      covered.add(category);
      resolutions.push({
        category,
        source: "owner_selected_hypothesis",
        sourceKey: briefField,
      });
    }
  }

  // Explicit trust boundaries in the confirmed profile (claim_* / claimsAndRestrictions).
  if (!covered.has("trust_boundaries")) {
    const claimKeys = Object.entries(input.confirmedProfile.fields).filter(
      ([key, field]) =>
        (/^claim_\d+$/.test(key) || key === "claimsAndRestrictions") &&
        field.status !== "rejected" &&
        field.value.trim().length >= 12,
    );
    if (claimKeys.length > 0) {
      covered.add("trust_boundaries");
      resolutions.push({
        category: "trust_boundaries",
        source: "confirmed_profile",
        sourceKey: claimKeys[0]![0],
      });
    }
  }

  return { covered, resolutions };
}

export function allCoreResolved(covered: Set<CoreCategory>): boolean {
  return CORE_CATEGORIES.every((c) => covered.has(c));
}
