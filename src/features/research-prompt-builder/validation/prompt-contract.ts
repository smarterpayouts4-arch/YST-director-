/**
 * Semantic + structural lint for the formatted research-prompt Markdown.
 * Rules live in prompt-contract-rules.ts (single source of truth).
 */

import {
  ANCHOR_BUCKETS,
  anchorPhraseMatches,
  type AnchorBucket,
  type CompanyAnchors,
} from "@/features/research-prompt-builder/lib/company-anchors";
import {
  PROMPT_CONTRACT_RULES,
  ruleMatches,
  type PromptContractRule,
} from "@/features/research-prompt-builder/validation/prompt-contract-rules";

export type AnchorCoverage = {
  ruleId: string;
  requestedBuckets: number;
  availableBuckets: number;
  effectiveBuckets: number;
  matchedTokens: string[];
  matchedBuckets: AnchorBucket[];
  degraded: boolean;
  satisfied: boolean;
};

export type PromptContractLintResult = {
  ok: boolean;
  issues: string[];
  anchorCoverage: AnchorCoverage[];
  sectionCharCounts: Record<string, number>;
};

export type LintPromptContractOptions = {
  anchors?: CompanyAnchors;
};

const REQUIRED_SECTIONS = [
  "## 1. ROLE AND EXPERTISE",
  "## 2. COMPANY CONTEXT",
  "## 3. OWNER-CONFIRMED DECISIONS",
  "## 4. WORKING HYPOTHESES",
  "## 5. RESEARCH QUESTIONS",
  "## 6. EVIDENCE AND RED-TEAM REQUIREMENTS",
  "## 7. REQUIRED REPORT STRUCTURE",
  "## 8. QUALITY CHECK BEFORE SUBMISSION",
] as const;

/** Calibration telemetry only — never shown to the model. */
export const SECTION_CHAR_BANDS = {
  evidenceAndRedTeamRequirements: { min: 4500, max: 6500 },
  requiredReportStructure: { min: 6000, max: 8500 },
} as const;

function splitParagraphs(markdown: string): string[] {
  return markdown
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function findMatchingParagraphs(markdown: string, rule: PromptContractRule): string[] {
  return splitParagraphs(markdown).filter((paragraph) => ruleMatches(rule, paragraph));
}

function tokenWeight(token: string): number {
  return token.includes(" ") ? 2 : 1;
}

function evaluateAnchorCoverage(
  rule: PromptContractRule,
  matchingParagraphs: string[],
  anchors: CompanyAnchors,
): AnchorCoverage {
  const policy = rule.anchorPolicy ?? {};
  const requiredBuckets = policy.requiredBuckets ?? [...ANCHOR_BUCKETS];
  const requestedBuckets = policy.minDistinctBuckets ?? 1;
  const requestedTokens = policy.minDistinctTokens ?? 1;

  const availableBucketList = requiredBuckets.filter(
    (bucket) => (anchors[bucket] ?? []).length > 0,
  );
  const availableBuckets = availableBucketList.length;
  const effectiveBuckets = Math.min(requestedBuckets, availableBuckets);
  const effectiveTokens = Math.min(
    requestedTokens,
    availableBucketList.reduce((sum, b) => sum + anchors[b].length, 0),
  );
  const degraded = availableBuckets < requestedBuckets;

  // No distinctive anchors available for this policy: phrase match alone is enough,
  // but the personalization proof is degraded (thin source material).
  if (availableBuckets === 0) {
    return {
      ruleId: rule.id,
      requestedBuckets,
      availableBuckets: 0,
      effectiveBuckets: 0,
      matchedTokens: [],
      matchedBuckets: [],
      degraded: true,
      satisfied: true,
    };
  }

  const searchText = matchingParagraphs.join("\n\n");
  const matchedBuckets: AnchorBucket[] = [];
  const matchedTokens: string[] = [];
  let tokenScore = 0;

  for (const bucket of availableBucketList) {
    const hits = (anchors[bucket] ?? []).filter((token) =>
      anchorPhraseMatches(searchText, token),
    );
    if (hits.length === 0) continue;
    matchedBuckets.push(bucket);
    for (const hit of hits) {
      if (!matchedTokens.includes(hit)) {
        matchedTokens.push(hit);
        tokenScore += tokenWeight(hit);
      }
    }
  }

  const satisfied =
    matchedBuckets.length >= effectiveBuckets && tokenScore >= effectiveTokens;

  return {
    ruleId: rule.id,
    requestedBuckets,
    availableBuckets,
    effectiveBuckets,
    matchedTokens,
    matchedBuckets,
    degraded,
    satisfied,
  };
}

const SECTION_HEADING: Record<
  Exclude<PromptContractRule["section"], "global">,
  (typeof REQUIRED_SECTIONS)[number]
> = {
  evidenceAndRedTeamRequirements: "## 6. EVIDENCE AND RED-TEAM REQUIREMENTS",
  requiredReportStructure: "## 7. REQUIRED REPORT STRUCTURE",
};

export function extractSectionBody(
  markdown: string,
  heading: (typeof REQUIRED_SECTIONS)[number],
): string {
  const start = markdown.indexOf(heading);
  if (start < 0) return "";
  const bodyStart = start + heading.length;
  const headingIndex = REQUIRED_SECTIONS.indexOf(heading);
  const nextHeading =
    headingIndex >= 0 ? REQUIRED_SECTIONS[headingIndex + 1] : undefined;
  const end = nextHeading ? markdown.indexOf(nextHeading, bodyStart) : markdown.length;
  return markdown.slice(bodyStart, end < 0 ? markdown.length : end).trim();
}

export function measureSectionCharCounts(markdown: string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const heading of REQUIRED_SECTIONS) {
    counts[heading] = extractSectionBody(markdown, heading).length;
  }
  return counts;
}

function textForRule(rule: PromptContractRule, markdown: string): string {
  if (rule.section === "global") return markdown;
  return extractSectionBody(markdown, SECTION_HEADING[rule.section]);
}

export function lintPromptContract(
  markdown: string,
  options: LintPromptContractOptions = {},
): PromptContractLintResult {
  const issues: string[] = [];
  const anchorCoverage: AnchorCoverage[] = [];

  for (const heading of REQUIRED_SECTIONS) {
    if (!markdown.includes(heading)) {
      issues.push(`Missing required section: ${heading}`);
    }
  }

  if (!/^#\s+\S+/m.test(markdown)) {
    issues.push("Missing top-level title heading.");
  }

  for (const rule of PROMPT_CONTRACT_RULES) {
    const scopeText = textForRule(rule, markdown);
    const matched = ruleMatches(rule, scopeText);

    if (rule.negative) {
      // Negative bans still scan the whole prompt (scripts can appear anywhere).
      if (ruleMatches(rule, markdown)) issues.push(rule.issue);
      continue;
    }

    if (!matched) {
      issues.push(rule.issue);
      continue;
    }

    if (rule.anchored && options.anchors) {
      const paragraphs = findMatchingParagraphs(scopeText, rule);
      const coverage = evaluateAnchorCoverage(
        rule,
        paragraphs.length ? paragraphs : [scopeText],
        options.anchors,
      );
      anchorCoverage.push(coverage);
      if (!coverage.satisfied) {
        issues.push(
          `${rule.issue} (anchor coverage insufficient: need ${coverage.effectiveBuckets} bucket(s) and distinctive company tokens in the same paragraph; matched ${coverage.matchedBuckets.length} bucket(s)` +
            (coverage.degraded ? "; degraded thin-CSV anchors" : "") +
            ").",
        );
      }
    }
  }

  return {
    ok: issues.length === 0,
    issues,
    anchorCoverage,
    sectionCharCounts: measureSectionCharCounts(markdown),
  };
}

/** Adapter matching the previous validateFormattedPrompt signature. */
export function validatePromptContract(markdown: string): string[] {
  return lintPromptContract(markdown).issues;
}
