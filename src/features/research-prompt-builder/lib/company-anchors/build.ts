import { pushBucket } from "@/features/research-prompt-builder/lib/company-anchors/extract";
import {
  emptyCompanyAnchors,
  type CompanyAnchors,
} from "@/features/research-prompt-builder/lib/company-anchors/types";
import type {
  ConfirmedCompanyProfile,
  ResearchBrief,
} from "@/features/research-prompt-builder/schemas";

/**
 * Derive bucketed distinctive anchors from the confirmed profile and research brief.
 * Rejected fields are ignored. Generic business language is filtered out.
 */
export function buildCompanyAnchors(
  profile: ConfirmedCompanyProfile,
  brief?: ResearchBrief | null,
): CompanyAnchors {
  const anchors = emptyCompanyAnchors();

  for (const [key, field] of Object.entries(profile.fields)) {
    if (field.status === "rejected") continue;
    const value = field.value?.trim();
    if (!value) continue;

    if (key === "companyName") {
      pushBucket(anchors, "company", value, { allowFullValue: true });
    } else if (key === "industry") {
      pushBucket(anchors, "industry", value, { allowFullValue: true });
    } else if (key === "likelyAudience") {
      pushBucket(anchors, "audience", value);
    } else if (key === "geography") {
      pushBucket(anchors, "geography", value);
    } else if (key === "offer") {
      pushBucket(anchors, "offer", value);
    } else if (key.startsWith("differentiator_")) {
      pushBucket(anchors, "differentiators", value);
    }
  }

  if (brief) {
    pushBucket(anchors, "customerMoment", brief.customerMoment);
    pushBucket(anchors, "hypotheses", brief.contentHypothesis);
    pushBucket(anchors, "hypotheses", brief.challengeHypothesis);
    // Offer cues from companyTruth without swallowing the whole sentence.
    pushBucket(anchors, "offer", brief.companyTruth);
  }

  return anchors;
}
