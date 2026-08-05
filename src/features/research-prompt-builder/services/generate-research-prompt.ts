import "server-only";

import {
  ConfirmedCompanyProfileSchema,
  FinalResearchPromptSchema,
  ResearchBriefSchema,
  type ConfirmedCompanyProfile,
  type ResearchBrief,
} from "@/features/research-prompt-builder/schemas";
import { buildResearchPromptCompilerPrompt } from "@/features/research-prompt-builder/prompts/research-prompt";
import { parseStructuredOutput } from "@/features/research-prompt-builder/services/structured-openai";
import {
  formatResearchPrompt,
  validateFormattedPrompt,
} from "@/features/research-prompt-builder/formatters/format-research-prompt";
import { PROMPT_VERSION } from "@/features/research-prompt-builder/config/constants";
import { getOpenAIModel } from "@/lib/openai";

export async function generateResearchPrompt(input: {
  confirmedProfile: ConfirmedCompanyProfile;
  researchBrief: ResearchBrief;
}) {
  ConfirmedCompanyProfileSchema.parse(input.confirmedProfile);
  ResearchBriefSchema.parse(input.researchBrief);

  const model = getOpenAIModel();
  const prompt = buildResearchPromptCompilerPrompt({
    confirmedProfile: input.confirmedProfile,
    researchBrief: input.researchBrief,
    model,
    promptVersion: PROMPT_VERSION,
    companyProfileVersion: input.confirmedProfile.profileVersion,
  });

  const structuredPrompt = await parseStructuredOutput({
    operation: "research.prompt",
    schemaName: "final_research_prompt",
    schema: FinalResearchPromptSchema,
    instructions: prompt.instructions,
    input: prompt.input,
    validate: (value) => {
      const formatted = formatResearchPrompt(value);
      return validateFormattedPrompt(formatted);
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

  return {
    structuredPrompt: withMeta,
    formattedPrompt: formatResearchPrompt(withMeta),
  };
}
