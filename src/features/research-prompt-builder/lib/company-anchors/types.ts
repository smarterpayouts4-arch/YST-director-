export const ANCHOR_BUCKETS = [
  "company",
  "industry",
  "audience",
  "geography",
  "offer",
  "differentiators",
  "customerMoment",
  "hypotheses",
] as const;

export type AnchorBucket = (typeof ANCHOR_BUCKETS)[number];

export type CompanyAnchors = Record<AnchorBucket, string[]>;

export function emptyCompanyAnchors(): CompanyAnchors {
  return {
    company: [],
    industry: [],
    audience: [],
    geography: [],
    offer: [],
    differentiators: [],
    customerMoment: [],
    hypotheses: [],
  };
}
