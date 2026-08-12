import type { FinalResearchPrompt } from "@/features/research-prompt-builder/schemas";
import {
  RESEARCH_PROMPT_EXECUTE_PREAMBLE,
  RESEARCH_PROMPT_STOP_FOOTER,
} from "@/features/research-prompt-builder/formatters/export-framing";
import { validatePromptContract } from "@/features/research-prompt-builder/validation/prompt-contract";

export {
  RESEARCH_PROMPT_EXECUTE_PREAMBLE,
  RESEARCH_PROMPT_STOP_FOOTER,
} from "@/features/research-prompt-builder/formatters/export-framing";

export function formatResearchPrompt(prompt: FinalResearchPrompt): string {
  return [
    RESEARCH_PROMPT_EXECUTE_PREAMBLE,
    "",
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
    RESEARCH_PROMPT_STOP_FOOTER,
    "",
  ].join("\n");
}

export function validateFormattedPrompt(markdown: string): string[] {
  return validatePromptContract(markdown);
}
