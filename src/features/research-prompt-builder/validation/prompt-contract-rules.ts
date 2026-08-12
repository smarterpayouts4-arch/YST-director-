import {
  formatAnchorHintClause,
  selectAnchorHints,
  type AnchorBucket,
  type CompanyAnchors,
} from "@/features/research-prompt-builder/lib/company-anchors";

export type PromptContractSection =
  | "evidenceAndRedTeamRequirements"
  | "requiredReportStructure"
  | "global";

export type PromptContractRule = {
  id: string;
  section: PromptContractSection;
  /** Rendered into the compiler must-include checklist. */
  requirement: string;
  /** Rendered into the repair prompt when this rule fails. */
  repairHint: string;
  /** Issue text when the matcher fails. */
  issue: string;
  matcher: {
    phrases?: string[];
    /** Single pattern (AND with other matcher groups when present). */
    pattern?: RegExp;
    /** Every pattern must match (AND). */
    allPatterns?: RegExp[];
    /** At least one pattern must match (OR). */
    anyPatterns?: RegExp[];
  };
  /** Negative rules fail when the matcher hits. */
  negative?: boolean;
  anchored?: boolean;
  anchorPolicy?: {
    requiredBuckets?: AnchorBucket[];
    minDistinctBuckets?: number;
    minDistinctTokens?: number;
  };
};

const SECTION_LABEL: Record<
  Exclude<PromptContractSection, "global">,
  string
> = {
  evidenceAndRedTeamRequirements: "evidenceAndRedTeamRequirements",
  requiredReportStructure: "requiredReportStructure",
};

function appendAnchorClause(
  base: string,
  rule: PromptContractRule,
  anchors?: CompanyAnchors,
): string {
  if (!rule.anchored || !anchors) return base;
  const hints = selectAnchorHints(rule.anchorPolicy, anchors);
  const clause = formatAnchorHintClause(rule.anchorPolicy, hints);
  if (!clause) return base;
  const section =
    rule.section === "global" ? "the relevant section" : SECTION_LABEL[rule.section];
  return `${base} In ${section}, ${clause.charAt(0).toLowerCase()}${clause.slice(1)}`;
}

/**
 * Single source of truth for export-contract requirements.
 * Consumers: compiler checklist, repair hints, deterministic lint.
 */
export const PROMPT_CONTRACT_RULES: PromptContractRule[] = [
  {
    id: "disconfirming_evidence",
    section: "evidenceAndRedTeamRequirements",
    requirement:
      "disconfirming evidence or red-team (and/or contradict / challenge / falsify) in evidenceAndRedTeamRequirements",
    repairHint:
      "Embed a disconfirming-evidence / red-team / falsify requirement in evidenceAndRedTeamRequirements.",
    issue: "Missing disconfirming-evidence / red-team requirement.",
    matcher: {
      pattern: /disconfirm|contradict|challenge|red-?team|falsif|disprove/i,
    },
  },
  {
    id: "competitor_mention",
    section: "evidenceAndRedTeamRequirements",
    requirement: "competitor research requirement",
    repairHint: "Mention competitor research explicitly.",
    issue: "Missing competitor classification guidance.",
    matcher: { pattern: /competitor/i },
  },
  {
    id: "competitor_classification",
    section: "evidenceAndRedTeamRequirements",
    requirement:
      "competitor plus classification using direct, adjacent, aspirational, and substitute",
    repairHint:
      "Ask for competitor classification (direct/adjacent/aspirational/substitute).",
    issue:
      "Competitor guidance should ask for classification (e.g. direct/adjacent/aspirational/substitute).",
    matcher: {
      pattern:
        /(direct|adjacent|aspirational|substitute).{0,80}competitor|competitor.{0,80}(direct|adjacent|aspirational|substitute)|classif(?:y|ication).{0,80}competitor/i,
    },
  },
  {
    id: "substitute_competitors",
    section: "evidenceAndRedTeamRequirements",
    requirement: "substitute / indirect competitor / alternative solution requirement",
    repairHint: "Require substitute or indirect competitors.",
    issue: "Missing substitute / indirect competitor requirement.",
    matcher: {
      pattern: /substitut|indirect competitor|alternative solution/i,
    },
  },
  {
    id: "customer_language",
    section: "global",
    requirement: "customer language (or exact phrases / how customers describe)",
    repairHint: "Require customer-language research (exact phrases or how customers describe).",
    issue: "Missing customer-language research requirement.",
    matcher: {
      pattern: /customer language|exact phrases|how customers (?:describe|talk|word)/i,
    },
  },
  {
    id: "category_conventions",
    section: "global",
    requirement: "category conventions (or category norms / how the category usually markets)",
    repairHint: "Require category-conventions research.",
    issue: "Missing category-conventions research requirement.",
    matcher: {
      pattern: /category convention|category norms|how the category/i,
    },
  },
  {
    id: "content_gaps_vs_opportunities",
    section: "global",
    requirement: "content gaps versus business opportunities (or gaps vs opportunities)",
    repairHint: "Require content gaps versus business opportunities.",
    issue: "Missing content gaps versus business opportunities requirement.",
    matcher: {
      pattern:
        /content gaps?.{0,40}(?:business )?opportunit|gaps?.{0,20}vs\.?.{0,20}opportunit|gaps versus/i,
    },
  },
  {
    id: "demand_evidence",
    section: "evidenceAndRedTeamRequirements",
    requirement: "demand evidence (or search demand / purchase intent evidence)",
    repairHint: "Require demand evidence / search demand / purchase intent.",
    issue: "Missing demand-evidence requirement.",
    matcher: {
      pattern: /demand evidence|search demand|purchase intent|demand signal/i,
    },
  },
  {
    id: "citations",
    section: "evidenceAndRedTeamRequirements",
    requirement: "cite sources / citations / source URLs for material claims",
    repairHint: "Require citations or named sources / source URLs.",
    issue: "Missing citation / source requirement.",
    matcher: {
      pattern: /cit(?:e|ation|ations)|source urls?|named sources/i,
    },
  },
  {
    id: "hypothesis_verdict",
    section: "evidenceAndRedTeamRequirements",
    requirement:
      "per selected strategic hypothesis: supporting evidence, disconfirming evidence, and pursue/reject/modify",
    repairHint: "Require a pursue/reject/modify verdict per hypothesis.",
    issue: "Missing per-hypothesis pursue/reject/modify verdict requirement.",
    matcher: {
      pattern:
        /pursue\/reject\/modify|pursue, reject, or modify|verdict per (?:hypothesis|direction)/i,
    },
  },
  {
    id: "three_pillars",
    section: "requiredReportStructure",
    requirement: "exact phrasing: 3 content pillars (or three content pillars)",
    repairHint: "Require 3 content pillars / three educational pillars.",
    issue: "Missing three content pillars requirement.",
    matcher: {
      pattern:
        /3 content pillars|three content pillars|3 pillars|three pillars|three educational pillars/i,
    },
  },
  {
    id: "experiments",
    section: "requiredReportStructure",
    requirement: "2 experiments / 6 experiments (3 pillars × 2)",
    repairHint: "Require 2 experiments per pillar or 6 experiments total.",
    issue: "Missing experiments requirement (3 pillars × 2 experiments / 6 experiments).",
    matcher: {
      pattern:
        /(2 experiments|two experiments|6 experiments|six experiments)|pillars?.{0,60}experiments?/i,
    },
  },
  {
    id: "audience_opportunity",
    section: "requiredReportStructure",
    requirement:
      "opportunity-first experiments: audience/decision/customer moment plus tension or planted/curiosity/audience question",
    repairHint:
      "Add the missing opportunity semantics (audience/decision/customer moment plus tension or planted/curiosity/audience question) to the experiment instructions in the existing required-report-structure / pillars-and-experiments guidance. Do not satisfy this rule by adding a new report section or fixed heading.",
    issue:
      "Missing audience-opportunity experiment semantics (audience/decision/customer moment plus tension or planted/curiosity question).",
    matcher: {
      allPatterns: [
        /audience moment|decision moment|customer moment/i,
      ],
      anyPatterns: [
        /\btension\b|\bfriction\b|\buncertainty\b|\bconfusion\b|unmet need/i,
        /planted question|audience question|curiosity question/i,
      ],
    },
  },
  {
    id: "viewer_value_provenance",
    section: "requiredReportStructure",
    requirement:
      "opportunity-first experiments: viewer/educational reward or what the audience gains, plus evidence support or confidence",
    repairHint:
      "Add the missing viewer-value and provenance semantics (viewer/educational reward or what the audience gains, plus evidence support or confidence) to the experiment instructions in the existing required-report-structure / pillars-and-experiments guidance. Do not satisfy this rule by adding a new report section or fixed heading.",
    issue:
      "Missing viewer-value/provenance experiment semantics (viewer/educational reward plus evidence support or confidence).",
    matcher: {
      allPatterns: [
        /viewer reward|educational reward|educational value|what the audience gains/i,
      ],
      anyPatterns: [
        /evidence basis|supporting evidence|evidence-backed|research support/i,
        /\bconfidence\b|high\s*\/\s*medium\s*\/\s*low/i,
      ],
    },
  },
  {
    id: "experiment_measurement",
    section: "requiredReportStructure",
    requirement:
      "opportunity-first experiments: success criteria and failure criteria (measurement validates; it does not define)",
    repairHint:
      "Add success criteria and failure criteria to the experiment instructions in the existing required-report-structure / pillars-and-experiments guidance. Do not satisfy this rule by adding a new report section or fixed heading.",
    issue: "Missing experiment measurement semantics (success criteria and failure criteria).",
    matcher: {
      allPatterns: [
        /success criteria|success\s*\/\s*failure|success and failure/i,
        /failure criteria|success\s*\/\s*failure|success and failure/i,
      ],
    },
  },
  {
    id: "primary_platform",
    section: "requiredReportStructure",
    requirement: "primary platform (or one primary platform)",
    repairHint: "Require one primary / recommended platform.",
    issue: "Missing primary platform requirement.",
    matcher: {
      pattern:
        /primary platform|one primary platform|1 platform|recommended platform|single platform/i,
    },
  },
  {
    id: "cta",
    section: "requiredReportStructure",
    requirement:
      "report-level CTA or call to action hypothesis (once; distinct from per-experiment commercial bridge; none/weak OK)",
    repairHint:
      "Require one report-level CTA hypothesis from the research (none/weak if unsupported). Do not add a second duplicative per-experiment CTA field.",
    issue: "Missing CTA hypothesis requirement.",
    matcher: { pattern: /\bCTA\b|call[- ]to[- ]action/i },
  },
  {
    id: "success_failure",
    section: "requiredReportStructure",
    requirement: "success/failure criteria (or success and failure criteria)",
    repairHint: "Require success/failure or stop criteria.",
    issue: "Missing success/failure criteria.",
    matcher: {
      pattern:
        /success.{0,40}failure|failure.{0,40}success|success\/failure|success and failure|stop criteria|success criteria[\s\S]{0,80}failure criteria|failure criteria[\s\S]{0,80}success criteria/i,
    },
  },
  {
    id: "provenance_labels",
    section: "global",
    requirement:
      "observed fact / owner-confirmed / working hypothesis / research question / restriction labeling",
    repairHint: "Require fact vs hypothesis vs restriction labeling guidance.",
    issue: "Missing fact vs hypothesis vs restriction labeling guidance.",
    matcher: {
      pattern: /observed fact|owner[- ]confirmed|working hypothes|research question|restriction/i,
    },
  },
  {
    id: "audience_framing",
    section: "global",
    requirement: "customer moment (or audience / viewer reward) framing",
    repairHint: "Require audience-first / customer-moment framing.",
    issue: "Missing audience-first / customer-moment framing.",
    matcher: {
      pattern: /audience|customer moment|viewer (?:value|reward)/i,
    },
  },
  {
    id: "stop_line",
    section: "global",
    requirement:
      "Formatted export must include: Return the completed research output only (formatter appends the hardened stop footer).",
    repairHint:
      'Include "Return the completed research output only" in qualityCheckBeforeSubmission; the formatter also appends the anti-meta stop footer.',
    issue:
      'Missing explicit stop line (e.g. "return the completed research output only").',
    matcher: {
      pattern:
        /return the completed research output only|do not propose additional workflows|do not offer alternative workflows|stop after|completed research output only/i,
    },
  },
  {
    id: "no_video_production",
    section: "global",
    requirement: "Do not include video production, scripts, shot lists, or scroll-retention instructions.",
    repairHint: "Remove video production / shot-list / scroll-retention instructions.",
    issue: "Prompt must not include video production instructions.",
    matcher: {
      pattern: /seven[- ]scene|scroll[- ]retention|script looping|shot list/i,
    },
    negative: true,
  },

  // --- Prompt Contract 1.1 anchored research controls ---
  {
    id: "hypothesis_blind_discovery",
    section: "evidenceAndRedTeamRequirements",
    requirement:
      "Hypothesis-blind discovery: before evaluating supplied hypotheses, perform a neutral scan of this company's industry, audience, and geography (customer language, search behavior, competitor positioning, and recurring decision problems). Do not give supplied hypotheses preferential treatment. Company-agnostic wording is not enough — name distinctive industry/audience/geography phrases in the same continuous paragraph.",
    repairHint:
      "In evidenceAndRedTeamRequirements, rewrite the hypothesis-blind / neutral discovery sentence so the same continuous paragraph names distinctive industry, audience, and geography phrases from the company packet before evaluating supplied hypotheses.",
    issue: "Missing hypothesis-blind / neutral discovery requirement.",
    matcher: {
      pattern:
        /hypothesis-?blind|neutral (?:discovery|scan)|before evaluating (?:the )?supplied hypothes/i,
    },
    anchored: true,
    anchorPolicy: {
      requiredBuckets: ["industry", "audience", "geography"],
      minDistinctBuckets: 2,
      minDistinctTokens: 2,
    },
  },
  {
    id: "quotation_discipline",
    section: "evidenceAndRedTeamRequirements",
    requirement:
      "Quotation discipline for this company's audience and customer moment: present language as a direct customer quote only when the exact words appear in a cited source; otherwise label it as a paraphrased language pattern. Never manufacture representative customer quotations. Embed distinctive audience/customer-moment phrases in the same continuous paragraph.",
    repairHint:
      "In evidenceAndRedTeamRequirements, keep quotation discipline (direct quote only from cited sources; otherwise paraphrased language pattern; never manufacture quotes) in one continuous paragraph that also embeds distinctive audience and customer-moment phrases.",
    issue: "Missing quotation-discipline / no-manufactured-quotes requirement.",
    matcher: {
      pattern:
        /paraphrased language pattern|never manufacture|direct (?:customer )?quote|exact words (?:are )?present in a cited source/i,
    },
    anchored: true,
    anchorPolicy: {
      requiredBuckets: ["audience", "customerMoment"],
      minDistinctBuckets: 1,
      minDistinctTokens: 2,
    },
  },
  {
    id: "evidence_hierarchy",
    section: "evidenceAndRedTeamRequirements",
    requirement:
      "Evidence hierarchy for this company's industry and offer: do not allow many weak commercial sources to outweigh one strong primary or authoritative source. Evidence quantity is not evidence quality. When sources disagree, explain the disagreement rather than averaging them. Embed distinctive industry/offer phrases in the same continuous paragraph.",
    repairHint:
      "In evidenceAndRedTeamRequirements, keep evidence hierarchy (quantity is not quality; weak commercial sources must not outweigh primary/authoritative sources; explain disagreements) in one continuous paragraph that also embeds distinctive industry and offer phrases.",
    issue: "Missing evidence-hierarchy / quantity-is-not-quality requirement.",
    matcher: {
      pattern:
        /quantity is not (?:evidence )?quality|weak commercial|primary (?:or )?authoritative|explain (?:the )?disagreement/i,
    },
    anchored: true,
    anchorPolicy: {
      requiredBuckets: ["industry", "offer"],
      minDistinctBuckets: 1,
      minDistinctTokens: 2,
    },
  },
  {
    id: "demand_triangulation",
    section: "evidenceAndRedTeamRequirements",
    requirement:
      "Demand triangulation for this company's audience, customer moment, industry, and offer: treat demand as multi-signal evidence. Look for convergence among search behavior, recurring questions, marketplace behavior, survey/research evidence, competitor investment, community discussion, and commercial intent. A content gap alone is not demand. Search volume alone is not business opportunity. Embed distinctive phrases from at least two of those buckets in the same continuous paragraph.",
    repairHint:
      "In evidenceAndRedTeamRequirements, keep multi-signal demand triangulation (not content-gap-alone / not search-volume-alone) in one continuous paragraph that also embeds distinctive audience, customer-moment, industry, and/or offer phrases from at least two buckets.",
    issue: "Missing multi-signal demand triangulation requirement.",
    matcher: {
      pattern:
        /multi-?signal|demand triangulation|convergence among|content gap alone is not demand|search volume alone/i,
    },
    anchored: true,
    anchorPolicy: {
      requiredBuckets: ["audience", "customerMoment", "industry", "offer"],
      minDistinctBuckets: 2,
      minDistinctTokens: 2,
    },
  },
  {
    id: "confidence_plus_falsifier",
    section: "requiredReportStructure",
    requirement:
      "For every major conclusion about this company's hypotheses and customer moment, assign High / Medium / Low confidence and state what additional evidence would most likely change the conclusion. Embed distinctive hypothesis and/or customer-moment phrases in the same continuous paragraph — company name alone is not enough.",
    repairHint:
      "In requiredReportStructure, keep High/Medium/Low confidence plus what evidence would change each major conclusion in one continuous paragraph that also embeds distinctive hypothesis and/or customer-moment phrases from the packet.",
    issue: "Missing confidence level / falsifier requirement for major conclusions.",
    matcher: {
      pattern:
        /high\s*\/\s*medium\s*\/\s*low|\bconfidence(?:\s+level)?\b|additional evidence would (?:most likely )?change/i,
    },
    anchored: true,
    anchorPolicy: {
      requiredBuckets: ["hypotheses", "customerMoment"],
      minDistinctBuckets: 1,
      minDistinctTokens: 2,
    },
  },
  {
    id: "surprising_findings",
    section: "requiredReportStructure",
    requirement:
      "Report up to 3–5 material surprising findings that contradict, complicate, or substantially expand the supplied assumptions. Do not manufacture surprising findings to satisfy a quota. If fewer than three are genuinely supported, report fewer and explain why. Each finding must name which supplied assumption id it affects (e.g. hypothesis:contentHypothesis) AND embed distinctive hypothesis phrasing from the packet in the same continuous paragraph — assumption ids alone are not enough.",
    repairHint:
      "In requiredReportStructure, rewrite surprising findings so the same continuous paragraph names supplied assumption ids and embeds distinctive hypothesis phrases from the packet (assumption ids alone never satisfy the export gate). Do not manufacture findings to hit a quota.",
    issue: "Missing surprising-findings / supplied-assumption reference requirement.",
    matcher: {
      pattern:
        /surprising findings|supplied assumption|contradict, complicate, or substantially expand|do not manufacture surprising/i,
    },
    anchored: true,
    anchorPolicy: {
      requiredBuckets: ["hypotheses"],
      minDistinctBuckets: 1,
      minDistinctTokens: 1,
    },
  },
];

export function renderCompilerChecklist(anchors?: CompanyAnchors): string[] {
  return PROMPT_CONTRACT_RULES.filter((rule) => !rule.negative).map(
    (rule) => `- ${appendAnchorClause(rule.requirement, rule, anchors)}`,
  );
}

export function renderRepairHints(
  failedRuleIds?: string[],
  anchors?: CompanyAnchors,
): string[] {
  const rules = failedRuleIds?.length
    ? PROMPT_CONTRACT_RULES.filter((rule) => failedRuleIds.includes(rule.id))
    : PROMPT_CONTRACT_RULES.filter((rule) => !rule.negative);
  return rules.map((rule) => appendAnchorClause(rule.repairHint, rule, anchors));
}

export const ANCHORED_RULE_IDS = PROMPT_CONTRACT_RULES.filter((r) => r.anchored).map(
  (r) => r.id,
);

export function ruleMatches(rule: PromptContractRule, text: string): boolean {
  const { phrases, pattern, allPatterns, anyPatterns } = rule.matcher;
  const checks: boolean[] = [];
  if (allPatterns?.length) {
    checks.push(allPatterns.every((re) => re.test(text)));
  }
  if (anyPatterns?.length) {
    checks.push(anyPatterns.some((re) => re.test(text)));
  }
  if (pattern) {
    checks.push(pattern.test(text));
  }
  if (phrases?.length) {
    checks.push(
      phrases.some(
        (phrase) => phrase.length > 0 && text.toLowerCase().includes(phrase.toLowerCase()),
      ),
    );
  }
  return checks.length > 0 && checks.every(Boolean);
}
