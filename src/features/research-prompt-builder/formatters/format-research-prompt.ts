import type { FinalResearchPrompt } from "@/features/research-prompt-builder/schemas";

export function formatResearchPrompt(prompt: FinalResearchPrompt): string {
  return [
    `# ${prompt.title}`,
    "",
    "## 1. ROLE AND EXPERTISE",
    prompt.roleAndExpertise,
    "",
    "## 2. COMPANY CONTEXT",
    prompt.companyContext,
    "",
    "## 3. OWNER-CONFIRMED DECISIONS",
    prompt.ownerConfirmedDecisions,
    "",
    "## 4. WORKING HYPOTHESES",
    prompt.workingHypotheses,
    "",
    "## 5. RESEARCH QUESTIONS",
    prompt.researchQuestions,
    "",
    "## 6. EVIDENCE AND RED-TEAM REQUIREMENTS",
    prompt.evidenceAndRedTeamRequirements,
    "",
    "## 7. REQUIRED REPORT STRUCTURE",
    prompt.requiredReportStructure,
    "",
    "## 8. QUALITY CHECK BEFORE SUBMISSION",
    prompt.qualityCheckBeforeSubmission,
    "",
  ].join("\n");
}

export function validateFormattedPrompt(markdown: string): string[] {
  const required = [
    "## 1. ROLE AND EXPERTISE",
    "## 2. COMPANY CONTEXT",
    "## 3. OWNER-CONFIRMED DECISIONS",
    "## 4. WORKING HYPOTHESES",
    "## 5. RESEARCH QUESTIONS",
    "## 6. EVIDENCE AND RED-TEAM REQUIREMENTS",
    "## 7. REQUIRED REPORT STRUCTURE",
    "## 8. QUALITY CHECK BEFORE SUBMISSION",
  ];
  const missing = required.filter((heading) => !markdown.includes(heading));
  const issues = [...missing.map((h) => `Missing heading: ${h}`)];
  if (!/disconfirm|contradict|challenge|red-?team/i.test(markdown)) {
    issues.push("Missing disconfirming-evidence requirement.");
  }
  if (!/competitor/i.test(markdown)) {
    issues.push("Missing competitor classification guidance.");
  }
  if (!/3 content pillars|three content pillars|3 pillars/i.test(markdown)) {
    issues.push("Missing three content pillars requirement.");
  }
  return issues;
}
