import "server-only";

import { assembleBriefContext } from "@/ai/context";
import { getContractSchemaVersion } from "@/ai/contracts/registry";
import {
  ConfirmedCompanyProfileSchema,
  InterviewAnswerSchema,
  InterviewQuestionSchema,
  ResearchBriefSchema,
  type ConfirmedCompanyProfile,
  type InterviewAnswer,
  type InterviewQuestion,
} from "@/features/research-prompt-builder/schemas";
import { canCompleteInterview } from "@/features/research-prompt-builder/lib/can-complete-interview";
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

  // Server-authoritative: UI/client may share canCompleteInterview for UX, but
  // brief construction must not proceed while the completion invariant is false.
  const completion = canCompleteInterview({
    confirmedProfile: input.confirmedProfile,
    previousQuestions: input.questions,
    previousAnswers: input.answers,
  });
  if (!completion.ok) {
    throw Object.assign(
      new Error(
        `Cannot build research brief while core decisions are unresolved: ${completion.unresolvedCoreCategories.join(", ")}.`,
      ),
      { code: "INVALID_INPUT" as const },
    );
  }

  const contextPacket = assembleBriefContext(input);
  const prompt = buildResearchBriefPrompt({ contextPacket });
  return parseStructuredOutput({
    operation: "build-research-brief",
    schemaName: "research_brief",
    schema: ResearchBriefSchema,
    instructions: prompt.instructions,
    input: prompt.input,
    inputSchemaVersion: getContractSchemaVersion("confirmed-profile"),
    outputSchemaVersion: getContractSchemaVersion("research-brief"),
    charBudgetUsed: contextPacket.charCount,
    truncationWarningCount: contextPacket.truncationWarnings.length,
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
