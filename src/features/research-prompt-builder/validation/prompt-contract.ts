/**
 * Semantic + structural lint for the formatted research-prompt Markdown.
 * Used by the prompt compiler path and format-research-prompt.
 */

export type PromptContractLintResult = {
  ok: boolean;
  issues: string[];
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

export function lintPromptContract(markdown: string): PromptContractLintResult {
  const issues: string[] = [];

  for (const heading of REQUIRED_SECTIONS) {
    if (!markdown.includes(heading)) {
      issues.push(`Missing required section: ${heading}`);
    }
  }

  if (!/^#\s+\S+/m.test(markdown)) {
    issues.push("Missing top-level title heading.");
  }

  if (!/disconfirm|contradict|challenge|red-?team/i.test(markdown)) {
    issues.push("Missing disconfirming-evidence / red-team requirement.");
  }

  if (!/competitor/i.test(markdown)) {
    issues.push("Missing competitor classification guidance.");
  }

  if (
    !/(direct|adjacent|aspirational).{0,40}competitor|competitor.{0,40}(direct|adjacent|aspirational)/i.test(
      markdown,
    ) &&
    !/classif(?:y|ication).{0,60}competitor/i.test(markdown)
  ) {
    issues.push("Competitor guidance should ask for classification (e.g. direct/adjacent/aspirational).");
  }

  if (!/3 content pillars|three content pillars|3 pillars/i.test(markdown)) {
    issues.push("Missing three content pillars requirement.");
  }

  if (
    !/(2 experiments|two experiments|6 experiments|six experiments)/i.test(markdown) &&
    !/pillars?.{0,40}experiments?/i.test(markdown)
  ) {
    issues.push("Missing experiments requirement (3 pillars × 2 experiments / 6 experiments).");
  }

  if (!/primary platform|one primary platform|1 platform/i.test(markdown)) {
    issues.push("Missing primary platform requirement.");
  }

  if (!/\bCTA\b|call to action|call-to-action/i.test(markdown)) {
    issues.push("Missing CTA hypothesis requirement.");
  }

  if (!/success.{0,20}failure|failure.{0,20}success|success\/failure|stop criteria/i.test(markdown)) {
    issues.push("Missing success/failure criteria.");
  }

  if (
    !/observed fact|owner[- ]confirmed|working hypothes|research question|restriction/i.test(
      markdown,
    )
  ) {
    issues.push(
      "Missing fact vs hypothesis vs restriction labeling guidance.",
    );
  }

  if (!/audience|customer moment|viewer (?:value|reward)/i.test(markdown)) {
    issues.push("Missing audience-first / customer-moment framing.");
  }

  if (
    !/return the completed research output only|do not propose additional workflows|stop after/i.test(
      markdown,
    )
  ) {
    issues.push(
      'Missing explicit stop line (e.g. "return the completed research output only; do not propose additional workflows").',
    );
  }

  if (/seven[- ]scene|scroll[- ]retention|script looping|shot list/i.test(markdown)) {
    issues.push("Prompt must not include video production instructions.");
  }

  return { ok: issues.length === 0, issues };
}

/** Adapter matching the previous validateFormattedPrompt signature. */
export function validatePromptContract(markdown: string): string[] {
  return lintPromptContract(markdown).issues;
}
