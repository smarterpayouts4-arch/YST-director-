import type {
  ClassifiedField,
  CompanyUnderstanding,
  ConfirmedCompanyProfile,
} from "@/features/research-prompt-builder/types";

export type EditableField = {
  key: string;
  label: string;
  field: ClassifiedField;
};

export function getUnderstandingFields(
  understanding: CompanyUnderstanding,
): EditableField[] {
  const singles: Array<[string, string, ClassifiedField]> = [
    ["companyName", "Company name", understanding.companyName],
    ["industry", "Industry / category", understanding.industry],
    ["offer", "What it sells or enables", understanding.offer],
    ["customerProblem", "Customer problem", understanding.customerProblem],
    ["likelyAudience", "Likely audience", understanding.likelyAudience],
    ["websiteAction", "Primary website action", understanding.websiteAction],
    ["geography", "Geography / operational boundary", understanding.geography],
  ];

  const list: EditableField[] = singles.map(([key, label, field]) => ({
    key,
    label,
    field,
  }));

  understanding.differentiators.forEach((field, i) => {
    list.push({ key: `differentiator_${i}`, label: `Differentiator ${i + 1}`, field });
  });
  understanding.claimsAndRestrictions.forEach((field, i) => {
    list.push({
      key: `claim_${i}`,
      label: `Claim / risk / restriction ${i + 1}`,
      field,
    });
  });

  return list;
}

export function buildConfirmedProfile(
  understanding: CompanyUnderstanding,
  decisions: Record<
    string,
    { status: "confirmed" | "corrected" | "rejected" | "unresolved"; value: string }
  >,
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
    ownerNotes: "",
  };
}

export function materialFieldsReady(
  decisions: Record<string, { status: string }>,
  keys: string[],
): boolean {
  return keys.every((key) => {
    const status = decisions[key]?.status;
    return status === "confirmed" || status === "corrected" || status === "rejected";
  });
}
