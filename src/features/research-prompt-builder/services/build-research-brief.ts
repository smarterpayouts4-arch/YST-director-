import "server-only";

import {
  ConfirmedCompanyProfileSchema,
  InterviewAnswerSchema,
  InterviewQuestionSchema,
  ResearchBriefSchema,
  type ConfirmedCompanyProfile,
  type InterviewAnswer,
  type InterviewQuestion,
} from "@/features/research-prompt-builder/schemas";
import { buildResearchBriefPrompt } from "@/features/research-prompt-builder/prompts/research-brief";
import { parseStructuredOutput } from "@/features/research-prompt-builder/services/structured-openai";

export async function buildResearchBrief(input: {
  confirmedProfile: ConfirmedCompanyProfile;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
}) {
  ConfirmedCompanyProfileSchema.parse(input.confirmedProfile);
  input.questions.forEach((q) => InterviewQuestionSchema.parse(q));
  input.answers.forEach((a) => InterviewAnswerSchema.parse(a));

  const prompt = buildResearchBriefPrompt(input);
  return parseStructuredOutput({
    operation: "research.brief",
    schemaName: "research_brief",
    schema: ResearchBriefSchema,
    instructions: prompt.instructions,
    input: prompt.input,
    validate: (brief) => {
      const issues: string[] = [];
      if (/all platforms/i.test(brief.primaryPlatform.value)) {
        issues.push("Primary platform must not be every platform.");
      }
      if (!brief.challengeHypothesis.trim()) {
        issues.push("Challenge hypothesis is required.");
      }
      return issues;
    },
  });
}
