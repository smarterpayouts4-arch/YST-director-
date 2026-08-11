import type {
  BriefFieldKey,
  BriefFieldProvenance,
  FieldOrigin,
  ResearchBrief,
} from "@/features/research-prompt-builder/schemas";

export const BRIEF_FIELD_KEYS = [
  "customerMoment",
  "viewerReward",
  "challengeHypothesis",
  "contentHypothesis",
  "executionContext",
  "companyTruth",
  "businessBridge",
  "primaryPlatform",
  "trustBoundaries",
  "unresolvedUnknowns",
] as const satisfies readonly BriefFieldKey[];

export function makeFieldOrigin(
  origin: FieldOrigin["origin"],
  sourceRefs: string[] = [],
): FieldOrigin {
  return { origin, sourceRefs: sourceRefs.slice(0, 3) };
}

/** Default model-hypothesis provenance for fixtures / repair. */
export function defaultBriefFieldProvenance(
  overrides: Partial<BriefFieldProvenance> = {},
): BriefFieldProvenance {
  const base = Object.fromEntries(
    BRIEF_FIELD_KEYS.map((key) => [key, makeFieldOrigin("model_hypothesis")]),
  ) as BriefFieldProvenance;
  return { ...base, ...overrides };
}

export function provenanceLabel(origin: FieldOrigin["origin"]): string {
  switch (origin) {
    case "confirmed_profile":
      return "From confirmed profile";
    case "owner_answer":
      return "From owner answer";
    case "owner_selected_hypothesis":
      return "From selected research priority";
    case "owner_brief_edit":
      return "Owner edited";
    case "model_hypothesis":
      return "Working hypothesis";
    default:
      return "Working hypothesis";
  }
}

/** Mark edited brief fields as owner_brief_edit when values change. */
export function applyBriefEditProvenance(
  previous: ResearchBrief,
  next: ResearchBrief,
): ResearchBrief {
  const provenance: BriefFieldProvenance = { ...previous.fieldProvenance };
  for (const key of BRIEF_FIELD_KEYS) {
    const prevValue = previous[key];
    const nextValue = next[key];
    const changed = JSON.stringify(prevValue) !== JSON.stringify(nextValue);
    if (changed) {
      provenance[key] = makeFieldOrigin("owner_brief_edit");
    }
  }
  return { ...next, fieldProvenance: provenance };
}
