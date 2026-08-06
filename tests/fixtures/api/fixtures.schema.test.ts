import { describe, expect, it } from "vitest";
import {
  CompanyUnderstandingSchema,
  ConfirmedCompanyProfileSchema,
  FinalResearchPromptSchema,
  InterviewAnswerSchema,
  InterviewQuestionSchema,
  ResearchBriefSchema,
  SupportingContextSchema,
} from "@/features/research-prompt-builder/schemas";
import { formatResearchPrompt } from "@/features/research-prompt-builder/formatters/format-research-prompt";
import { lintPromptContract } from "@/features/research-prompt-builder/validation/prompt-contract";
import { makeCompanyUnderstanding } from "./company-understanding";
import { makeConfirmedProfile } from "./confirmed-profile";
import { makeInterviewAnswer, makeInterviewQuestion } from "./interview-question";
import { makeResearchBrief } from "./research-brief";
import { makeFinalPrompt, makeFormattedPrompt } from "./final-prompt";
import { makeSupportingContext } from "./supporting-context";

/**
 * Guards against mocked API fixtures drifting from the canonical Zod
 * contracts. Every factory used by route tests and the Playwright E2E mocks
 * must parse through the real schemas.
 */
describe("API fixtures stay schema-valid", () => {
  it("company understanding", () => {
    expect(() => CompanyUnderstandingSchema.parse(makeCompanyUnderstanding())).not.toThrow();
  });

  it("confirmed profile", () => {
    expect(() => ConfirmedCompanyProfileSchema.parse(makeConfirmedProfile())).not.toThrow();
  });

  it("interview question and answer", () => {
    expect(() => InterviewQuestionSchema.parse(makeInterviewQuestion())).not.toThrow();
    expect(() => InterviewAnswerSchema.parse(makeInterviewAnswer())).not.toThrow();
  });

  it("research brief", () => {
    expect(() => ResearchBriefSchema.parse(makeResearchBrief())).not.toThrow();
  });

  it("supporting context", () => {
    expect(() => SupportingContextSchema.parse(makeSupportingContext())).not.toThrow();
  });

  it("final prompt parses and passes the prompt contract lint", () => {
    const prompt = makeFinalPrompt();
    expect(() => FinalResearchPromptSchema.parse(prompt)).not.toThrow();
    const lint = lintPromptContract(formatResearchPrompt(prompt));
    expect(lint.issues).toEqual([]);
    expect(lint.ok).toBe(true);
  });

  it("makeFormattedPrompt matches the real formatter byte-for-byte", () => {
    const prompt = makeFinalPrompt();
    expect(makeFormattedPrompt(prompt)).toBe(formatResearchPrompt(prompt));
  });
});
