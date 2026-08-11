import type { ConfirmedCompanyProfile } from "@/features/research-prompt-builder/schemas";
import { defaultBriefFieldProvenance } from "@/features/research-prompt-builder/lib/brief-provenance";
import {
  buildCompanyAnchors,
  type CompanyAnchors,
} from "@/features/research-prompt-builder/lib/company-anchors";
import { makeConfirmedProfile } from "../fixtures/api/confirmed-profile";
import { makeResearchBrief } from "../fixtures/api/research-brief";
import { makeFinalPrompt } from "../fixtures/api/final-prompt";

export type Archetype = {
  id: string;
  profile: ConfirmedCompanyProfile;
  briefExtras: {
    companyTruth: string;
    customerMoment: string;
    contentHypothesis: string;
    challengeHypothesis: string;
  };
  promptExtras: {
    companyContext: string;
    evidence: string;
    report: string;
  };
};

const field = (
  value: string,
  status: "confirmed" | "corrected" = "confirmed",
): ConfirmedCompanyProfile["fields"][string] => ({
  value,
  status,
  originalClassification: "observed_fact",
  confidence: "high",
  evidenceRefs: ["row:1"],
});

function archetype(
  id: string,
  fields: ConfirmedCompanyProfile["fields"],
  briefExtras: Archetype["briefExtras"],
  promptExtras: Archetype["promptExtras"],
): Archetype {
  return {
    id,
    profile: {
      profileVersion: `profile-${id}`,
      ownerNotes: "",
      fields,
    },
    briefExtras,
    promptExtras,
  };
}

export const ANCHOR_TEST_ARCHETYPES: Archetype[] = [
  archetype(
    "supplement",
    makeConfirmedProfile().fields,
    {
      companyTruth: makeResearchBrief().companyTruth,
      customerMoment: makeResearchBrief().customerMoment,
      contentHypothesis: makeResearchBrief().contentHypothesis,
      challengeHypothesis: makeResearchBrief().challengeHypothesis,
    },
    {
      companyContext: makeFinalPrompt().companyContext,
      evidence: makeFinalPrompt().evidenceAndRedTeamRequirements,
      report: makeFinalPrompt().requiredReportStructure,
    },
  ),
  archetype(
    "restaurant",
    {
      companyName: field("Harbor Table"),
      industry: field("neighborhood restaurant and seasonal seafood dining"),
      offer: field("Seasonal seafood tasting menus and harbor-view reservations"),
      geography: field("Portland waterfront dining district"),
      likelyAudience: field(
        "Local diners seeking reservation-worthy seafood nights out",
      ),
      differentiator_0: field("Harbor-view tasting menus with catch-of-the-day storytelling"),
    },
    {
      companyTruth:
        "Harbor Table is a Portland waterfront restaurant known for seasonal seafood tasting menus.",
      customerMoment:
        "A local diner is choosing where to book a reservation-worthy seafood night out.",
      contentHypothesis:
        "Catch-of-the-day storytelling will outperform generic fine-dining ambiance posts.",
      challengeHypothesis:
        "Diners may prefer national seafood chains with easier reservations.",
    },
    {
      companyContext:
        "Harbor Table serves Portland waterfront diners with seasonal seafood tasting menus and harbor-view reservations.",
      evidence: [
        "Hypothesis-blind discovery: before evaluating the supplied hypotheses, run a neutral scan of neighborhood restaurant and seasonal seafood dining demand among local diners seeking reservation-worthy seafood nights, Portland waterfront dining patterns, competitor positioning, and recurring reservation decision problems. Do not give supplied hypotheses preferential treatment.",
        "Quotation discipline for local diners at the reservation-worthy seafood moment: present language as a direct customer quote only when the exact words are present in a cited source; otherwise label it as a paraphrased language pattern. Never manufacture representative customer quotations.",
        "Evidence hierarchy for neighborhood restaurant and seasonal seafood dining offers: do not allow many weak commercial sources to outweigh one strong primary or authoritative source. Evidence quantity is not evidence quality. When sources disagree, explain the disagreement rather than averaging them.",
        "Demand triangulation for Harbor Table seafood tasting menus: treat demand as multi-signal evidence. Look for convergence among search behavior, recurring questions, marketplace behavior, survey/research evidence, competitor investment, community discussion, and commercial intent. A content gap alone is not demand. Search volume alone is not business opportunity.",
        "Seek disconfirming evidence. Classify competitors into direct, adjacent, aspirational, and substitute classes. Cite sources. Require demand evidence and a pursue/reject/modify verdict per selected hypothesis.",
      ].join(" "),
      report: [
        "For every major conclusion about catch of the day storytelling, seasonal seafood tasting menus, or the reservation worthy seafood moment for local diners, assign High / Medium / Low confidence and state what additional evidence would most likely change the conclusion.",
        "Report up to 3–5 material surprising findings that contradict, complicate, or substantially expand the supplied assumptions about national seafood chains, fine dining ambiance, and storytelling will outperform claims (name each supplied assumption id). Do not manufacture surprising findings to satisfy a quota. If fewer than three are genuinely supported, report fewer and explain why.",
        "Deliver 3 content pillars with 2 experiments per pillar. Each experiment must establish an audience moment, a tension or planted question, a viewer reward for what the audience gains, evidence-backed research support or confidence, success criteria, and failure criteria. Also require one primary platform, one CTA hypothesis, customer language, category conventions, and content gaps versus business opportunities.",
      ].join(" "),
    },
  ),
  archetype(
    "contractor",
    {
      companyName: field("ClearFlow Plumbing"),
      industry: field("emergency plumbing and drain repair contractor"),
      offer: field("24/7 emergency plumbing, drain clearing, and water-heater installs"),
      geography: field("Austin metro service area inside the outer loop"),
      likelyAudience: field(
        "Homeowners facing sudden drain backups who need same-day trusted repairs",
      ),
      differentiator_0: field("Same-day flat-rate drain clearing with photo proof of work"),
    },
    {
      companyTruth:
        "ClearFlow Plumbing is an Austin emergency plumbing contractor focused on drain repair and water heaters.",
      customerMoment:
        "A homeowner hits a sudden drain backup and needs a same-day trusted repairer.",
      contentHypothesis:
        "Same-day flat-rate drain clearing education will beat generic home-maintenance tips.",
      challengeHypothesis:
        "Homeowners may default to national franchise plumbers despite higher price.",
    },
    {
      companyContext:
        "ClearFlow Plumbing serves Austin metro homeowners with emergency plumbing and drain repair.",
      evidence: [
        "Hypothesis-blind discovery: before evaluating the supplied hypotheses, run a neutral scan of emergency plumbing and drain repair contractor demand among homeowners facing sudden drain backups, Austin metro service-area patterns, competitor positioning, and recurring same-day repair decision problems. Do not give supplied hypotheses preferential treatment.",
        "Quotation discipline for homeowners facing sudden drain backups: present language as a direct customer quote only when the exact words are present in a cited source; otherwise label it as a paraphrased language pattern. Never manufacture representative customer quotations.",
        "Evidence hierarchy for emergency plumbing and water-heater installs: do not allow many weak commercial sources to outweigh one strong primary or authoritative source. Evidence quantity is not evidence quality. When sources disagree, explain the disagreement rather than averaging them.",
        "Demand triangulation for ClearFlow same-day flat-rate drain clearing: treat demand as multi-signal evidence. Look for convergence among search behavior, recurring questions, marketplace behavior, survey/research evidence, competitor investment, community discussion, and commercial intent. A content gap alone is not demand. Search volume alone is not business opportunity.",
        "Seek disconfirming evidence. Classify competitors into direct, adjacent, aspirational, and substitute classes. Cite sources. Require demand evidence and a pursue/reject/modify verdict per selected hypothesis.",
      ].join(" "),
      report: [
        "For every major conclusion about same day flat rate drain clearing, water heater installs, or sudden drain backups for Austin metro homeowners, assign High / Medium / Low confidence and state what additional evidence would most likely change the conclusion.",
        "Report up to 3–5 material surprising findings that contradict, complicate, or substantially expand the supplied assumptions about same day flat rate drain clearing and emergency plumbing (name each supplied assumption id). Do not manufacture surprising findings to satisfy a quota. If fewer than three are genuinely supported, report fewer and explain why.",
        "Deliver 3 content pillars with 2 experiments per pillar. Each experiment must establish an audience moment, a tension or planted question, a viewer reward for what the audience gains, evidence-backed research support or confidence, success criteria, and failure criteria. Also require one primary platform, one CTA hypothesis, customer language, category conventions, and content gaps versus business opportunities.",
      ].join(" "),
    },
  ),
  archetype(
    "professional-service",
    {
      companyName: field("Clearpath Bookkeeping"),
      industry: field("bookkeeping and cash-flow reporting for owner-operated firms"),
      offer: field("Monthly bookkeeping cleanup with plain-English cash flow reporting"),
      geography: field("United States remote-first service for distributed clients"),
      likelyAudience: field(
        "Owner-operated firms drowning in receipts before a profitable month close",
      ),
      differentiator_0: field("Plain-English monthly brief instead of ledger dumps"),
    },
    {
      companyTruth:
        "Clearpath Bookkeeping helps owner-operated firms with monthly cleanup and cash-flow reporting.",
      customerMoment:
        "An owner drowns in receipts and needs a clear profitable-month close without ledger dumps.",
      contentHypothesis:
        "Plain-English monthly briefs will outperform generic small-business finance tips.",
      challengeHypothesis:
        "Owners may stick with DIY spreadsheets despite recurring close stress.",
    },
    {
      companyContext:
        "Clearpath Bookkeeping serves owner-operated firms with monthly bookkeeping cleanup and cash-flow reporting.",
      evidence: [
        "Hypothesis-blind discovery: before evaluating the supplied hypotheses, run a neutral scan of bookkeeping and cash-flow reporting demand among owner-operated firms drowning in receipts, remote-first service patterns, competitor positioning, and recurring month-close decision problems. Do not give supplied hypotheses preferential treatment.",
        "Quotation discipline for owner-operated firms at the profitable-month close moment: present language as a direct customer quote only when the exact words are present in a cited source; otherwise label it as a paraphrased language pattern. Never manufacture representative customer quotations.",
        "Evidence hierarchy for bookkeeping cleanup and cash-flow reporting offers: do not allow many weak commercial sources to outweigh one strong primary or authoritative source. Evidence quantity is not evidence quality. When sources disagree, explain the disagreement rather than averaging them.",
        "Demand triangulation for plain-English monthly briefs: treat demand as multi-signal evidence. Look for convergence among search behavior, recurring questions, marketplace behavior, survey/research evidence, competitor investment, community discussion, and commercial intent. A content gap alone is not demand. Search volume alone is not business opportunity.",
        "Seek disconfirming evidence. Classify competitors into direct, adjacent, aspirational, and substitute classes. Cite sources. Require demand evidence and a pursue/reject/modify verdict per selected hypothesis.",
      ].join(" "),
      report: [
        "For every major conclusion about plain english monthly briefs, cash flow reporting, or drowning in receipts at month close, assign High / Medium / Low confidence and state what additional evidence would most likely change the conclusion.",
        "Report up to 3–5 material surprising findings that contradict, complicate, or substantially expand the supplied assumptions about DIY spreadsheets and plain english monthly briefs (name each supplied assumption id). Do not manufacture surprising findings to satisfy a quota. If fewer than three are genuinely supported, report fewer and explain why.",
        "Deliver 3 content pillars with 2 experiments per pillar. Each experiment must establish an audience moment, a tension or planted question, a viewer reward for what the audience gains, evidence-backed research support or confidence, success criteria, and failure criteria. Also require one primary platform, one CTA hypothesis, customer language, category conventions, and content gaps versus business opportunities.",
      ].join(" "),
    },
  ),
  archetype(
    "ecommerce",
    {
      companyName: field("Parcel & Pine"),
      industry: field("e-commerce home goods and outdoor furniture"),
      offer: field("Durable outdoor furniture with weather-test ratings"),
      geography: field("United States online shipping for patios and small yards"),
      likelyAudience: field(
        "Homeowners comparing patio furniture durability before a purchase",
      ),
      differentiator_0: field("Weather-test ratings with return photos of real wear"),
    },
    {
      companyTruth:
        "Parcel & Pine sells durable outdoor furniture with weather-test ratings for patios.",
      customerMoment:
        "A homeowner compares patio furniture durability and shipping risk before buying.",
      contentHypothesis:
        "Weather-test ratings will outperform lifestyle photos alone for purchase confidence.",
      challengeHypothesis:
        "Shoppers may choose big-box patio sets on price despite durability risk.",
    },
    {
      companyContext:
        "Parcel & Pine sells outdoor furniture with weather-test ratings for patio shoppers.",
      evidence: [
        "Hypothesis-blind discovery: before evaluating the supplied hypotheses, run a neutral scan of e-commerce home goods and outdoor furniture demand among homeowners comparing patio furniture durability, online shipping patterns for patios and small yards, competitor positioning, and recurring durability decision problems. Do not give supplied hypotheses preferential treatment.",
        "Quotation discipline for homeowners at the patio furniture durability moment: present language as a direct customer quote only when the exact words are present in a cited source; otherwise label it as a paraphrased language pattern. Never manufacture representative customer quotations.",
        "Evidence hierarchy for outdoor furniture and weather-test ratings: do not allow many weak commercial sources to outweigh one strong primary or authoritative source. Evidence quantity is not evidence quality. When sources disagree, explain the disagreement rather than averaging them.",
        "Demand triangulation for weather-test ratings versus lifestyle photos: treat demand as multi-signal evidence. Look for convergence among search behavior, recurring questions, marketplace behavior, survey/research evidence, competitor investment, community discussion, and commercial intent. A content gap alone is not demand. Search volume alone is not business opportunity.",
        "Seek disconfirming evidence. Classify competitors into direct, adjacent, aspirational, and substitute classes. Cite sources. Require demand evidence and a pursue/reject/modify verdict per selected hypothesis.",
      ].join(" "),
      report: [
        "For every major conclusion about weather test ratings, patio furniture durability, or lifestyle photos alone, assign High / Medium / Low confidence and state what additional evidence would most likely change the conclusion.",
        "Report up to 3–5 material surprising findings that contradict, complicate, or substantially expand the supplied assumptions about big-box patio sets and weather test ratings (name each supplied assumption id). Do not manufacture surprising findings to satisfy a quota. If fewer than three are genuinely supported, report fewer and explain why.",
        "Deliver 3 content pillars with 2 experiments per pillar. Each experiment must establish an audience moment, a tension or planted question, a viewer reward for what the audience gains, evidence-backed research support or confidence, success criteria, and failure criteria. Also require one primary platform, one CTA hypothesis, customer language, category conventions, and content gaps versus business opportunities.",
      ].join(" "),
    },
  ),
  archetype(
    "b2b-software",
    {
      companyName: field("LedgerMesh"),
      industry: field("B2B SaaS for multi-entity ledger reconciliation"),
      offer: field("Automated variance explanations tied to source transactions"),
      geography: field("United States and Canada SaaS buyers"),
      likelyAudience: field(
        "Controllers and FP&A leads chasing unexplained variances across entities",
      ),
      differentiator_0: field("Automated variance explanations linked to source transactions"),
    },
    {
      companyTruth:
        "LedgerMesh helps controllers reconcile multi-entity books with automated variance explanations.",
      customerMoment:
        "A controller faces unexplained variances across entities at month end.",
      contentHypothesis:
        "Variance-explanation education will outperform generic close-checklist content.",
      challengeHypothesis:
        "Finance teams may stay on spreadsheets despite multi-entity complexity.",
    },
    {
      companyContext:
        "LedgerMesh serves controllers with multi-entity ledger reconciliation and variance explanations.",
      evidence: [
        "Hypothesis-blind discovery: before evaluating the supplied hypotheses, run a neutral scan of B2B SaaS multi-entity ledger reconciliation demand among controllers and FP&A leads, United States and Canada SaaS buyer patterns, competitor positioning, and recurring month-end variance decision problems. Do not give supplied hypotheses preferential treatment.",
        "Quotation discipline for controllers at the unexplained variances across entities moment: present language as a direct customer quote only when the exact words are present in a cited source; otherwise label it as a paraphrased language pattern. Never manufacture representative customer quotations.",
        "Evidence hierarchy for B2B SaaS ledger reconciliation and automated variance explanations: do not allow many weak commercial sources to outweigh one strong primary or authoritative source. Evidence quantity is not evidence quality. When sources disagree, explain the disagreement rather than averaging them.",
        "Demand triangulation for variance-explanation education: treat demand as multi-signal evidence. Look for convergence among search behavior, recurring questions, marketplace behavior, survey/research evidence, competitor investment, community discussion, and commercial intent. A content gap alone is not demand. Search volume alone is not business opportunity.",
        "Seek disconfirming evidence. Classify competitors into direct, adjacent, aspirational, and substitute classes. Cite sources. Require demand evidence and a pursue/reject/modify verdict per selected hypothesis.",
      ].join(" "),
      report: [
        "For every major conclusion about variance explanation education, multi entity ledger reconciliation, or unexplained variances across entities, assign High / Medium / Low confidence and state what additional evidence would most likely change the conclusion.",
        "Report up to 3–5 material surprising findings that contradict, complicate, or substantially expand the supplied assumptions about spreadsheets and variance explanation education (name each supplied assumption id). Do not manufacture surprising findings to satisfy a quota. If fewer than three are genuinely supported, report fewer and explain why.",
        "Deliver 3 content pillars with 2 experiments per pillar. Each experiment must establish an audience moment, a tension or planted question, a viewer reward for what the audience gains, evidence-backed research support or confidence, success criteria, and failure criteria. Also require one primary platform, one CTA hypothesis, customer language, category conventions, and content gaps versus business opportunities.",
      ].join(" "),
    },
  ),
];

export function buildArchetypeAnchors(arch: Archetype): CompanyAnchors {
  const brief = makeResearchBrief({
    companyTruth: arch.briefExtras.companyTruth,
    customerMoment: arch.briefExtras.customerMoment,
    contentHypothesis: arch.briefExtras.contentHypothesis,
    challengeHypothesis: arch.briefExtras.challengeHypothesis,
    fieldProvenance: defaultBriefFieldProvenance({
      contentHypothesis: {
        origin: "owner_selected_hypothesis",
        sourceRefs: ["sg-1"],
      },
      challengeHypothesis: {
        origin: "model_hypothesis",
        sourceRefs: [],
      },
    }),
  });
  return buildCompanyAnchors(arch.profile, brief);
}

export function buildArchetypePrompt(arch: Archetype) {
  return makeFinalPrompt({
    title: `${arch.profile.fields.companyName?.value} Research Prompt`,
    companyContext: arch.promptExtras.companyContext,
    evidenceAndRedTeamRequirements: arch.promptExtras.evidence,
    requiredReportStructure: arch.promptExtras.report,
  });
}
