# CURRENT_STATE — Research Prompt Builder MVP

Freshness: `current` · Last reviewed: 2026-08-06 (foundation-9 hardening pass)

Use vocabulary literally: Live · Partial · Prototype · Mocked · Planned · Blocked · Deprecated.

## Governing sentence

The current product ends after generating, validating, and exporting one company-specific ChatGPT research prompt. All architecture and AI operations must directly support the quality, safety, traceability, or usability of that prompt.

## Product journey

| Area | Status | Notes |
|------|--------|-------|
| CSV / document ingestion | Live | Allowlisted extract + evidence packet; sanitize + limits |
| Company understanding | Live | Structured analyst + owner confirm/correct/reject |
| Adaptive interview (one question) | Live | Next-question API + ethical TARI UX |
| Research brief | Live | Build + owner edit path |
| Final prompt generate/validate/export | Live | Eight-section formatter + prompt-contract lint |
| Workflow state machine | Live | Reducer hard-enforces `canTransition`; illegal moves rejected with `WorkflowDiagnostic` (tested) |
| Auth / multi-user / DB | Planned | Explicit non-goal for MVP |
| Research execution / topics / video | Planned / Out of MVP | Owner runs prompt in ChatGPT |

## AI Control plane

| Area | Status | Notes |
|------|--------|-------|
| Runtime prompts under `prompts/` | Live | Narrative governance + versioned |
| Zod schemas + structured OpenAI | Live | Repair-once path present |
| Versioned contract registry | Live | `src/ai/contracts/` |
| Context compiler | Live | `src/ai/context/` assemblers + budgets + redact |
| AI operation registry + AiTrace | Live | `src/ai/operations/` + `src/ai/traces/` |
| Decision ledger | Live (derived) | Rebuilt-on-read inside brief + prompt context compilers; never persisted separately (tested) |
| Config modules + storage migrations | Live | `src/config/` + envelope migrations |
| Prompt contract lint | Live | Semantic validators on formatted Markdown |
| Industry eval fixtures (6) | Live | `tests/evals/` |
| Prompt injection defenses | Partial | Instruction/data separation; red-team fixture; detection advisory |

## Engineering Intelligence plane

| Area | Status | Notes |
|------|--------|-------|
| Live `project-knowledge/` doctrine | Live | This tree |
| Knowledge update/check/guardian | Live | Writes only under `generated/` |
| Lean RPB MCP (`rpb_*`) | Live in repo / Partial in Cursor | Smoke + allowlist tests pass; connect via `.cursor/mcp.json` (copy example) |
| Agent Prompt System (lean) | Live | Cursor adapters via `agent:install` |
| `agent-learning/` approval path | Partial | Propose/review scripts only; approval is manual (by design), no approve automation |
| MCP profiles (`docs/ai/mcp-profiles.yaml`) | Live (policy) | `rpb-development` on paper; owner must align Cursor MCP settings |
| CI three-tier | Partial | GitHub Actions verify + generated-maps bot PR are Live; precommit-fast exists but is not hook-wired |
| Docker packaging of RPB MCP | Planned | Not required; host stdio preferred |

## Verification

| Area | Status | Notes |
|------|--------|-------|
| Unit + eval tests (vitest) | Live | Ingestion, formatter, reducer, ledger, prompt contract + scope-boundary evals |
| API route tests | Live | Five route suites (mocked services) + structured-openai service tests + schema-valid fixtures |
| `npm run doctor` | Live | Architecture health report |
| `npm run verify` | Live | lint + typecheck + test + knowledge + APS + MCP + build + E2E |
| E2E (playwright) | Live (mocked) | `playwright.config.ts` on port 3100; full owner journey with all model APIs mocked; prod server in CI |
| Dependabot | Live | Weekly npm + github-actions updates; MCP SDK majors held back by policy |

## Honest gaps

- Full LLM-backed evals against live models are not a merge gate (deterministic contract lint is).
- Copy `.cursor/mcp.json.example` → `.cursor/mcp.json` locally to load RPB MCP in Cursor.
- Cursor's currently enabled MCP servers (Docker gateway with GitHub write tools, Perplexity, RepoBrain) do not match the `rpb-development` policy; owner action required — see `docs/ai/MCP_LOCKDOWN.md`.
- The conditional-question cap (max 2) is code-enforced with one targeted repair; a persistent violation ends the interview only when all core decisions are resolved, otherwise `MODEL_OUTPUT_INVALID`.
- E2E mocks all model APIs by design; no test exercises live OpenAI (deterministic contract lint is the gate).
- Branch protection on `main` requires the first remote CI run before the check name can be required (owner-approved action).
- Root-level duplicate files under `Reference/` are legacy copies; prefer organized paths.
- Do not treat `Reference/archives/marketmonth` as live product truth.
