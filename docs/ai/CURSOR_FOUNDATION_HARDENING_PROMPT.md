# Cursor Foundation Hardening Prompt

> Use this prompt when continuing foundation work. Do **not** expand customer-facing product scope.

## Governing sentence

The current product ends after generating, validating, and exporting one company-specific ChatGPT research prompt. All architecture and AI operations must directly support the quality, safety, traceability, or usability of that prompt.

## First actions

1. Run `npm run doctor` and read the report.
2. Read `AGENTS.md` → `project-knowledge/README.md` → `project-knowledge/CURRENT_STATE.md`.
3. Prefer smallest change that improves Accuracy, Specificity, Research Depth, or Repeatability of the exported prompt.

## In scope

- Three-plane boundaries (Product / AI Control / Engineering Intelligence)
- State machine, contracts, context compiler, AI op registry, traces, decision ledger
- Prompt contract lint + industry eval fixtures
- Guardian / knowledge inventories / APS / read-only RPB MCP
- CI doctor/verify; MCP profiles (development on, research-future off)
- Narrative governance for interview + master prompt (ethical TARI, Dance, story lens)

## Out of scope

- Research execution inside the app
- Topic / script / video / seven-scene generation
- Multi-agent debates, generic filesystem/shell MCP, write MCP tools
- Auto-rewriting PRODUCT.md / ARCHITECTURE.md / SECURITY.md / DECISIONS
- Enabling `rpb-research-future` YouTube MCP

## Definition of done for foundation tasks

- Code + typed contracts updated
- Prompt versions bumped when prompts change
- Unit/eval tests added
- Traces / degraded modes considered
- Docs + CURRENT_STATE updated honestly
- `npm run doctor` and `npm run verify` pass (or failures explained)
- No Guardian hard failures
