# APS Intent Compiler Audit

Frozen snapshot: 2026-08-07  
Vocabulary in operational docs uses Live / Partial / Planned. **Numeric scores below are snapshot judgments for this audit only** — do not copy them into `SYSTEM.md`, `CURRENT_STATE.md`, workflows, or Cursor adapters.

## Verdict

Live APS (pre-upgrade) was a **lean advisory kit**, not an LLM middleware layer and not yet an intent compiler.

| Claim vs reality | Fact |
|---|---|
| Interprets prompts with an APS LLM | **False** — no APS LLM calls; Cursor model judges against guidance |
| Personas | **Absent** live; archive-only under `Reference/archives/marketmonth/agent-prompt-system/personas/` |
| Soft hooks | **Absent** — install copies rules + skill only |
| Aware of product APIs | **Boundary yes, surface no** — pointers to `project-knowledge/` + MCP inventories |
| Compiles a task contract | Was **Partial** (prose task spec); upgrade target is semantic IntentContract (markdown-first) |

### Snapshot scores (audit only)

| Lens | Score |
|---|---|
| Composite vs intent-compiler vision | **4 / 10** |
| Packaging + plane separation | **6.5 / 10** |
| Enforcement / compile fidelity | **2.5 / 10** |
| API/surface awareness alone | **2–3 / 10** (rises when pointers → PK → MCP are followed) |

External rubric: rules/skills without hooks typically land 3–4/10 as middleware. True middleware needs structured decisions + tool gates outside model discretion.

## What already worked

- Plane separation: Project Knowledge ≠ APS ≠ Product MCP ≠ Runtime Product Prompts
- Pointer stubs → canon (do not copy doctrine into always-on rules)
- Lean 7-workflow catalog
- Evidence-label vocabulary
- Product patterns worth borrowing (not merging planes): owner-only questions, CORE as information requirements, real evidence identities

## Instruction sources (no claimed global Cursor ordering)

**Cursor-controlled mechanisms:** user instructions/rules, project rules, `AGENTS.md`, relevant Agent Skills, conversation context.

**Repository sources discoverable by the agent:** `project-knowledge/**`, APS workflows, `src/`, tests, specs, generated maps.

**Product runtime (code-ordered):** Zod → validators → formatter → `prompts/*.ts` → export or failure.

## Target (post this upgrade)

Intent compiler: Raw intent → discovery → resolution → clarification gate → IntentContract → boring render → verification.

Governing invariants live in `agent-prompt-system/SYSTEM.md`.

## Gate C — enforcement deferred

Building enforcement for failures that have not happened is how these systems go wrong.

Do **not** add hooks, contract-presence gates, or fail-closed tooling until measured correction-cost failures justify them:

- Intent correction rate stays high after Gate A/B
- Agents repeatedly skip contracts on substantial work
- Model inference repeatedly promotes into requirements despite documentation

When earned, prefer Skill/reminder and narrow `preToolUse` checks over `beforeSubmitPrompt` prompt rewriting (documented Cursor reliability issues).

## Product plane note

Product interview/brief provenance is a **separate track** from Engineering APS. Do not merge product prompts into APS.
