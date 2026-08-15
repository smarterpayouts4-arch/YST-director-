# CURRENT_STATE — Research Prompt Builder MVP

Freshness: `current` · Last reviewed: 2026-08-14 (P1A frozen ef0c9e1 · P1B story brain `ci-shorts-1.5.4` + density UI · P1C production)

Use vocabulary literally: Live · Partial · Prototype · Mocked · Planned · Blocked · Deprecated.

## Governing sentence

Research Prompt Builder remains Live through research-prompt export. Content Intelligence Librarian MVP is frozen: completed external research is ingested into a governed library. Topic Engine is Live (`ci-topics-1.1.9`; freeze deferred pending smoke) and must consume only `PublishedLibraryDto`. Social Media is organizational hub (nav only); YouTube Shorts is Partial (P1A frozen; P1B seven-scene storyboard + density UI; P1C production expansion + Copy export).

## Product journey

| Area | Status | Notes |
|------|--------|-------|
| CSV / document ingestion | Live | Allowlisted extract + evidence packet; sanitize + limits |
| Company understanding | Live | Structured analyst + five-section Looks right confirmation |
| Adaptive interview (one question) | Live | Next-question API + ethical TARI UX; no target question count; strategy cards when strategic priorities unresolved (at most once) |
| Research brief | Live | Build + owner edit path |
| Final prompt generate/validate/export | Live | Eight-section formatter + Prompt Contract 1.1 lint (anchored research controls; section-7 opportunity-shaped experiments). Hard stage boundary before Content Intelligence. |
| Content Intelligence Librarian | Live | **MVP frozen** on `ci-librarian-1.1.1` + `gpt-5.6-terra` (medium). ZYNAVA published DTO smoke passed (equivalence-first opportunity, evaluated hypotheses, moment/tension, competitors/restrictions/limitations; DTO scoped to active artifact). Send replaces active Library with a fresh `libraryId` (no multi-paste item accumulation). Do not change extract prompt, model, curator, or kinds without a new freeze. P2: summary 6-item cap can hide `isHypothesis` items filed as `other`. |
| Topic Engine | Live | **`ci-topics-1.1.9`** + `TOPIC_ENGINE_MODEL`/`gpt-5.6-sol` (Librarian stays Terra). **Freeze deferred** pending owner six-topic + Atom smoke. Rail: Topics `07` → Atom `08`. 1.1.9: compact Topic Strategy Doctrine (curiosity = unresolved distinction; latent LoD quality lens); supportingItemIds = Atom creator intelligence substrate (non-fact thesis carriers allowed); Atom `supportingInsights` topic-relative over fact\|competitor\|opportunity\|tension\|demand (never audience/moment; score-all-zero fail-open facts then tension\|opportunity). Teaching floor ≥2 + decision-rule extras retained. Curate resolves hypothesis/unresolved itemIds→statements once. Back-to-Topics keeps six topics; re-select mints new `topicPacketId`. **Step 8 handoff UI** exports Canonical Topic Packet JSON/Markdown. No Marketing-folder RAG or Atom synthesis LLM. Ready CTA **Send to Social Media** (IDs only; no channel ingest). |
| Social Media | Partial | Organizational hub only (`/social-media` — Shorts card; no shared creative brain; no Atom store). |
| YouTube Shorts | Partial | **P1A frozen** at `ef0c9e1`. **P1B storyboard** — `YOUTUBE_SHORTS_MODEL` / Terra; Shorts Story Brain (`brain/` MD → `story-brain.ts`); one `generate-shorts-storyboard` locks `storyArchitecture` (`hookWhy`, `beats[].because`) then writes exactly 7 scenes (`ci-shorts-1.5.4`: spoken first-hearing language, Hook procedure, causal beats, 22-word narration budget, spoken rewrite pairs, concept naming / two-beat payoff, repeated-bigram echo check, closed-world locations, spoken-only analyst idioms, payoff compression); owner edit/approve; no AI on mount. **P1C production** — one `expand-shorts-production`; sibling production schema; generated/working production; narration/OST merge-on-export; Copy ×3; no `approvedProduction`; no renderer. Storage `social-media-youtube-shorts:v1`. Reference HOW at `Reference/channels/youtube-shorts/` (no runtime import). |
| Workflow state machine (RPB) | Live | Reducer hard-enforces `canTransition`; illegal moves rejected with `WorkflowDiagnostic` (tested) |
| Auth / multi-user / cloud DB | Planned | Explicit non-goal for current MVP development |
| Research execution / video | Planned / Out of MVP | Owner runs prompt in ChatGPT externally |

## AI Control plane

| Area | Status | Notes |
|------|--------|-------|
| Runtime prompts under `prompts/` | Live | Narrative governance + versioned |
| Zod schemas + structured OpenAI | Live | Feature-neutral gateway at `src/ai/structured-output/`; RPB adapter injects RPB repair/version. Repair policy via `getRepairPolicy` (≤2 for final compile; ≤1 otherwise); null-parse not repaired |
| Versioned contract registry | Live | `src/ai/contracts/` |
| Context compiler | Live | `src/ai/context/` assemblers + budgets + redact |
| AI operation registry + AiTrace | Live (catalog + mechanical doctor) | `AiOperationId` derived from registry keys; public ops declare `schemaName`; doctor/tests fail on drift. AiTrace typed (`repairAttempts`/`finalValidation`); in-memory only (no product UI) |
| Interview→brief authority | Live | Shared `canCompleteInterview`; server enforces on next-question **and** brief build |
| Decision ledger | Live (derived) | Rebuilt-on-read inside brief + prompt context compilers; never persisted separately (tested) |
| Brief fieldProvenance sidecar | Live | Exhaustive per-field origins on `ResearchBrief`; `EDIT_BRIEF` → `owner_brief_edit` |
| Config modules + storage migrations | Live | `src/config/upload-policy.ts` + envelope migrations (unused parallel policy modules removed) |
| Prompt contract lint | Live | Rule-table checklist + bucketed distinctive-anchor coverage for six research controls; thin-CSV degradation reported in traces |
| Industry eval fixtures (6) | Live | `tests/evals/` |
| Prompt injection defenses | Partial | Instruction/data separation; red-team fixture; detection advisory |

## Engineering Intelligence plane

| Area | Status | Notes |
|------|--------|-------|
| Live `project-knowledge/` doctrine | Live | This tree |
| Knowledge update/check/guardian | Live | Writes only under `generated/`; living maps are **inventory**, not an AI Control authority verifier (see `TOOLING.md`) |
| Lean RPB MCP (`rpb_*`) | Live in repo / Partial in Cursor | Smoke + allowlist tests pass; connect via `.cursor/mcp.json` (copy example) |
| Agent Prompt System (intent compiler) | Live packaging / Partial compile fidelity | Install/validate Live; semantic IntentContract + Skill orchestrator shipped; clarification gate docs Live; hooks/enforcement Planned (Gate C, correction-cost gated). Snapshot scores live only in `docs/audits/APS_INTENT_COMPILER_AUDIT.md` |
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

## Deferred structure (monolith red-team, 2026-08-12)

Living-tree scan: **0** `src/` files at/above LARGE_FILES warn (≥500). No immediate thin-orchestra refactor. Right move: TE 1.1 visual/product review first.

| Item | Status | Trigger to reopen |
|------|--------|-------------------|
| Split `topic-engine-shell.tsx` / `librarian-shell.tsx` into folder orchestras | **Parked** | Channel stage, second shell consumer, or file approaching ≥500 via real behavior |
| Thin `interview-flow.ts` + `interview-flow/` (stage actions) | **P2 Planned** | Post TE freeze; merge friction or stage-action growth |
| Thin `research-brief-editor.tsx` + stem folder (mirror company-understanding) | **P2 Planned** | Post TE freeze; only if the stage grows again |

Do **not** split for symmetry: `prompt-contract-rules.ts` (rule table), `parse-structured-output.ts`, reducers, Zod/registry barrels. Exemplar when a split is justified: `lib/company-anchors.ts` → `lib/company-anchors/*`.
