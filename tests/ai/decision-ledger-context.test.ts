import { describe, expect, it } from "vitest";
import { assembleBriefContext } from "@/ai/context/assemble-brief-context";
import { assemblePromptContext } from "@/ai/context/assemble-prompt-context";
import type {
  ConfirmedCompanyProfile,
  InterviewAnswer,
  InterviewQuestion,
  ResearchBrief,
} from "@/features/research-prompt-builder/schemas";

const profile = {
  profileVersion: "p1",
  confirmedAt: new Date().toISOString(),
  ownerNotes: "",
  fields: {
    company_name: {
      value: "Sleepy Cub Naturals",
      status: "confirmed",
      originalClassification: "observed_fact",
      confidence: "high",
      evidenceRefs: ["row:2"],
    },
    claims_restrictions: {
      value: "Cannot make medical claims about infant sleep outcomes.",
      status: "confirmed",
      originalClassification: "observed_fact",
      confidence: "high",
      evidenceRefs: ["row:9"],
    },
    target_customer: {
      value: "New parents of infants under 12 months",
      status: "corrected",
      originalClassification: "working_assumption",
      confidence: "medium",
      evidenceRefs: [],
    },
  },
} as unknown as ConfirmedCompanyProfile;

const question = {
  questionId: "q1",
  sequenceNumber: 1,
  decisionCategory: "customer_moment",
  observation: "o".repeat(40),
  question: "What single customer moment matters most?",
  whyThisMatters: "w".repeat(30),
  suggestedAnswer: "s".repeat(40),
  isConditional: false,
  evidenceRefs: ["row:4"],
} as unknown as InterviewQuestion;

const answer = {
  questionId: "q1",
  answerText: "The 3am search for why the baby will not sleep.",
  usedSuggestion: false,
  answeredAt: new Date().toISOString(),
  supportingDocuments: [],
} as unknown as InterviewAnswer;

const brief = {
  companyTruth: "x".repeat(60),
  customerMoment: "y".repeat(40),
  viewerReward: "z".repeat(40),
  businessBridge: "a".repeat(40),
  primaryPlatform: {
    value: "YouTube",
    rationale: "r".repeat(30),
  },
  contentHypothesis: "c".repeat(60),
  challengeHypothesis: "h".repeat(60),
  trustBoundaries: ["no medical advice"],
  executionContext: ["owner can film weekly"],
  unresolvedUnknowns: ["ideal CTA"],
  evidenceSummary: [],
  fieldProvenance: {
    customerMoment: { origin: "owner_answer", sourceRefs: [] },
    viewerReward: { origin: "model_hypothesis", sourceRefs: [] },
    challengeHypothesis: { origin: "model_hypothesis", sourceRefs: [] },
    contentHypothesis: { origin: "model_hypothesis", sourceRefs: [] },
    executionContext: { origin: "model_hypothesis", sourceRefs: [] },
    companyTruth: { origin: "confirmed_profile", sourceRefs: [] },
    businessBridge: { origin: "model_hypothesis", sourceRefs: [] },
    primaryPlatform: { origin: "model_hypothesis", sourceRefs: [] },
    trustBoundaries: { origin: "confirmed_profile", sourceRefs: [] },
    unresolvedUnknowns: { origin: "model_hypothesis", sourceRefs: [] },
  },
} satisfies ResearchBrief;

describe("derived decision ledger in context compilers", () => {
  it("brief context embeds ledger records with correct origins", () => {
    const packet = assembleBriefContext({
      confirmedProfile: profile,
      questions: [question],
      answers: [answer],
    });

    const ledger = packet.packet.decisionLedger;
    expect(ledger.profileVersion).toBe("p1");
    expect(ledger.counts.owner_confirmed).toBeGreaterThanOrEqual(1);
    expect(ledger.counts.owner_corrected).toBe(1);
    expect(ledger.counts.owner_authored_answer).toBe(1);
    expect(ledger.counts.suggestion_accepted).toBe(0);
    expect(ledger.counts.restriction).toBe(1);

    const answerRecord = ledger.records.find((r) => r.decisionId === "answer:q1");
    expect(answerRecord?.origin).toBe("owner_authored_answer");
    expect(answerRecord?.sourceQuestionId).toBe("q1");

    expect(
      packet.provenanceNotes.some((note) => note.startsWith("decisionLedger:")),
    ).toBe(true);
  });

  it("marks accepted model suggestions separately from owner-authored answers", () => {
    const accepted: InterviewAnswer = {
      ...answer,
      usedSuggestion: true,
      answerText: "s".repeat(40),
    };
    const packet = assembleBriefContext({
      confirmedProfile: profile,
      questions: [question],
      answers: [accepted],
    });
    const answerRecord = packet.packet.decisionLedger.records.find(
      (r) => r.decisionId === "answer:q1",
    );
    expect(answerRecord?.origin).toBe("suggestion_accepted");
    expect(packet.packet.decisionLedger.counts.suggestion_accepted).toBe(1);
    expect(packet.packet.decisionLedger.counts.owner_authored_answer).toBe(0);
  });

  it("prompt context derives restrictions from the ledger plus trust boundaries", () => {
    const packet = assemblePromptContext({
      confirmedProfile: profile,
      researchBrief: brief,
      model: "gpt-5.6-terra",
      promptVersion: "1.0.0",
      companyProfileVersion: "p1",
    });

    expect(packet.packet.restrictions).toContain("no medical advice");
    expect(
      packet.packet.restrictions.some((r) => r.includes("Cannot make medical claims")),
    ).toBe(true);
    expect(packet.packet.decisionProvenance.counts.restriction).toBe(1);
    expect(packet.packet.decisionProvenance.records.length).toBeGreaterThan(0);
  });
});
