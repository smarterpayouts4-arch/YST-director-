import type {
  ClassifiedField,
  CompanyUnderstanding,
  ConfirmedCompanyProfile,
} from "@/features/research-prompt-builder/types";

/** Internal field-group ids used to map IR fields into confirmation sections. */
export type ProfileTopicId =
  | "company"
  | "offering"
  | "audience"
  | "needs"
  | "access"
  | "geography"
  | "differentiators"
  | "boundaries"
  | "expertise";

export type ProfileSectionId =
  | "who_we_help"
  | "company_and_offer"
  | "focus_and_next"
  | "trust_and_proof"
  | "limits_and_notes";

export type EditableField = {
  key: string;
  label: string;
  field: ClassifiedField;
  topicId: ProfileTopicId;
  /** Optional subheading when multiple topic groups share one section. */
  groupLabel?: string;
};

export type ProfileSection = {
  id: ProfileSectionId;
  label: string;
  purpose: string;
  topicIds: ProfileTopicId[];
  /** Field keys that must be resolved when this section is completed. */
  fieldKeys: string[];
};

const TOPIC_GROUP_LABELS: Record<ProfileTopicId, string> = {
  company: "Company",
  offering: "Offer",
  audience: "Audience",
  needs: "Need",
  access: "Next step",
  geography: "Market",
  differentiators: "Difference",
  boundaries: "Off-limits",
  expertise: "Proof",
};

export const PROFILE_SECTIONS: Array<Omit<ProfileSection, "fieldKeys">> = [
  {
    id: "who_we_help",
    label: "Who we’re helping",
    purpose: "Locks who the research is for.",
    topicIds: ["audience", "needs"],
  },
  {
    id: "company_and_offer",
    label: "Company and offer",
    purpose: "Locks company-specific truth.",
    topicIds: ["company", "offering"],
  },
  {
    id: "focus_and_next",
    label: "Focus and next step",
    purpose: "Locks market and next step.",
    topicIds: ["geography", "access"],
  },
  {
    id: "trust_and_proof",
    label: "Trust and proof",
    purpose: "Locks what you can credibly own.",
    topicIds: ["differentiators", "expertise"],
  },
  {
    id: "limits_and_notes",
    label: "Off-limits",
    purpose: "Locks what research must never claim.",
    topicIds: ["boundaries"],
  },
];

export function getUnderstandingFields(
  understanding: CompanyUnderstanding,
): EditableField[] {
  const singles: Array<[string, string, ProfileTopicId, ClassifiedField]> = [
    ["likelyAudience", "Audience", "audience", understanding.likelyAudience],
    ["customerProblem", "Need", "needs", understanding.customerProblem],
    ["companyName", "Company name", "company", understanding.companyName],
    ["industry", "Category", "company", understanding.industry],
    ["offer", "Offer", "offering", understanding.offer],
    ["geography", "Market", "geography", understanding.geography],
    ["websiteAction", "Next step", "access", understanding.websiteAction],
  ];

  const list: EditableField[] = singles.map(([key, label, topicId, field]) => ({
    key,
    label,
    topicId,
    field,
    // Company name + Category are self-explanatory; skip redundant "Company identity" group.
    groupLabel: topicId === "company" ? undefined : TOPIC_GROUP_LABELS[topicId],
  }));

  understanding.differentiators.forEach((field, i) => {
    list.push({
      key: `differentiator_${i}`,
      label: `Differentiator ${i + 1}`,
      topicId: "differentiators",
      field,
      groupLabel: TOPIC_GROUP_LABELS.differentiators,
    });
  });
  understanding.expertiseSignals.forEach((field, i) => {
    list.push({
      key: `expertise_${i}`,
      label: `Trust signal ${i + 1}`,
      topicId: "expertise",
      field,
      groupLabel: TOPIC_GROUP_LABELS.expertise,
    });
  });
  understanding.claimsAndRestrictions.forEach((field, i) => {
    list.push({
      key: `claim_${i}`,
      label: `Off-limits ${i + 1}`,
      topicId: "boundaries",
      field,
      groupLabel: TOPIC_GROUP_LABELS.boundaries,
    });
  });

  return list;
}

export function fieldsForSection(
  fields: EditableField[],
  section: Pick<ProfileSection, "topicIds">,
): EditableField[] {
  const topicSet = new Set(section.topicIds);
  return fields.filter((f) => topicSet.has(f.topicId));
}

/** Always five confirmation sections; array field keys filled when present. */
export function getActiveProfileSections(
  fields: EditableField[],
): ProfileSection[] {
  return PROFILE_SECTIONS.map((section) => ({
    ...section,
    fieldKeys: fieldsForSection(fields, section).map((f) => f.key),
  }));
}

function fieldResolved(status: string | undefined): boolean {
  return status === "confirmed" || status === "corrected" || status === "rejected";
}

/**
 * A section is reviewed only after the owner clicks Looks right for that section
 * (`sectionConfirmed[id]`), and every field key in the section is resolved.
 * Empty array sections still require an explicit Looks right click.
 */
export function sectionIsReviewed(
  section: ProfileSection,
  decisions: Record<string, { status: string }>,
  sectionConfirmed: Record<string, boolean>,
): boolean {
  if (!sectionConfirmed[section.id]) return false;
  return section.fieldKeys.every((key) => fieldResolved(decisions[key]?.status));
}

export function sectionsReady(
  sections: ProfileSection[],
  decisions: Record<string, { status: string }>,
  sectionConfirmed: Record<string, boolean>,
): boolean {
  return sections.every((section) =>
    sectionIsReviewed(section, decisions, sectionConfirmed),
  );
}

export function buildConfirmedProfile(
  understanding: CompanyUnderstanding,
  decisions: Record<
    string,
    { status: "confirmed" | "corrected" | "rejected" | "unresolved"; value: string }
  >,
  ownerNotes = "",
): ConfirmedCompanyProfile {
  const fields: ConfirmedCompanyProfile["fields"] = {};
  for (const item of getUnderstandingFields(understanding)) {
    const decision = decisions[item.key] ?? {
      status: "unresolved" as const,
      value: item.field.value,
    };
    fields[item.key] = {
      value: decision.value,
      status: decision.status,
      originalClassification: item.field.classification,
      confidence: item.field.confidence,
      evidenceRefs: item.field.evidence.map((e) => e.ref),
    };
  }

  return {
    profileVersion: `profile_${Date.now().toString(36)}`,
    fields,
    ownerNotes: ownerNotes.trim(),
  };
}
