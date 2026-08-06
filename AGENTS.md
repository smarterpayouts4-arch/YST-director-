# AGENTS.md — Research Prompt Builder

The current product ends after generating, validating, and exporting one company-specific ChatGPT research prompt. All architecture and AI operations must directly support the quality, safety, traceability, or usability of that prompt.

## Cold-start order

1. This file (`AGENTS.md`)
2. `project-knowledge/README.md`
3. `project-knowledge/CURRENT_STATE.md`
4. Task-specific canonical document (`PRODUCT.md`, `PROMPT_CONTRACT.md`, feature note, etc.)
5. Relevant source under `src/`

Prefer RPB MCP bootstrap when available: `rpb_get_agent_bootstrap`.

## Four outcomes

| Outcome | Meaning |
|---------|---------|
| **Accuracy** | Facts, owner decisions, hypotheses, and restrictions stay correctly labeled. |
| **Specificity** | Company-specific prompts; generic filler is a defect. |
| **Research Depth** | Disconfirming evidence, competitor classification, demand evidence, focused experiments. |
| **Repeatability** | Stable eight-section contract and IR provenance across runs. |

## Planes

- **Product** — UI stages, local state, export
- **AI Control** — runtime prompts, schemas, structured LLM calls
- **Engineering Intelligence** — `project-knowledge/`, APS, read-only MCP, agent-learning

Invariant: `Project Knowledge ≠ Agent Prompt System ≠ Product MCP ≠ Runtime Product Prompts`

## MCP note

- **RPB MCP** (`rpb_*`) is the primary project-intelligence MCP (read-only, document IDs).
- **Context7** is for technical library documentation only — never product truth.
- Do not use filesystem/shell/write MCP as product intelligence for this MVP.

## Learning

Propose via `agent-learning/`; human approval required for permanence. Never auto-rewrite this file or canonical doctrine.

## Evidence labels

Verified · Partially verified · Not verified · Blocked · Assumed
