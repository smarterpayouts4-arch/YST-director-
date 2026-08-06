import type { AppStage } from "@/features/research-prompt-builder/config/constants";

/** Happy-path workflow states. COMPLETE is an alias of PROMPT_EXPORTED. */
export const HAPPY_WORKFLOW_STATES = [
  "INGESTING",
  "UNDERSTANDING_REVIEW",
  "INTERVIEWING",
  "BRIEF_REVIEW",
  "GENERATING_PROMPT",
  "PROMPT_EXPORTED",
] as const;

export const FAILURE_WORKFLOW_STATES = [
  "INGESTION_FAILED",
  "MODEL_OUTPUT_INVALID",
  "DOCUMENT_EXTRACTION_FAILED",
  "OWNER_CORRECTION_REQUIRED",
  "PROMPT_VALIDATION_FAILED",
] as const;

export const WORKFLOW_STATES = [
  ...HAPPY_WORKFLOW_STATES,
  ...FAILURE_WORKFLOW_STATES,
] as const;

export type HappyWorkflowState = (typeof HAPPY_WORKFLOW_STATES)[number];
export type FailureWorkflowState = (typeof FAILURE_WORKFLOW_STATES)[number];
export type WorkflowState = (typeof WORKFLOW_STATES)[number];

/** Alias used in docs and recovery copy. */
export const COMPLETE: HappyWorkflowState = "PROMPT_EXPORTED";

export type RetryPolicy = {
  retryable: boolean;
  maxAttempts: number;
  backoffMs: number;
  userAction: string;
};

export type TransitionMeta = {
  requiredInputs: string[];
  allowedNext: WorkflowState[];
  invalidateDownstream: Array<
    | "companyUnderstanding"
    | "confirmedProfile"
    | "questions"
    | "answers"
    | "researchBrief"
    | "finalPrompt"
    | "formattedPrompt"
  >;
  retryPolicy: RetryPolicy;
  recoveryHint: string;
};

const noRetry: RetryPolicy = {
  retryable: false,
  maxAttempts: 0,
  backoffMs: 0,
  userAction: "Correct inputs and continue from the recovery hint.",
};

const modelRetry: RetryPolicy = {
  retryable: true,
  maxAttempts: 2,
  backoffMs: 1000,
  userAction: "Retry the model call, or edit confirmed inputs and retry.",
};

const ingestRetry: RetryPolicy = {
  retryable: true,
  maxAttempts: 3,
  backoffMs: 0,
  userAction: "Upload a cleaner CSV or use the sample file.",
};

export const TRANSITION_META: Record<WorkflowState, TransitionMeta> = {
  INGESTING: {
    requiredInputs: ["csvFile"],
    allowedNext: ["UNDERSTANDING_REVIEW", "INGESTION_FAILED", "MODEL_OUTPUT_INVALID"],
    invalidateDownstream: [
      "companyUnderstanding",
      "confirmedProfile",
      "questions",
      "answers",
      "researchBrief",
      "finalPrompt",
      "formattedPrompt",
    ],
    retryPolicy: ingestRetry,
    recoveryHint: "Upload a company CSV to begin analysis.",
  },
  UNDERSTANDING_REVIEW: {
    requiredInputs: ["companyUnderstanding"],
    allowedNext: [
      "INTERVIEWING",
      "OWNER_CORRECTION_REQUIRED",
      "MODEL_OUTPUT_INVALID",
      "INGESTING",
    ],
    invalidateDownstream: [
      "confirmedProfile",
      "questions",
      "answers",
      "researchBrief",
      "finalPrompt",
      "formattedPrompt",
    ],
    retryPolicy: noRetry,
    recoveryHint: "Confirm, correct, or reject each field before interviewing.",
  },
  INTERVIEWING: {
    requiredInputs: ["confirmedProfile"],
    allowedNext: [
      "BRIEF_REVIEW",
      "INTERVIEWING",
      "DOCUMENT_EXTRACTION_FAILED",
      "MODEL_OUTPUT_INVALID",
      "OWNER_CORRECTION_REQUIRED",
      "UNDERSTANDING_REVIEW",
    ],
    invalidateDownstream: ["researchBrief", "finalPrompt", "formattedPrompt"],
    retryPolicy: modelRetry,
    recoveryHint: "Answer the material question, or attach a supporting document.",
  },
  BRIEF_REVIEW: {
    requiredInputs: ["confirmedProfile", "answers"],
    allowedNext: [
      "GENERATING_PROMPT",
      "BRIEF_REVIEW",
      "MODEL_OUTPUT_INVALID",
      "INTERVIEWING",
    ],
    invalidateDownstream: ["finalPrompt", "formattedPrompt"],
    retryPolicy: modelRetry,
    recoveryHint: "Edit the brief until it matches owner intent, then generate the prompt.",
  },
  GENERATING_PROMPT: {
    requiredInputs: ["researchBrief", "confirmedProfile"],
    allowedNext: [
      "PROMPT_EXPORTED",
      "PROMPT_VALIDATION_FAILED",
      "MODEL_OUTPUT_INVALID",
      "BRIEF_REVIEW",
    ],
    invalidateDownstream: ["finalPrompt", "formattedPrompt"],
    retryPolicy: modelRetry,
    recoveryHint: "Wait for compilation, or return to the brief if validation fails.",
  },
  PROMPT_EXPORTED: {
    requiredInputs: ["finalPrompt", "formattedPrompt"],
    allowedNext: ["BRIEF_REVIEW", "INGESTING"],
    invalidateDownstream: [],
    retryPolicy: noRetry,
    recoveryHint: "Copy or download the research prompt. Edit the brief to regenerate.",
  },
  INGESTION_FAILED: {
    requiredInputs: [],
    allowedNext: ["INGESTING"],
    invalidateDownstream: [
      "companyUnderstanding",
      "confirmedProfile",
      "questions",
      "answers",
      "researchBrief",
      "finalPrompt",
      "formattedPrompt",
    ],
    retryPolicy: ingestRetry,
    recoveryHint: "Fix the CSV (encoding, size, columns) and upload again.",
  },
  MODEL_OUTPUT_INVALID: {
    requiredInputs: [],
    allowedNext: [
      "INGESTING",
      "UNDERSTANDING_REVIEW",
      "INTERVIEWING",
      "BRIEF_REVIEW",
      "GENERATING_PROMPT",
    ],
    invalidateDownstream: [],
    retryPolicy: modelRetry,
    recoveryHint: "Retry the last operation. If it persists, tighten confirmed inputs.",
  },
  DOCUMENT_EXTRACTION_FAILED: {
    requiredInputs: [],
    allowedNext: ["INTERVIEWING"],
    invalidateDownstream: [],
    retryPolicy: {
      retryable: true,
      maxAttempts: 2,
      backoffMs: 0,
      userAction: "Try a different PDF/DOCX/TXT, or paste the answer manually.",
    },
    recoveryHint: "Skip the attachment or use a simpler text document.",
  },
  OWNER_CORRECTION_REQUIRED: {
    requiredInputs: [],
    allowedNext: ["UNDERSTANDING_REVIEW", "INTERVIEWING"],
    invalidateDownstream: ["researchBrief", "finalPrompt", "formattedPrompt"],
    retryPolicy: noRetry,
    recoveryHint: "Resolve rejected or contradictory fields before continuing.",
  },
  PROMPT_VALIDATION_FAILED: {
    requiredInputs: ["researchBrief"],
    allowedNext: ["GENERATING_PROMPT", "BRIEF_REVIEW"],
    invalidateDownstream: ["finalPrompt", "formattedPrompt"],
    retryPolicy: modelRetry,
    recoveryHint: "Regenerate the prompt, or edit the brief to restore required sections.",
  },
};

/** Legacy AppStage → WorkflowState (for localStorage migration). */
export const LEGACY_STAGE_TO_WORKFLOW: Record<AppStage, WorkflowState> = {
  ingestion: "INGESTING",
  understanding: "UNDERSTANDING_REVIEW",
  interview: "INTERVIEWING",
  brief: "BRIEF_REVIEW",
  prompt: "PROMPT_EXPORTED",
};

/** Optional project hints so failure states recover onto the right UI rail. */
export type AppStageHints = {
  hasUnderstanding?: boolean;
  hasConfirmedProfile?: boolean;
  hasBrief?: boolean;
  hasFinalPrompt?: boolean;
};

/** WorkflowState → UI AppStage (five-rail mapping). */
export function toAppStage(state: WorkflowState, hints: AppStageHints = {}): AppStage {
  switch (state) {
    case "INGESTING":
    case "INGESTION_FAILED":
      return "ingestion";
    case "UNDERSTANDING_REVIEW":
    case "OWNER_CORRECTION_REQUIRED":
      return "understanding";
    case "INTERVIEWING":
    case "DOCUMENT_EXTRACTION_FAILED":
      return "interview";
    case "BRIEF_REVIEW":
    case "PROMPT_VALIDATION_FAILED":
      return "brief";
    case "GENERATING_PROMPT":
    case "PROMPT_EXPORTED":
      return "prompt";
    case "MODEL_OUTPUT_INVALID":
      if (hints.hasFinalPrompt) return "prompt";
      if (hints.hasBrief) return "brief";
      if (hints.hasConfirmedProfile) return "interview";
      if (hints.hasUnderstanding) return "understanding";
      return "ingestion";
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

export function isWorkflowState(value: unknown): value is WorkflowState {
  return (
    typeof value === "string" &&
    (WORKFLOW_STATES as readonly string[]).includes(value)
  );
}

export function isFailureState(state: WorkflowState): boolean {
  return (FAILURE_WORKFLOW_STATES as readonly string[]).includes(state);
}

export function canTransition(from: WorkflowState, to: WorkflowState): boolean {
  return TRANSITION_META[from].allowedNext.includes(to);
}

/**
 * Recorded when an action attempts an illegal transition. Kept separate from
 * `lastFailureCode`, which is reserved for real operation failures
 * (model/ingest/validation), so diagnostics never mask a user-facing failure.
 */
export type WorkflowDiagnostic = {
  code: "ILLEGAL_TRANSITION";
  from: WorkflowState;
  attemptedTo: WorkflowState;
  action: string;
  occurredAt: string;
};

export function getInvalidateDownstream(from: WorkflowState, to: WorkflowState) {
  if (!canTransition(from, to) && from !== to) {
    return TRANSITION_META[to].invalidateDownstream;
  }
  return TRANSITION_META[to].invalidateDownstream;
}

export function getRetryPolicy(state: WorkflowState): RetryPolicy {
  return TRANSITION_META[state].retryPolicy;
}

export function getRecoveryHint(state: WorkflowState): string {
  return TRANSITION_META[state].recoveryHint;
}

/** Normalize stored stage strings (legacy AppStage or WorkflowState). */
export function normalizeWorkflowState(value: unknown): WorkflowState {
  if (isWorkflowState(value)) return value;
  if (typeof value === "string" && value in LEGACY_STAGE_TO_WORKFLOW) {
    return LEGACY_STAGE_TO_WORKFLOW[value as AppStage];
  }
  return "INGESTING";
}
