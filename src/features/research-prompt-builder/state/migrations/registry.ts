import type { ResearchPromptProject } from "@/features/research-prompt-builder/types";
import { normalizeWorkflowState } from "@/features/research-prompt-builder/state/workflow-states";

export const CURRENT_STORAGE_VERSION = 2;

export type StoredProjectEnvelope = {
  storageVersion: number;
  savedAt: string;
  project: ResearchPromptProject;
};

export type Migration = {
  from: number;
  to: number;
  migrate: (project: unknown) => ResearchPromptProject;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

/** v1: bare ResearchPromptProject with legacy AppStage currentStage strings. */
function migrateV1ToV2(project: unknown): ResearchPromptProject {
  const raw = asRecord(project);
  const currentStage = normalizeWorkflowState(raw.currentStage);
  return {
    ...(raw as unknown as ResearchPromptProject),
    version: 1,
    currentStage,
    questions: Array.isArray(raw.questions) ? (raw.questions as ResearchPromptProject["questions"]) : [],
    answers: Array.isArray(raw.answers) ? (raw.answers as ResearchPromptProject["answers"]) : [],
    currentQuestionIndex:
      typeof raw.currentQuestionIndex === "number" ? raw.currentQuestionIndex : 0,
    projectId: typeof raw.projectId === "string" ? raw.projectId : `proj_${Date.now().toString(36)}`,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : new Date().toISOString(),
    ingestion: (raw.ingestion as ResearchPromptProject["ingestion"]) ?? {},
  };
}

export const migrations: Migration[] = [
  {
    from: 1,
    to: 2,
    migrate: migrateV1ToV2,
  },
];

export function getMigrationPath(from: number, to: number): Migration[] {
  const path: Migration[] = [];
  let version = from;
  while (version < to) {
    const step = migrations.find((m) => m.from === version);
    if (!step) {
      throw new Error(`No migration registered from storage version ${version}`);
    }
    path.push(step);
    version = step.to;
  }
  return path;
}
