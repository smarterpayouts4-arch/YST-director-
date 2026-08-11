import type { AppStage } from "@/features/research-prompt-builder/config/constants";

export function stageWhy(uiStage: AppStage): string | undefined {
  if (uiStage === "ingestion") {
    return "Start with real company data, not guesswork.";
  }
  if (uiStage === "interview") {
    return "Same Decide step. Lock focus, then refine — prior decisions stay visible.";
  }
  if (uiStage === "understanding") {
    return "Wrong facts here become wrong research later.";
  }
  if (uiStage === "brief") {
    return "This brief writes the final research prompt.";
  }
  if (uiStage === "prompt") {
    return "Copy into ChatGPT. Research runs there, not here.";
  }
  return undefined;
}
