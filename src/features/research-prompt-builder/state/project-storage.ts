import { STORAGE_KEY } from "@/features/research-prompt-builder/config/constants";
import type { ResearchPromptProject } from "@/features/research-prompt-builder/types";

export function loadProject(): ResearchPromptProject | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ResearchPromptProject;
    if (parsed?.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveProject(project: ResearchPromptProject): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
}

export function clearProject(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
