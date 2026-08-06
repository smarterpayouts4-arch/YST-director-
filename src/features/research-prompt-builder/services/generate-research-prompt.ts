import "server-only";

import { assemblePromptContext } from "@/ai/context";
import { getContractSchemaVersion } from "@/ai/contracts/registry";
import {
  ConfirmedCompanyProfileSchema,
  FinalResearchPromptSchema,
  ResearchBriefSchema,
  type ConfirmedCompanyProfile,
  type ResearchBrief,
} from "@/features/research-prompt-builder/schemas";
import { buildResearchPromptCompilerPrompt } from "@/features/research-prompt-builder/prompts/research-prompt";
import { parseStructuredOutput } from "@/features/research-prompt-builder/services/structured-openai";
import { formatResearchPrompt } from "@/features/research-prompt-builder/formatters/format-research-prompt";
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

  const prompt = buildResearchPromptCompilerPrompt({ contextPacket });

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
    validate: (value) => lintPromptContract(formatResearchPrompt(value)).issues,
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
  const contractIssues = lintPromptContract(formattedPrompt).issues;
  if (contractIssues.length) {
    throw Object.assign(
      new Error(`Prompt contract validation failed: ${contractIssues.join("; ")}`),
      { code: "PROMPT_VALIDATION_FAILED" as const },
    );
  }

  return {
    structuredPrompt: withMeta,
    formattedPrompt,
  };
}
