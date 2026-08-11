import "server-only";

import { z } from "zod";
import {
  assembleInterviewContext,
  evidenceAllowlistKeySet,
} from "@/ai/context";
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
import { canCompleteInterview } from "@/features/research-prompt-builder/lib/can-complete-interview";
import {
  allCoreResolved,
  resolveCoreCoverage,
} from "@/features/research-prompt-builder/lib/core-coverage";
import {
  MAX_CONDITIONAL_QUESTIONS,
  MAX_TOTAL_QUESTIONS,
} from "@/features/research-prompt-builder/config/constants";

const CONDITIONAL_CAP_ISSUE = `Conditional question cap reached (max ${MAX_CONDITIONAL_QUESTIONS}). Return a non-conditional question targeting an unresolved core decision, or done:true with a completionReason if every core decision is resolved.`;

// OpenAI structured outputs require every property to be present: use
// `.nullable()` (not bare `.optional()`) for fields that may be empty.
const NextQuestionResponseSchema = z.object({
  done: z.boolean(),
  completionReason: z.string().min(5).max(500).nullable(),
  question: InterviewQuestionSchema.nullable(),
});

export async function generateNextQuestion(input: {
  confirmedProfile: ConfirmedCompanyProfile;
  previousQuestions: InterviewQuestion[];
  previousAnswers: InterviewAnswer[];
  unresolvedUnknowns: string[];
}) {
  ConfirmedCompanyProfileSchema.parse(input.confirmedProfile);
  input.previousQuestions.forEach((q) => InterviewQuestionSchema.parse(q));
  input.previousAnswers.forEach((a) => InterviewAnswerSchema.parse(a));

  const completion = canCompleteInterview(input);
  if (completion.ok) {
    return {
      done: true as const,
      completionReason: completion.completionReason,
    };
  }

  const { covered: coreCovered, resolutions } = resolveCoreCoverage(input);
  const coresResolved = allCoreResolved(coreCovered);
  const covered = new Set(input.previousQuestions.map((q) => q.decisionCategory));

  const conditionalCount = input.previousQuestions.filter(
    (q) => q.isConditional,
  ).length;
  const conditionalCapReached = conditionalCount >= MAX_CONDITIONAL_QUESTIONS;

  const remainingSlots = MAX_TOTAL_QUESTIONS - input.previousQuestions.length;
  const contextPacket = assembleInterviewContext({
    ...input,
    remainingSlots,
    coreResolutions: resolutions,
    unresolvedCoreCategories: completion.unresolvedCoreCategories,
  });
  const prompt = buildNextQuestionPrompt({ contextPacket });
  const allowlist = evidenceAllowlistKeySet(input.confirmedProfile);
  // At most one strategic_direction turn, only while strategic research
  // priorities remain unresolved (interview start). Not a generic Q1 ritual.
  const hasStrategicDirection = input.previousQuestions.some(
    (q) => q.questionKind === "strategic_direction",
  );
  const requireStrategic =
    !hasStrategicDirection && input.previousQuestions.length === 0;

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
          const issues: string[] = [];
          if (!value.completionReason) {
            issues.push("completionReason is required when done.");
          }
          const allowed = canCompleteInterview(input);
          if (!allowed.ok) {
            issues.push(
              `Cannot complete interview while core decisions are unresolved: ${allowed.unresolvedCoreCategories.join(", ")}.`,
            );
          }
          return issues;
        }
        if (!value.question) return ["question is required when done is false."];
        const issues = validateInterviewQuestion(value.question, {
          evidenceAllowlist: allowlist,
        });
        if (requireStrategic && value.question.questionKind !== "strategic_direction") {
          issues.push(
            "Strategic research priorities are unresolved — questionKind must be strategic_direction.",
          );
        }
        if (!requireStrategic && value.question.questionKind === "strategic_direction") {
          issues.push("strategic_direction may be asked at most once.");
        }
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
      const allowed = canCompleteInterview(input);
      if (allowed.ok) {
        return {
          done: true as const,
          completionReason:
            "Core decisions are resolved and the conditional question limit was reached.",
        };
      }
    }
    throw error;
  }

  if (result.done) {
    const allowed = canCompleteInterview(input);
    if (!allowed.ok) {
      throw Object.assign(
        new Error(
          `Interview model returned done:true but cores remain unresolved: ${allowed.unresolvedCoreCategories.join(", ")}.`,
        ),
        { code: "MODEL_OUTPUT_INVALID" as const },
      );
    }
    return {
      done: true as const,
      completionReason:
        result.completionReason ?? allowed.completionReason,
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
