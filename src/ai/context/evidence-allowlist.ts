import type { ConfirmedCompanyProfile } from "@/features/research-prompt-builder/schemas";

/** Human labels for deterministic profile field keys used as evidence refs. */
const FIELD_LABELS: Record<string, string> = {
  likelyAudience: "Audience",
  customerProblem: "Need",
  companyName: "Company name",
  industry: "Category",
  offer: "Offer",
  geography: "Market",
  websiteAction: "Next step",
};

function labelForKey(key: string): string {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  const differentiator = key.match(/^differentiator_(\d+)$/);
  if (differentiator) return `Differentiator ${Number(differentiator[1]) + 1}`;
  const expertise = key.match(/^expertise_(\d+)$/);
  if (expertise) return `Trust signal ${Number(expertise[1]) + 1}`;
  const claim = key.match(/^claim_(\d+)$/);
  if (claim) return `Off-limits ${Number(claim[1]) + 1}`;
  return key;
}

export type EvidenceAllowlistEntry = {
  key: string;
  label: string;
  value: string;
};

/**
 * Legal evidenceRefs for strategic cards: non-rejected confirmed-profile field keys.
 * Matches the exclusion used by buildDecisionLedger.
 */
export function buildEvidenceAllowlist(
  profile: ConfirmedCompanyProfile,
): EvidenceAllowlistEntry[] {
  return Object.entries(profile.fields)
    .filter(([, field]) => field.status !== "rejected")
    .map(([key, field]) => ({
      key,
      label: labelForKey(key),
      value: field.value,
    }));
}

export function evidenceAllowlistKeySet(
  profile: ConfirmedCompanyProfile,
): Set<string> {
  return new Set(buildEvidenceAllowlist(profile).map((entry) => entry.key));
}

export function labelForEvidenceRef(
  key: string,
  allowlist: EvidenceAllowlistEntry[],
): string {
  return allowlist.find((entry) => entry.key === key)?.label ?? labelForKey(key);
}
