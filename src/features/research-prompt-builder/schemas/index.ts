import { z } from "zod";

export const EvidenceRefSchema = z.object({
  ref: z.string().min(1).max(100),
  explanation: z.string().min(1).max(300),
});

export const ClassifiedFieldSchema = z.object({
  value: z.string().min(1).max(1200),
  classification: z.enum([
    "observed_fact",
    "working_assumption",
    "important_unknown",
  ]),
  confidence: z.enum(["high", "medium", "low"]),
  evidence: z.array(EvidenceRefSchema).max(12),
});

export const CompanyUnderstandingSchema = z.object({
  companyName: ClassifiedFieldSchema,
  industry: ClassifiedFieldSchema,
  offer: ClassifiedFieldSchema,
  customerProblem: ClassifiedFieldSchema,
  likelyAudience: ClassifiedFieldSchema,
  websiteAction: ClassifiedFieldSchema,
  geography: ClassifiedFieldSchema,
  differentiators: z.array(ClassifiedFieldSchema).max(8),
  expertiseSignals: z.array(ClassifiedFieldSchema).max(8),
  claimsAndRestrictions: z.array(ClassifiedFieldSchema).max(12),
  confirmedFacts: z.array(ClassifiedFieldSchema).max(30),
  workingAssumptions: z.array(ClassifiedFieldSchema).max(20),
  importantUnknowns: z.array(ClassifiedFieldSchema).max(15),
  ingestionSummary: z.string().min(50).max(1600),
  ingestionWarnings: z.array(z.string().max(500)).max(20),
});

export const ConfirmedFieldSchema = z.object({
  value: z.string(),
  status: z.enum(["confirmed", "corrected", "rejected", "unresolved"]),
  originalClassification: z.enum([
    "observed_fact",
    "working_assumption",
    "important_unknown",
  ]),
  confidence: z.enum(["high", "medium", "low"]),
  evidenceRefs: z.array(z.string().max(100)).max(12),
});

export const ConfirmedCompanyProfileSchema = z.object({
  profileVersion: z.string(),
  fields: z.record(ConfirmedFieldSchema),
  ownerNotes: z.string().default(""),
});

export const BriefFieldKeySchema = z.enum([
  "customerMoment",
  "viewerReward",
  "challengeHypothesis",
  "contentHypothesis",
  "executionContext",
  "companyTruth",
  "businessBridge",
  "primaryPlatform",
  "trustBoundaries",
  "unresolvedUnknowns",
]);

export const StrategicSuggestionSchema = z.object({
  suggestionId: z.string().min(1).max(64),
  title: z.string().min(3).max(80),
  description: z.string().min(20).max(280),
  rationale: z.string().min(20).max(280),
  researchFocus: z.string().min(20).max(280),
  classification: z.literal("working_hypothesis"),
  evidenceRefs: z.array(z.string().max(64)).max(3),
});

export const InterviewQuestionSchema = z.object({
  questionId: z.string().min(1).max(100),
  sequenceNumber: z.number().int().min(1).max(7),
  questionKind: z.enum(["strategic_direction", "standard"]),
  decisionCategory: z.enum([
    "strategic_direction",
    "customer_moment",
    "viewer_reward",
    "business_bridge",
    "trust_boundaries",
    "challenge_assumption",
    "geography_capacity",
    "regulated_claims",
    "commercial_priority",
    "customer_qualification",
    "production_capacity",
    "other_material_unknown",
  ]),
  whatWeNoticed: z.string().min(30).max(700),
  question: z.string().min(20).max(400),
  /** Null for strategic_direction; required non-null for standard. */
  suggestedAnswer: z.string().min(20).max(1200).nullable(),
  whyThisMatters: z.string().min(20).max(500),
  evidenceRefs: z.array(z.string().max(100)).max(12),
  /** Empty for standard; 3–5 cards enforced in semantic validation for strategic_direction. */
  strategicSuggestions: z.array(StrategicSuggestionSchema).max(5),
  isConditional: z.boolean(),
  resolvesBriefFields: z.array(BriefFieldKeySchema).max(10),
  qualityScores: z.object({
    evidenceBased: z.number().int().min(1).max(5),
    material: z.number().int().min(1).max(5),
    genuinelyUnknown: z.number().int().min(1).max(5),
    singular: z.number().int().min(1).max(5),
    easyToAnswer: z.number().int().min(1).max(5),
    strategicallyUseful: z.number().int().min(1).max(5),
  }),
});

export const SupportingDocumentAnswerSchema = z.object({
  documentId: z.string(),
  fileName: z.string(),
  extractedSummary: z.string().max(5000),
  extractionWarnings: z.array(z.string()).max(10),
});

export const InterviewAnswerSchema = z.object({
  questionId: z.string(),
  answerText: z.string().min(1).max(5000),
  usedSuggestion: z.boolean(),
  selectedSuggestionIds: z.array(z.string().max(64)).max(5),
  customDirection: z.string().max(500).nullable(),
  supportingDocuments: z.array(SupportingDocumentAnswerSchema).max(3),
  answeredAt: z.string(),
});

export const SupportingContextSchema = z.object({
  documentId: z.string(),
  fileName: z.string(),
  documentType: z.string(),
  relevantFacts: z.array(z.string().max(800)).max(20),
  ownerStatements: z.array(z.string().max(800)).max(20),
  assumptions: z.array(z.string().max(800)).max(15),
  contradictions: z.array(z.string().max(800)).max(15),
  risksOrRestrictions: z.array(z.string().max(800)).max(15),
  suggestedAnswerAdditions: z.array(z.string().max(800)).max(12),
  warnings: z.array(z.string().max(500)).max(12),
});

export const FieldOriginSchema = z.object({
  origin: z.enum([
    "confirmed_profile",
    "owner_answer",
    "owner_selected_hypothesis",
    "owner_brief_edit",
    "model_hypothesis",
  ]),
  sourceRefs: z.array(z.string().max(64)).max(3),
});

/** Exhaustive sidecar — every legal brief field required; unknown keys rejected. */
export const BriefFieldProvenanceSchema = z.object({
  customerMoment: FieldOriginSchema,
  viewerReward: FieldOriginSchema,
  challengeHypothesis: FieldOriginSchema,
  contentHypothesis: FieldOriginSchema,
  executionContext: FieldOriginSchema,
  companyTruth: FieldOriginSchema,
  businessBridge: FieldOriginSchema,
  primaryPlatform: FieldOriginSchema,
  trustBoundaries: FieldOriginSchema,
  unresolvedUnknowns: FieldOriginSchema,
});

export const ResearchBriefSchema = z.object({
  companyTruth: z.string().min(50).max(2500),
  customerMoment: z.string().min(30).max(1800),
  viewerReward: z.string().min(30).max(1800),
  businessBridge: z.string().min(30).max(1800),
  primaryPlatform: z.object({
    value: z.string().min(1).max(200),
    rationale: z.string().min(20).max(1000),
  }),
  contentHypothesis: z.string().min(50).max(2500),
  challengeHypothesis: z.string().min(50).max(2500),
  trustBoundaries: z.array(z.string().min(5).max(800)).max(30),
  executionContext: z.array(z.string().min(5).max(800)).max(30),
  unresolvedUnknowns: z.array(z.string().min(5).max(800)).max(20),
  evidenceSummary: z
    .array(
      z.object({
        statement: z.string().max(800),
        classification: z.enum([
          "observed_fact",
          "owner_confirmed",
          "working_hypothesis",
          "research_question",
        ]),
        evidenceRefs: z.array(z.string().max(100)).max(12),
      }),
    )
    .max(60),
  fieldProvenance: BriefFieldProvenanceSchema,
});

export const FinalResearchPromptSchema = z.object({
  title: z.string().min(5).max(160),
  roleAndExpertise: z.string().min(100).max(2500),
  companyContext: z.string().min(200).max(6000),
  ownerConfirmedDecisions: z.string().min(100).max(5000),
  workingHypotheses: z.string().min(100).max(5000),
  researchQuestions: z.string().min(200).max(7000),
  evidenceAndRedTeamRequirements: z.string().min(200).max(9000),
  requiredReportStructure: z.string().min(300).max(11000),
  qualityCheckBeforeSubmission: z.string().min(150).max(5000),
  metadata: z.object({
    promptVersion: z.string(),
    companyProfileVersion: z.string(),
    researchBriefVersion: z.string(),
    generatedAt: z.string(),
    model: z.string(),
  }),
});

export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.enum([
      "INVALID_INPUT",
      "UNSUPPORTED_FILE",
      "FILE_TOO_LARGE",
      "CSV_PARSE_FAILED",
      "DOCUMENT_EXTRACTION_FAILED",
      "MODEL_REFUSAL",
      "MODEL_OUTPUT_INVALID",
      "OPENAI_ERROR",
      "REQUEST_TIMEOUT",
      "INTERNAL_ERROR",
    ]),
    message: z.string(),
    details: z
      .array(
        z.object({
          path: z.string(),
          message: z.string(),
        }),
      )
      .optional(),
    requestId: z.string(),
  }),
});

export const CsvEvidencePacketSchema = z.object({
  fileName: z.string(),
  fileHash: z.string(),
  importedAt: z.string(),
  rowCount: z.number().int().nonnegative(),
  retainedRowCount: z.number().int().nonnegative(),
  skippedRowCount: z.number().int().nonnegative(),
  columnCount: z.number().int().nonnegative(),
  headers: z.array(z.string()),
  columnSummaries: z.array(
    z.object({
      name: z.string(),
      nonEmptyCount: z.number().int().nonnegative(),
      uniqueCount: z.number().int().nonnegative(),
      sampleValues: z.array(z.string()),
    }),
  ),
  evidenceRows: z.array(
    z.object({
      evidenceRef: z.string(),
      sourceRow: z.number().int().positive(),
      values: z.record(z.string()),
    }),
  ),
  warnings: z.array(z.string()),
  wasTruncated: z.boolean(),
});

export type CompanyUnderstanding = z.infer<typeof CompanyUnderstandingSchema>;
export type ConfirmedCompanyProfile = z.infer<typeof ConfirmedCompanyProfileSchema>;
export type BriefFieldKey = z.infer<typeof BriefFieldKeySchema>;
export type FieldOrigin = z.infer<typeof FieldOriginSchema>;
export type BriefFieldProvenance = z.infer<typeof BriefFieldProvenanceSchema>;
export type StrategicSuggestion = z.infer<typeof StrategicSuggestionSchema>;
export type InterviewQuestion = z.infer<typeof InterviewQuestionSchema>;
export type InterviewAnswer = z.infer<typeof InterviewAnswerSchema>;
export type SupportingContext = z.infer<typeof SupportingContextSchema>;
export type ResearchBrief = z.infer<typeof ResearchBriefSchema>;
export type FinalResearchPrompt = z.infer<typeof FinalResearchPromptSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
export type CsvEvidencePacket = z.infer<typeof CsvEvidencePacketSchema>;
export type ClassifiedField = z.infer<typeof ClassifiedFieldSchema>;
