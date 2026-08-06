/**
 * Plane boundaries for Research Prompt Builder.
 * Planes communicate through typed contracts only.
 */
export type ArchitecturePolicy = {
  planes: {
    product: "src/features/research-prompt-builder";
    aiControl: "src/ai";
    engineeringIntelligence: "project-knowledge | mcp | agent-prompt-system";
  };
  forbidden: {
    /** Product UI must not embed prompt instruction strings. */
    promptsInRouteHandlers: true;
    /** Prompts must not import React/UI. */
    reactInPrompts: true;
    /** Client bundles must not import server-only AI SDKs. */
    openaiInClient: true;
    /** MCP remains read-only observation — never product write path. */
    mcpProductWrites: true;
  };
  mvpBoundary: "Stop after validating and exporting one company-specific research prompt.";
};

export function getArchitecturePolicy(): ArchitecturePolicy {
  return {
    planes: {
      product: "src/features/research-prompt-builder",
      aiControl: "src/ai",
      engineeringIntelligence: "project-knowledge | mcp | agent-prompt-system",
    },
    forbidden: {
      promptsInRouteHandlers: true,
      reactInPrompts: true,
      openaiInClient: true,
      mcpProductWrites: true,
    },
    mvpBoundary:
      "Stop after validating and exporting one company-specific research prompt.",
  };
}

/** Thin re-export surface for env — do not break existing `@/lib/env` imports. */
export { getEnv, requireOpenAIKey } from "@/lib/env";
export type { AppEnv } from "@/lib/env";
