import "server-only";

import { z } from "zod";
import { assembleInterviewContext } from "@/ai/context";
import { getContractSchemaVersion } from "@/ai/contracts/registry";
import {
  ConfirmedCompanyProfileSchema,
  InterviewAnswerSchema,
  InterviewQuestionSchema,
  type ConfirmedCompanyProfile,
  type InterviewAnswer,
  type InterviewQuestion,
} from "@/features/research-prompt-builder/schemas";
import { buildNextQuestionPrompt } from "@/features/research-prompt-builder/prompts/next-question";
import { parseStructuredOutput } from "@/features/research-prompt-builder/services/structured-openai";
import { validateInterviewQuestion } from "@/features/research-prompt-builder/validation/interview";
import {
  MAX_CONDITIONAL_QUESTIONS,
  MAX_TOTAL_QUESTIONS,
} from "@/features/research-prompt-builder/config/constants";

const CONDITIONAL_CAP_ISSUE = `Conditional question cap reached (max ${MAX_CONDITIONAL_QUESTIONS}). Return a non-conditional question targeting an unresolved core decision, or done:true with a completionReason if every core decision is resolved.`;

const NextQuestionResponseSchema = z.object({
  done: z.boolean(),
  completionReason: z.string().min(5).max(500).optional(),
  question: InterviewQuestionSchema.optional(),
});

const CORE = [
  "customer_moment",
  "viewer_reward",
  "business_bridge",
  "trust_boundaries",
  "challenge_assumption",
] as const;

export async function generateNextQuestion(input: {
  confirmedProfile: ConfirmedCompanyProfile;
  previousQuestions: InterviewQuestion[];
  previousAnswers: InterviewAnswer[];
  unresolvedUnknowns: string[];
}) {
  ConfirmedCompanyProfileSchema.parse(input.confirmedProfile);
  input.previousQuestions.forEach((q) => InterviewQuestionSchema.parse(q));
  input.previousAnswers.forEach((a) => InterviewAnswerSchema.parse(a));

  if (input.previousQuestions.length >= MAX_TOTAL_QUESTIONS) {
    return {
      done: true as const,
      completionReason: "Reached the maximum of seven interview questions.",
    };
  }

  const covered = new Set(input.previousQuestions.map((q) => q.decisionCategory));
  const coresResolved = CORE.every((c) => covered.has(c));
  if (coresResolved && input.previousQuestions.length >= 4) {
    return {
      done: true as const,
      completionReason: "Required strategic decisions are resolved.",
    };
  }

  const conditionalCount = input.previousQuestions.filter(
    (q) => q.isConditional,
  ).length;
  const conditionalCapReached = conditionalCount >= MAX_CONDITIONAL_QUESTIONS;

  const remainingSlots = MAX_TOTAL_QUESTIONS - input.previousQuestions.length;
  const contextPacket = assembleInterviewContext({
    ...input,
    remainingSlots,
  });
  const prompt = buildNextQuestionPrompt({ contextPacket });

  let result: z.infer<typeof NextQuestionResponseSchema>;
  try {
    result = await parseStructuredOutput({
      operation: "generate-next-question",
      schemaName: "next_interview_question",
      schema: NextQuestionResponseSchema,
      instructions: prompt.instructions,
      input: prompt.input,
      inputSchemaVersion: getContractSchemaVersion("confirmed-profile"),
      outputSchemaVersion: getContractSchemaVersion("interview-question"),
      charBudgetUsed: contextPacket.charCount,
      truncationWarningCount: contextPacket.truncationWarnings.length,
      validate: (value) => {
        if (value.done) {
          return value.completionReason ? [] : ["completionReason is required when done."];
        }
        if (!value.question) return ["question is required when done is false."];
        const issues = validateInterviewQuestion(value.question);
        if (
          covered.has(value.question.decisionCategory) &&
          !value.question.isConditional
        ) {
          issues.push("Decision category already covered.");
        }
        // Deterministic cap: with 2 conditionals already asked, a third
        // conditional is rejected. parseStructuredOutput performs exactly one
        // targeted repair asking for a non-conditional question.
        if (conditionalCapReached && value.question.isConditional) {
          issues.push(CONDITIONAL_CAP_ISSUE);
        }
        return issues;
      },
    });
  } catch (error) {
    // If the single repair still violated the conditional cap, end the
    // interview only when every core decision is resolved; otherwise the
    // model output stays invalid — never silently end an incomplete interview.
    const message = error instanceof Error ? error.message : "";
    if (message.includes(CONDITIONAL_CAP_ISSUE) && coresResolved) {
      return {
        done: true as const,
        completionReason:
          "Core decisions are resolved and the conditional question limit was reached.",
      };
    }
    throw error;
  }

  if (result.done) {
    return {
      done: true as const,
      completionReason:
        result.completionReason ?? "Interview complete based on resolved decisions.",
    };
  }

  if (!result.question) {
    throw Object.assign(new Error("Interview model returned no question."), {
      code: "MODEL_OUTPUT_INVALID" as const,
    });
  }

  const question = {
    ...result.question,
    sequenceNumber: input.previousQuestions.length + 1,
  };

  return {
    done: false as const,
    question,
  };
}
