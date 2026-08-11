import type {
  ConfirmedCompanyProfile,
  InterviewAnswer,
  InterviewQuestion,
  ResearchBrief,
} from "@/features/research-prompt-builder/schemas";

export type TransformationBuiltFrom = {
  companyEvidence: boolean;
  corrections: number;
  strategicDirections: number;
  ownerConstraints: number;
};

export type TransformationSummary = {
  builtFrom: TransformationBuiltFrom;
  willInvestigate: string[];
};

function countCorrections(profile: ConfirmedCompanyProfile): number {
  return Object.values(profile.fields).filter((f) => f.status === "corrected").length;
}

function countStrategicDirections(answers: InterviewAnswer[]): number {
  let count = 0;
  for (const answer of answers) {
    count += answer.selectedSuggestionIds?.length ?? 0;
    if (answer.customDirection?.trim()) count += 1;
  }
  return count;
}

function countOwnerConstraints(
  answers: InterviewAnswer[],
  questions: InterviewQuestion[],
  brief: ResearchBrief,
): number {
  const byId = new Map(questions.map((q) => [q.questionId, q]));
  let fromAnswers = 0;
  for (const answer of answers) {
    const q = byId.get(answer.questionId);
    if (
      q &&
      (q.decisionCategory === "trust_boundaries" ||
        q.decisionCategory === "regulated_claims")
    ) {
      fromAnswers += 1;
    }
  }
  const fromBrief = brief.trustBoundaries.length > 0 ? 1 : 0;
  return Math.max(fromAnswers, fromBrief);
}

/**
 * Derive the Step 5 transformation recap from existing state — no new model call.
 */
export function buildTransformationSummary(input: {
  confirmedProfile: ConfirmedCompanyProfile;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  researchBrief: ResearchBrief;
}): TransformationSummary {
  const builtFrom: TransformationBuiltFrom = {
    companyEvidence: true,
    corrections: countCorrections(input.confirmedProfile),
    strategicDirections: countStrategicDirections(input.answers),
    ownerConstraints: countOwnerConstraints(
      input.answers,
      input.questions,
      input.researchBrief,
    ),
  };

  const willInvestigate = [
    "Customer demand and language",
    "Direct and substitute competitors",
    "Category conventions",
    builtFrom.strategicDirections > 0
      ? `The ${builtFrom.strategicDirections} strategic direction${builtFrom.strategicDirections === 1 ? "" : "s"} you selected`
      : "Evidence supporting and contradicting the working content hypothesis",
    "Evidence supporting and contradicting each selected angle",
    "Trust and claim risks",
    "Content gaps versus real business opportunities",
    "Recommended pillars and opportunity-shaped experiments",
  ];

  if (input.researchBrief.unresolvedUnknowns.length > 0) {
    willInvestigate.push(
      ...input.researchBrief.unresolvedUnknowns.slice(0, 2).map((u) => u.trim()),
    );
  }

  return { builtFrom, willInvestigate };
}
