import "server-only";

import { assemblePromptContext } from "@/ai/context";
import { getContractSchemaVersion } from "@/ai/contracts/registry";
import { recordTrace } from "@/ai/traces/record-trace";
import {
  ConfirmedCompanyProfileSchema,
  FinalResearchPromptSchema,
  ResearchBriefSchema,
  type ConfirmedCompanyProfile,
  type ResearchBrief,
} from "@/features/research-prompt-builder/schemas";
import { buildResearchPromptCompilerPrompt } from "@/features/research-prompt-builder/prompts/research-prompt";
import { RUNTIME_PROMPT_VERSION } from "@/features/research-prompt-builder/prompts/prompt-version";
import { parseStructuredOutput } from "@/features/research-prompt-builder/services/structured-openai";
import { formatResearchPrompt } from "@/features/research-prompt-builder/formatters/format-research-prompt";
import { buildCompanyAnchors } from "@/features/research-prompt-builder/lib/company-anchors";
import { lintPromptContract } from "@/features/research-prompt-builder/validation/prompt-contract";
import { PROMPT_VERSION } from "@/features/research-prompt-builder/config/constants";
import { getOpenAIModel } from "@/lib/openai";

export async function generateResearchPrompt(input: {
  confirmedProfile: ConfirmedCompanyProfile;
  researchBrief: ResearchBrief;
}) {
  ConfirmedCompanyProfileSchema.parse(input.confirmedProfile);
  ResearchBriefSchema.parse(input.researchBrief);

  const model = getOpenAIModel();
  const contextPacket = assemblePromptContext({
    confirmedProfile: input.confirmedProfile,
    researchBrief: input.researchBrief,
    model,
    promptVersion: PROMPT_VERSION,
    companyProfileVersion: input.confirmedProfile.profileVersion,
  });

  const anchors = buildCompanyAnchors(
    input.confirmedProfile,
    input.researchBrief,
  );
  const prompt = buildResearchPromptCompilerPrompt({ contextPacket, anchors });

  const structuredPrompt = await parseStructuredOutput({
    operation: "compile-research-prompt",
    schemaName: "final_research_prompt",
    schema: FinalResearchPromptSchema,
    instructions: prompt.instructions,
    input: prompt.input,
    inputSchemaVersion: getContractSchemaVersion("research-brief"),
    outputSchemaVersion: getContractSchemaVersion("final-research-prompt"),
    charBudgetUsed: contextPacket.charCount,
    truncationWarningCount: contextPacket.truncationWarnings.length,
    anchors,
    validate: (value) =>
      lintPromptContract(formatResearchPrompt(value), { anchors }).issues,
    validationDiagnostics: (value) => {
      const lint = lintPromptContract(formatResearchPrompt(value), { anchors });
      return {
        anchorCoverage: lint.anchorCoverage,
        sectionCharCounts: lint.sectionCharCounts,
        degradedRuleCount: lint.anchorCoverage.filter((c) => c.degraded).length,
      };
    },
  });

  const withMeta = {
    ...structuredPrompt,
    metadata: {
      ...structuredPrompt.metadata,
      promptVersion: PROMPT_VERSION,
      companyProfileVersion: input.confirmedProfile.profileVersion,
      researchBriefVersion: structuredPrompt.metadata.researchBriefVersion || "1.0.0",
      generatedAt: new Date().toISOString(),
      model,
    },
  };

  const formattedPrompt = formatResearchPrompt(withMeta);
  const contractLint = lintPromptContract(formattedPrompt, { anchors });
  if (contractLint.issues.length) {
    recordTrace({
      operationId: "compile-research-prompt",
      model,
      promptVersion: RUNTIME_PROMPT_VERSION,
      inputSchemaVersion: getContractSchemaVersion("research-brief"),
      outputSchemaVersion: getContractSchemaVersion("final-research-prompt"),
      input: {
        operation: "compile-research-prompt",
        phase: "post_lint",
        instructionChars: prompt.instructions.length,
        packetChars: contextPacket.charCount,
      },
      output: {
        formattedChars: formattedPrompt.length,
        issues: contractLint.issues,
        anchorCoverage: contractLint.anchorCoverage,
        sectionCharCounts: contractLint.sectionCharCounts,
        degradedRuleCount: contractLint.anchorCoverage.filter((c) => c.degraded)
          .length,
      },
      startedAt: new Date().toISOString(),
      status: "validation_failed",
      repaired: false,
      validationIssueCount: contractLint.issues.length,
      repairAttempts: 0,
      finalValidation: "failed",
      charBudgetUsed: contextPacket.charCount,
      truncationWarningCount: contextPacket.truncationWarnings.length,
      errorCode: "PROMPT_VALIDATION_FAILED",
      meta: {
        phase: "post_lint",
        instructionChars: prompt.instructions.length,
        formattedChars: formattedPrompt.length,
        degradedAnchorRules: contractLint.anchorCoverage.filter((c) => c.degraded)
          .length,
        anchoredRulesChecked: contractLint.anchorCoverage.length,
      },
    });
    throw Object.assign(
      new Error(`Prompt contract validation failed: ${contractLint.issues.join("; ")}`),
      { code: "PROMPT_VALIDATION_FAILED" as const },
    );
  }

  // Density / thin-CSV coverage are telemetry (never shown to the model).
  const section6 =
    contractLint.sectionCharCounts["## 6. EVIDENCE AND RED-TEAM REQUIREMENTS"] ?? 0;
  const section7 =
    contractLint.sectionCharCounts["## 7. REQUIRED REPORT STRUCTURE"] ?? 0;
  recordTrace({
    operationId: "compile-research-prompt",
    model,
    promptVersion: RUNTIME_PROMPT_VERSION,
    inputSchemaVersion: getContractSchemaVersion("research-brief"),
    outputSchemaVersion: getContractSchemaVersion("final-research-prompt"),
    input: {
      operation: "compile-research-prompt",
      phase: "post_lint",
      instructionChars: prompt.instructions.length,
      packetChars: contextPacket.charCount,
    },
    output: {
      formattedChars: formattedPrompt.length,
      degradedRuleCount: contractLint.anchorCoverage.filter((c) => c.degraded).length,
      anchorCoverage: contractLint.anchorCoverage,
      sectionCharCounts: contractLint.sectionCharCounts,
    },
    startedAt: new Date().toISOString(),
    status: "ok",
    repaired: false,
    validationIssueCount: 0,
    repairAttempts: 0,
    finalValidation: "passed",
    charBudgetUsed: contextPacket.charCount,
    truncationWarningCount: contextPacket.truncationWarnings.length,
    meta: {
      phase: "post_lint",
      instructionChars: prompt.instructions.length,
      section6Chars: section6,
      section7Chars: section7,
      formattedChars: formattedPrompt.length,
      degradedAnchorRules: contractLint.anchorCoverage.filter((c) => c.degraded).length,
      anchoredRulesChecked: contractLint.anchorCoverage.length,
    },
  });

  return {
    structuredPrompt: withMeta,
    formattedPrompt,
    contractTelemetry: {
      sectionCharCounts: contractLint.sectionCharCounts,
      anchorCoverage: contractLint.anchorCoverage,
    },
  };
}
