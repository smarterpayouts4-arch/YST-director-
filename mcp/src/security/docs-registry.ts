/**
 * Allowlisted project documents for RPB MCP.
 * Tools must use document IDs only — never arbitrary paths from model input.
 */
export const PROJECT_DOCS = {
  product: "project-knowledge/PRODUCT.md",
  architecture: "project-knowledge/ARCHITECTURE.md",
  currentState: "project-knowledge/CURRENT_STATE.md",
  current_state: "project-knowledge/CURRENT_STATE.md",
  ux: "project-knowledge/UX.md",
  promptContract: "project-knowledge/PROMPT_CONTRACT.md",
  security: "project-knowledge/SECURITY.md",
  tooling: "project-knowledge/TOOLING.md",
  definitionOfDone: "project-knowledge/DEFINITION-OF-DONE.md",
  knowledgeReadme: "project-knowledge/README.md",
  ownershipRules: "project-knowledge/ownership-rules.json",
  qualityRules: "project-knowledge/quality-rules.json",

  featureIngestion: "project-knowledge/FEATURES/ingestion.md",
  featureUnderstanding: "project-knowledge/FEATURES/understanding.md",
  featureInterview: "project-knowledge/FEATURES/interview.md",
  featureResearchBrief: "project-knowledge/FEATURES/research-brief.md",
  featureFinalPrompt: "project-knowledge/FEATURES/final-prompt.md",

  adr0001: "project-knowledge/DECISIONS/0001-three-plane-separation.md",
  adr0002: "project-knowledge/DECISIONS/0002-read-only-mcp.md",
  adr0003: "project-knowledge/DECISIONS/0003-learning-approval-gate.md",
  adr0004: "project-knowledge/DECISIONS/0004-no-auto-rewrite-canon.md",

  agents: "AGENTS.md",

  docs_index: "project-knowledge/generated/indexes/docs-index.json",
  agentBootstrap: "project-knowledge/generated/indexes/agent-bootstrap.json",
  referenceIndex: "project-knowledge/generated/indexes/reference-index.json",
  repositoryTree: "project-knowledge/generated/maps/repository-tree.json",
  routesMap: "project-knowledge/generated/maps/routes.json",
  schemasMap: "project-knowledge/generated/maps/schemas.json",
  runtimePromptsMap: "project-knowledge/generated/maps/runtime-prompts.json",
  guardianReport: "project-knowledge/generated/reports/GUARDIAN.md",
  structureWarnings: "project-knowledge/generated/reports/STRUCTURE_WARNINGS.md",

  // Reference concepts + manifest (advisory)
  referenceManifest: "Reference/manifest.json",
  refObserveThinkAct: "Reference/concepts/observe-think-act.md",
  refProgressiveLearning: "Reference/concepts/progressive-learning.md",
  refMcpBoundaries: "Reference/concepts/mcp-boundaries.md",
  refEthicalTari: "Reference/concepts/ethical-tari-interview-ux.md",
  refPromptQuality: "Reference/concepts/compelling-master-prompt-quality.md",
  refHumanApproval: "Reference/concepts/human-approval-gates.md",
  refDefinitionOfDone: "Reference/concepts/definition-of-done.md",
  refLivingProjectTree: "Reference/concepts/living-project-tree.md",
  refStoryHook: "Reference/concepts/story-and-hook-for-research-prompts.md",
} as const;

export type ProjectDocId = keyof typeof PROJECT_DOCS;

export const MCP_WRITE_FORBIDDEN_PREFIXES = [
  "project-knowledge/",
  "src/",
  "agent-prompt-system/",
  "agent-learning/",
] as const;
