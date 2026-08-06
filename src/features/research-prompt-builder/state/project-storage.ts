import { STORAGE_KEY } from "@/features/research-prompt-builder/config/constants";
import type { ResearchPromptProject } from "@/features/research-prompt-builder/types";
import {
  unwrapAndMigrate,
  wrapProject,
} from "@/features/research-prompt-builder/state/migrations/migrate-project";

export function loadProject(): ResearchPromptProject | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return unwrapAndMigrate(parsed);
  } catch {
    return null;
  }
}

export function saveProject(project: ResearchPromptProject): void {
  if (typeof window === "undefined") return;
  const envelope = wrapProject(project);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
}

export function clearProject(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
