import type { FinalResearchPrompt } from "@/features/research-prompt-builder/schemas";
import { validatePromptContract } from "@/features/research-prompt-builder/validation/prompt-contract";

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
  return validatePromptContract(markdown);
}
