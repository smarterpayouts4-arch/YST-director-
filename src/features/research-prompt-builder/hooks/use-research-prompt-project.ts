"use client";

import { useEffect, useReducer, useState } from "react";
import {
  createEmptyProject,
  projectReducer,
} from "@/features/research-prompt-builder/state/project-reducer";
import {
  clearProject,
  loadProject,
  saveProject,
} from "@/features/research-prompt-builder/state/project-storage";

export function useResearchPromptProject() {
  const [state, dispatch] = useReducer(projectReducer, undefined, createEmptyProject);
  const [hydrated, setHydrated] = useState(false);
  const [restoredFromStorage, setRestoredFromStorage] = useState(false);

  useEffect(() => {
    const existing = loadProject();
    if (existing) {
      dispatch({ type: "HYDRATE", project: existing });
      setRestoredFromStorage(true);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveProject(state);
  }, [state, hydrated]);

  const reset = () => {
    clearProject();
    setRestoredFromStorage(false);
    dispatch({ type: "RESET" });
  };

  return { state, dispatch, hydrated, restoredFromStorage, reset };
}
