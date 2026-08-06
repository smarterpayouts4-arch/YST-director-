# Project Knowledge — Research Prompt Builder

Canonical product and engineering truth for **Research Prompt Builder (RPB)**.

## Authority

| Layer | Role |
|-------|------|
| `project-knowledge/` (this tree) | Canonical doctrine and generated indexes |
| `AGENTS.md` | Cold-start entry for agents |
| `agent-prompt-system/` | Process / workflow routing (pointers only) |
| `mcp/` | Read-only context tools over allowlisted docs |
| `src/features/**/prompts/` | Runtime product LLM prompts (separate) |
| `Reference/` | Advisory only — never product SoT |

## Invariant

```text
Project Knowledge ≠ Agent Prompt System ≠ Product MCP ≠ Runtime Product Prompts
```

## Cold-start order

1. `AGENTS.md`
2. This README
3. `CURRENT_STATE.md`
4. Task-specific canonical doc (`PRODUCT.md`, `PROMPT_CONTRACT.md`, feature note, etc.)
5. Relevant source under `src/`

## Regenerating indexes

```bash
npm run knowledge:update
npm run knowledge:check
npm run knowledge:guardian
```

Scripts write **only** under `project-knowledge/generated/`. Human doctrine must never be auto-rewritten.

## Status vocabulary

`Live` · `Partial` · `Prototype` · `Mocked` · `Planned` · `Blocked` · `Deprecated`

Freshness: `current` · `stale` · `historical` · `superseded`

## Evidence labels (completion reports)

`Verified` · `Partially verified` · `Not verified` · `Blocked` · `Assumed`
