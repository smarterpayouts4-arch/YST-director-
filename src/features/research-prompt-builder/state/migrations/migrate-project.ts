import type { ResearchPromptProject } from "@/features/research-prompt-builder/types";
import {
  CURRENT_STORAGE_VERSION,
  getMigrationPath,
  type StoredProjectEnvelope,
} from "@/features/research-prompt-builder/state/migrations/registry";
import { normalizeWorkflowState } from "@/features/research-prompt-builder/state/workflow-states";

function isEnvelope(value: unknown): value is StoredProjectEnvelope {
  return (
    !!value &&
    typeof value === "object" &&
    "storageVersion" in value &&
    "project" in value &&
    typeof (value as StoredProjectEnvelope).storageVersion === "number"
  );
}

function looksLikeLegacyProject(value: unknown): value is ResearchPromptProject {
  return (
    !!value &&
    typeof value === "object" &&
    "projectId" in value &&
    "currentStage" in value &&
    !("storageVersion" in value)
  );
}

export function wrapProject(project: ResearchPromptProject): StoredProjectEnvelope {
  return {
    storageVersion: CURRENT_STORAGE_VERSION,
    savedAt: new Date().toISOString(),
    project: {
      ...project,
      currentStage: normalizeWorkflowState(project.currentStage),
    },
  };
}

export function unwrapAndMigrate(raw: unknown): ResearchPromptProject | null {
  try {
    if (isEnvelope(raw)) {
      let project = raw.project as unknown;
      let version = raw.storageVersion;
      if (version > CURRENT_STORAGE_VERSION) return null;
      if (version < CURRENT_STORAGE_VERSION) {
        for (const step of getMigrationPath(version, CURRENT_STORAGE_VERSION)) {
          project = step.migrate(project);
          version = step.to;
        }
      }
      const normalized = project as ResearchPromptProject;
      return {
        ...normalized,
        currentStage: normalizeWorkflowState(normalized.currentStage),
      };
    }

    if (looksLikeLegacyProject(raw)) {
      // Bare v1 project → run v1→v2 migration
      const path = getMigrationPath(1, CURRENT_STORAGE_VERSION);
      let project: unknown = raw;
      for (const step of path) {
        project = step.migrate(project);
      }
      const normalized = project as ResearchPromptProject;
      return {
        ...normalized,
        currentStage: normalizeWorkflowState(normalized.currentStage),
      };
    }

    return null;
  } catch {
    return null;
  }
}
