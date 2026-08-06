# Research Prompt Builder — Foundation Readiness Audit

- **Audit version:** 1.0.0  
- **Generated at:** 2026-08-06T02:24:00Z  
- **Commit SHA (HEAD):** `958df514ae72d8ff27e11bf8a1ffa7e3b6ea77f3`  
- **Branch:** `main`  
- **Working tree:** Dirty — large uncommitted foundation delta on top of single MVP commit  
- **Auditor mode:** Evidence-based; no product code modified  

## 1. Executive verdict

The Research Prompt Builder **vertical-slice product path is implemented in source** (CSV → understand → interview → brief → final prompt → copy/download) and **local verification commands largely pass** (doctor, lint, typecheck, unit/evals, knowledge/Guardian, APS validate, MCP smoke/doctor, production build). A light UI load of `/` returned HTTP 200 with product markers.

However, **foundation work is not yet a stable git checkpoint** (most of three-plane scaffolding is untracked/modified), **E2E is broken/misconfigured**, **API-route tests are absent**, several CURRENT_STATE “Live” claims are **overstated** (decision ledger unwired; state-machine transitions soft; CI “three-tier” pre-commit not hook-wired), and **Cursor’s enabled MCP surface (MCP_DOCKER + Perplexity + RepoBrain) does not match** the project’s `rpb-development` policy. Custom **RPB MCP is Implemented but not connected** in this Cursor session.

**Decision: READY WITH KNOWN LIMITATIONS** for owner testing of the product happy path using the sample CSV — not for claiming foundation “done” or MCP governance “correct.”

## 2. Ready-for-testing decision

**READY WITH KNOWN LIMITATIONS**

Reasons:

1. Product APIs and UI stages exist under `src/app/api/*` and `src/features/research-prompt-builder/`; build and unit tests pass (**Verified**).  
2. Sample fixture `public/samples/zynava-company.csv` exists; `/` loads (**Verified** this audit).  
3. Prior session runtime showed `POST /api/company/understand` 200 with `gpt-5.6-terra` (**Partially verified** — not re-run this audit to avoid unpaid OpenAI spend).  
4. Limitations: no API/E2E suite; foundation uncommitted; decision ledger unused; workflow enforcement soft; Cursor MCP profile mismatch; `test:e2e` fails; `validate:cursor-context` missing.  

## 3. Overall score

| Dimension | Score | Evidence-based explanation |
|-----------|------:|----------------------------|
| Product completeness | 7.5 | Full stage code present; stop-after-export enforced in UI/policy; some failure states unused |
| End-to-end testability | 4.5 | 16 unit/eval tests; **zero** API route tests; Playwright script present but **no config**, run fails |
| Prompt intelligence | 7.0 | Context compilers, narrative prompts, contract lint, IR formatter exist |
| Prompt evaluation | 5.5 | Six industry fixtures + thin red-team; no LLM-backed evals; adversarial set incomplete |
| Architecture clarity | 8.0 | Three-plane docs + `src/ai` + ownership rules coherent |
| LLM readability | 7.5 | AGENTS cold-start + bootstrap index + APS adapters concise |
| Diagnosability | 7.5 | `doctor`, Guardian, AiTrace hooks, knowledge maps present |
| Security | 6.5 | server-only OpenAI, `store: false`, `.env.local` ignored; MCP_DOCKER write tools contradict policy |
| MCP governance | 3.5 | Repo RPB MCP healthy; Cursor loads Docker/write/GitHub/YouTube/browser stack instead |
| CI and release readiness | 6.0 | GHA workflows exist; not proven on remote; precommit not hooked; dirty tree |
| **Overall foundation readiness** | **6.4** | Strong scaffold + runnable MVP; governance/test/git gaps before “foundation complete” |

## 4. Product boundary compliance

**Status: Live (compliant)** with advisory archive only.

| Check | Result | Evidence |
|-------|--------|----------|
| Stops after copy/download | Live | `FinalPromptViewer` copy/download; `feature-policy.stopAfterPromptExport`; PRODUCT.md journey |
| No research execution in product | Live | No web-search product APIs under `src/app/api` |
| No topics/scripts/video product | Live | Prompt lint bans seven-scene / scroll-retention (`prompt-contract.ts`) |
| No auth/DB | Live (absent = Planned) | No auth/db modules in `src/` |
| Scope-drift artifacts | Advisory / archive | `Reference/archives/marketmonth/**` (MarketMonth); Desktop narrative under `Reference/advisory-sources/` — not imported into runtime product |

**Recommended disposition:** Keep MarketMonth under `Reference/archives/`; do not promote into `src/`.

## 5. End-to-end capability matrix

| Capability | Status | Verification | Source evidence | Test evidence | Runtime evidence | Blocking issue | Next action |
|------------|--------|--------------|-----------------|---------------|------------------|----------------|-------------|
| CSV ingestion | Live | Partially verified | `ingestion-dropzone.tsx`, `parse-csv.ts`, `build-evidence-packet.ts`, `upload-policy.ts` | `tests/ingestion/parse-csv.test.ts` | UI markers on `/` | None for owner path | Add API upload tests |
| Company understand | Live | Partially verified | `api/company/understand`, `analyze-company.ts`, `CompanyUnderstandingSchema` | None (API) | Prior session POST 200 | OpenAI cost/env | Owner smoke with sample CSV |
| Owner confirm/reject | Live | Partially verified | `company-understanding.tsx`, `lib/profile.ts` | None | Insufficient this audit | Material gate allows all-rejected | Tighten gate before scale |
| Adaptive interview | Live | Partially verified | `api/interview/next`, `generate-next-question.ts`, max 7 | None | Not verified this audit | Conditional cap not code-enforced | Owner smoke + enforce cap |
| Supporting docs | Live | Partially verified | `api/documents/extract`, mammoth/unpdf | None | Not verified this audit | Policy allowlist drift csv/json | Align `upload-policy` |
| Research brief | Live | Partially verified | `api/research-brief`, editor | reducer invalidation test | Not verified this audit | `evidenceSummary` not editable | Owner edit smoke |
| Final prompt + lint | Live | Partially verified | `api/research-prompt`, `format-research-prompt.ts`, `prompt-contract.ts` | formatter + 6 eval fixtures | Not verified this audit | — | Owner copy/download |
| Copy / MD download | Live | Partially verified | `final-prompt-viewer.tsx` | None | Not verified this audit | — | Owner verify clipboard |
| Workflow state machine | Partial | Partially verified | `workflow-states.ts` | thin reducer tests | Soft transitions | Illegal transitions soft-allowed | Enforce `canTransition` |
| Decision ledger | Prototype | Verified unwired | `decision-ledger.ts` no callers | None | N/A | Overclaimed Live in CURRENT_STATE | Wire or downgrade status |
| Storage migrations | Live | Partially verified | `migrations/*`, envelope v2 | None dedicated | Assumed | — | Add migration unit test |
| RPB MCP (repo) | Live | Verified | `mcp/`, smoke + allowlist | `mcp:test` pass | Not connected in Cursor | `.cursor/mcp.json` missing | Copy example → mcp.json |
| APS / Cursor rules | Live | Verified | adapters SHA sync | `agent:validate` pass | Installed | Extra `rpb-north-star.mdc` outside APS | Keep; document |
| E2E Playwright | Broken / Partial | Verified fail | `test:e2e` script; **no** `playwright.config.*` | exit 1 Vitest import | N/A | Misconfigured | Add real Playwright project |
| Knowledge Guardian | Live | Verified | scripts + codes | 0 hard / 0 warn | Generated reports | — | Keep in CI |
| Agent learning | Partial | Partially verified | propose/review only | No npm scripts | N/A | No approve automation | Manual review OK for now |

## 6. Product Plane

### Stage A — Ingestion
- **Status:** Live  
- **Verification:** Partially verified  
- **Implementation:** UI + `assertCsvUpload` / `buildEvidencePacket` / sanitize; limits via env (5MB/2500/100 defaults); localStorage stores meta not raw CSV (`types.ts` ingestion).  
- **Tests:** parse-csv unit tests.  
- **Runtime:** `/` 200.  
- **Defects:** UI “Max 5 MB” hardcoded vs env; analyze failures map broadly to `INGESTION_FAILED`.  
- **Missing:** API tests; injection-phrase advisory.

### Stage B — Understanding
- **Status:** Live (`OWNER_CORRECTION_REQUIRED` Planned/dead)  
- **Evidence:** schemas with observed_fact / working_assumption / important_unknown; confirm/correct/reject UI.  
- **Defects:** material Continue allows all material fields rejected; failure state never dispatched.  

### Stage C — Interview
- **Status:** Live (info-gain / conditional cap Partial)  
- **Evidence:** max 7; early done when cores covered; suggestion insert UX; quality scores ≥4.  
- **Missing:** code enforcement of max 2 conditionals; API tests.

### Stage D — Documents
- **Status:** Live (policy Partial)  
- **Evidence:** PDF/DOCX/TXT/MD/CSV/JSON extract; summaries on answers only.  
- **Defect:** `upload-policy` omit `.csv`/`.json` while sanitize allows.

### Stage E — Brief
- **Status:** Live  
- **Evidence:** build + editor; invalidates final prompt on edit.  
- **Defect:** `SET_BRIEF` can bypass happy-path transitions; `evidenceSummary` not in editor.

### Stage F — Final prompt
- **Status:** Live  
- **Evidence:** 8-section IR + formatter + lint; copy/download buttons.  
- **Tests:** formatter + eval fixtures.  

### State machine / lifecycle
- Happy states defined including `PROMPT_EXPORTED`/`COMPLETE`.  
- Failure states listed; **enforcement Partial** (`SET_STAGE` / `SET_FAILURE` soft).  
- Downstream invalidation hardcoded in reducer (works for brief/prompt clear).  
- Envelope migration v1→v2 Live.

## 7. AI Control Plane

| Component | Status | Evidence |
|-----------|--------|----------|
| Contract registry | Live | `src/ai/contracts/registry.ts` (8 contracts) |
| Context compilers | Live | `assemble-*-context.ts` + budgets + `redactDeep` |
| AI ops registry | Live | 6 ops in `operations/registry.ts` |
| AiTrace | Live | `structured-openai.ts` + `record-trace.ts` |
| Decision ledger | Prototype | Module exists; **no production caller** |
| Config modules | Live | `src/config/*` |
| Semantic validators | Live (regex) | `validation/prompt-contract.ts` |
| Repair-once | Live | structured-openai repair path |
| Prompt versioning | Partial | `prompt-version.ts` + Guardian PK-WARN-002 heuristic |

Gaps: scattered timeout/retries partly in env; extract-supporting-context assembler = `"none"`.

## 8. Prompt-quality readiness

| Item | Status |
|------|--------|
| Six industries fixtures | Live — `tests/evals/fixtures/{supplement,restaurant,contractor,professional-service,ecommerce,b2b-software}.ts` |
| Deterministic lint evals | Live — pass without OpenAI |
| Adversarial set | Partial — injection cell + redaction/video ban; missing PDF injection, oversized, owner rejection suite, prohibited-generic enforcement |
| CI gate on prompt changes | Partial — unit evals in `npm test`; no LLM judge |
| **Master-prompt system score** | **6.5 / 10** — strong structure/stop/contract; weak adversarial + no live-model calibration |

## 9. Engineering Intelligence Plane

| Area | Status | Notes |
|------|--------|-------|
| Canonical PK docs | Live | All `quality-rules.requiredDocs` present |
| Generated inventories | Live | maps + indexes + Guardian reports; writes only under `generated/` (**Verified** via `update.mjs`) |
| Guardian codes | Live | PK-HARD-001..005, PK-WARN-001..005 implemented |
| APS | Live | 7 workflows; 3 adapters in sync with `.cursor/` |
| agent-learning | Partial | propose/review; no approve script; stubs |
| CI workflows | Live (unproven remote) | `.github/workflows/ci.yml` + dependency-review |
| precommit:fast | Partial | Script exists; **not** husky/git-hook wired |
| `validate:cursor-context` | Missing | npm script absent (Reference-only) |
| CURRENT_STATE honesty | Partial | Overclaims ledger Live, CI three-tier Live, MCP Live-as-connected |

Authority order **used:** live `project-knowledge/` + `AGENTS.md` > `src/` > APS pointers > `Reference/` advisory. Generated maps are inventories, not doctrine (**Verified** by README invariant).

## 10. MCP and Docker capability audit

### Connected in this Cursor session

| Server | Status | ~Tools | Purpose | R/W | Belongs? | Mode |
|--------|--------|--------|---------|-----|----------|------|
| `user-MCP_DOCKER` | ready | ~100+ | Gateway: GitHub R/W, Playwright browser, Context7 (`query-docs`), YouTube transcripts, mcp-* control, `code-mode` | **Write-capable** (create/update/delete file, push, merge, issue_write, etc.) | **No as always-on** — conflicts `docs/ai/mcp-profiles.yaml` `do_not_install` Docker-control; GitHub writes not approved | **Needs owner review → Disable or strip writes** |
| `user-perplexity` | ready | 4 (+auth) | Web research for developers | Read-only web | OK as **dev research only**; never product truth | On demand |
| `user-repobrain` | ready | 20+ | Vault search/import/analyze; some write paths (`import_*`, `create_reference_package`, `set_active_project`) | Mixed | Duplicates RPB intelligence; not in profiles YAML | On demand / review |
| `cursor-ide-browser` | ready | 15 | IDE browser automation | Browser | Fine for agent QA | On demand |
| **RPB `rpb_*`** | **not in catalog** | 13 in repo | Project Intelligence | Read-only | **Required by policy** | **Always on (host stdio)** |

### MCP_DOCKER tool groups (classification)

| Group | Classification |
|-------|----------------|
| Context7 (`resolve-library-id`, `query-docs`) | Always on (desired) — currently only via Docker gateway |
| GitHub read tools | On demand |
| GitHub write (`create_or_update_file`, `push_files`, `merge_pull_request`, `delete_file`, …) | **Disable** unless explicitly approved |
| Playwright browser_* / `browser_evaluate` | On demand; treat evaluate as elevated |
| YouTube transcript tools | Disable for MVP (research-future) |
| `mcp-*` gateway control / `code-mode` | Needs owner review — high blast radius |
| Generic FS/shell | Not clearly exposed as dedicated tools in catalog; Docker control tools still violate policy intent |

### Custom RPB MCP

**Implemented but not connected**

- Tools: 13 `rpb_*` in `mcp/src/create-server.ts`  
- Smoke + allowlist-drift: **PASS** (`npm run mcp:test`)  
- Doctor: healthy (`npm run mcp:doctor`)  
- Path rejection: tested in `mcp/test/smoke.ts`  
- Cursor: `.cursor/mcp.json` **absent**; only `.cursor/mcp.json.example`  

### Perplexity / RepoBrain

- Perplexity: developer research only — **must not** become product runtime or canon.  
- RepoBrain: vault intelligence; can write packages/imports; **not** a substitute for allowlisted RPB docs; may add context overhead.

## 11. Security and privacy

### High
1. **MCP_DOCKER exposes GitHub write + gateway control** while profiles forbid Docker-control / unapproved writes — agent blast radius. Evidence: tool catalog `create_or_update_file`, `push_files`, `merge_pull_request`, `mcp-exec`.  
2. **Large uncommitted foundation + secrets discipline** — `.env.local` ignored (**Verified** `git check-ignore`); ensure never staged.  

### Medium
3. Prompt-injection defenses Partial (wrap/redact; limited detection).  
4. Material field rejection still allows Continue.  
5. CI bot job with `contents: write` on main push (`ci.yml` generated-maps-bot-pr).  
6. No dependency audit run this audit (`npm audit` not in scripts).  

### Low
7. UI hardcodes 5MB copy.  
8. Duplicate Reference root files increase confusion.  
9. `dangerouslySetInnerHTML`: **absent** in `src/` (**Verified**).  
10. OpenAI `store: false` (**Verified** `structured-openai.ts`).  

## 12. Tests, builds, and command evidence

| Command | Exists | Exit | Duration (approx) | Result | Classification |
|---------|--------|-----:|-------------------|--------|----------------|
| `node --version` | n/a | 0 | — | v24.14.0 | Env |
| `npm --version` | n/a | 0 | — | 11.9.0 | Env |
| `npm run doctor` | Yes | 0 | 3.3s | 13 PASS | Pass |
| `npm run lint` | Yes | 0 | 22s | clean | Pass |
| `npm run typecheck` | Yes | 0 | 12s | clean | Pass |
| `npm test` | Yes | 0 | 13s | 16/16 | Pass; **no OpenAI** |
| `npm run knowledge:update` | Yes | 0 | 4.5s | wrote generated only | Pass |
| `npm run knowledge:check` | Yes | 0 | 2.4s | OK | Pass |
| `npm run knowledge:guardian` | Yes | 0 | 2.8s | 0 hard / 0 warn | Pass |
| `npm run agent:validate` | Yes | 0 | 2.9s | adapters in sync | Pass |
| `npm run mcp:test` | Yes | 0 | 15s | smoke + allowlist | Pass |
| `npm run mcp:doctor` | Yes | 0 | 11s | healthy | Pass |
| `npm run build` | Yes | 0 | 82s | 5 API routes | Pass |
| `npm run validate:cursor-context` | **No** | 1 | — | Missing script | Missing |
| `npm run test:e2e` | Yes | 1 | 5s | Vitest CJS / no tests | **Broken config** |
| `npm run verify` | Yes | — | not run as umbrella this pass | components above pass | Assumed green if e2e excluded |
| GET `http://localhost:3000/` | n/a | 200 | — | UI markers | Runtime partial |

**Package manager:** npm + `package-lock.json` (no pnpm/yarn).  
**Tracked files at HEAD:** 66; `node_modules`/`.next` not tracked.  
**`.env.local` / `.cursor/mcp.json`:** ignored. **`.cursor/mcp.json.example`:** intended tracked (present untracked with `.cursor/`).

## 13. Critical blockers

| ID | Severity | Stage | Evidence | User impact | Root cause | Minimum safe fix | Verification |
|----|----------|-------|----------|-------------|------------|------------------|--------------|
| B1 | High (governance) | MCP | Cursor catalog vs `mcp-profiles.yaml` | Agent may write via GitHub/Docker tools | Profile drift | Disable MCP_DOCKER writes / enable RPB stdio | Re-list MCP tools |
| B2 | Medium (release) | Git | `git status` huge dirty tree; 1 commit | Foundation can be lost | Never committed | Commit foundation (owner-approved) | `git status` clean-ish |
| B3 | Medium (QA) | E2E | `test:e2e` exit 1; no playwright.config | False confidence in CI if added blindly | Miswired script | Add Playwright config or remove script | `npm run test:e2e` |
| B4 | Low-Med (honesty) | Docs | CURRENT_STATE ledger/CI/MCP Live | Agents over-trust | Overclaim | Correct CURRENT_STATE | Human review |
| B5 | Low (owner UX) | State | Soft transitions / unused failure states | Odd recovery paths | Reducer not enforcing meta | Enforce `canTransition` | reducer tests |

**Note:** B1/B4 do **not** block a careful owner product smoke with sample CSV. B2 should be done before trusting the workspace as stable.

## 14. High-priority missing work

1. Connect RPB MCP (`.cursor/mcp.json` from example); disable GitHub write tools in Docker profile.  
2. Commit foundation checkpoint (owner request).  
3. Fix or quarantine `test:e2e`.  
4. Correct CURRENT_STATE overclaims (ledger, CI tier-1, MCP connected).  
5. Add at least one mocked API integration test per route.  
6. Enforce interview conditional max + material-field rejection gate.  
7. Align supporting-doc allowlists.  

## 15. Medium-priority improvements

1. Wire decision ledger into brief/prompt context.  
2. Enforce workflow transitions hard.  
3. Expand adversarial eval fixtures.  
4. Hook `precommit:fast` (husky or documented).  
5. Implement `validate:cursor-context` or remove from Reference expectations.  
6. Editor field for `evidenceSummary`.  
7. Distinguish ingest vs model failure in UI.  

## 16. Safe deferrals

- Auth / DB / multi-user  
- Research execution / YouTube MCP / OpenAI web search in product  
- LLM-as-judge eval merge gates  
- Docker packaging of RPB MCP  
- agent-learning approve automation  
- Full Playwright happy-path suite (after config exists)  
- Microservices / Redis / RAG / multi-agent orchestration (**not justified**)  

## 17. File and architectural risks

- No `src/` file >500 lines (**Verified** explore).  
- Business orchestration concentrated in `app-shell.tsx` (~336 lines) — acceptable but watch growth.  
- Prompt strings in feature `prompts/` not routes (**good**).  
- Reference archive bulk + root legacy duplicates — confusion risk.  
- RepoBrain + RPB MCP duplication of “project intelligence.”  
- Excessive always-on MCP tools via MCP_DOCKER (~100+).  

## 18. Current-state corrections required

Update `project-knowledge/CURRENT_STATE.md`:

| Claim | Correct to |
|-------|------------|
| Decision ledger Live | **Prototype** (unwired) |
| Workflow state machine Live | **Partial** (meta exists; soft enforcement) |
| Lean RPB MCP Live | **Live in repo / Partial until Cursor-connected** |
| CI three-tier Live | **Partial** (GHA Live; precommit not hooked) |
| agent-learning Live | **Partial** (propose/review only) |
| E2E Partial | **Broken / Planned** until Playwright config |

## 19. Recommended next execution sequence

1. Owner: copy `.cursor/mcp.json.example` → `.cursor/mcp.json`; disable MCP_DOCKER write/GitHub-write tools (or disable MCP_DOCKER).  
2. Owner: approve git commit of foundation (audit does not commit).  
3. Correct CURRENT_STATE honesty patches.  
4. Owner testing: `npm run dev` → sample ZYNAVA CSV → full path → copy/download (expect OpenAI spend).  
5. Fix `test:e2e` or remove from verify until real.  
6. Add mocked API tests; enforce conditional/material gates.  
7. Wire decision ledger or drop from “Live” claims.  

## 20. Evidence index

| Evidence | Path / command |
|----------|----------------|
| Governing docs | `AGENTS.md`, `project-knowledge/{README,CURRENT_STATE,PRODUCT,ARCHITECTURE,PROMPT_CONTRACT,SECURITY,TOOLING}.md` |
| Product feature | `src/features/research-prompt-builder/**` |
| APIs | `src/app/api/{company/understand,interview/next,documents/extract,research-brief,research-prompt}/route.ts` |
| AI plane | `src/ai/{contracts,context,operations,traces}` |
| MCP | `mcp/src/create-server.ts`, `mcp/test/smoke.ts`, `mcp/test/allowlist-drift.ts` |
| Profiles | `docs/ai/mcp-profiles.yaml` |
| CI | `.github/workflows/ci.yml` |
| Tests | `tests/**` (16 tests) |
| Commands | §12 table |
| Git | `git status`, `git log -1` → `958df51` |
| UI runtime | `GET /` → 200 |
| MCP session | GetMcpTools catalog: MCP_DOCKER, perplexity, repobrain; no `rpb_*` |

---

**Explicit audit constraint statement:** No product source code was modified during this audit. Only this report and regeneration of existing `project-knowledge/generated/**` via `knowledge:update` / Guardian occurred. Secrets were not printed.
