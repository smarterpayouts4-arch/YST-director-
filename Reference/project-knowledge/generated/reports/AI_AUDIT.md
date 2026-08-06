<!-- GENERATED FILE: DO NOT EDIT -->
<!-- Source: project-knowledge/scripts/ai-audit.mjs -->
# AI_AUDIT (advisory)

## Provenance

- Review type: `Advisory AI review`
- Provider: `openai`
- Requested model: `gpt-5-mini`
- Actual returned model: `gpt-5-mini-2025-08-07`
- API execution status: `ok`
- HTTP status: `200`
- Context files supplied: `project-knowledge/QUALITY_RUBRIC.md`, `project-knowledge/ARCHITECTURE.md`, `project-knowledge/CURRENT_STATE.md`, `project-knowledge/generated/reports/QUALITY_SCORE.md`, `project-knowledge/generated/reports/STRUCTURE_WARNINGS.md`
- Context size: `16972` bytes
- Response generated from live API: `yes`
- AI affects official score: `no`
- Secrets in context: `excluded` (.env.local never sent; only sanitized docs)

> This report does **not** change the Internal Engineering Quality Score.

## Observations

Summary audit (based on provided files). I do not change or comment on the official score — these are advisory observations and recommendations only.

1) Top architecture risks
- Failing probes block confidence in correctness and merges
  - npm test = failing; lint = failing (QUALITY_SCORE shows tests & lint failed). Tests/lint failures increase risk of regressions and undetected contract breaks.
- Missing runtime configuration documentation
  - 28 referenced process.env keys are not in .env.example (QUALITY_SCORE → PK-QUALITY-051). Undocumented envs make local/dev/CI setup error-prone and hide security/config risks.
- Large, monolithic source file
  - src/lib/company-profile/csv-contract.ts = 959 lines (> 500). Long files hide mixed responsibilities and increase merge-conflict / review friction.
- Partial / mocked subsystems in scope of integrations
  - Current_State: Discovery Phase partial, Content Brain partial, many routes are Prototype/Mocked. There’s a concrete risk of other teams or agents integrating against non-live behavior or drifting expectations.
- Diffuse separation of shared contracts vs feature internals
  - ARCHITECTURE.md requires explicit shared domain contracts (e.g., src/domain/*) but the repo shows limited evidence of a canonical domain contract surface; that increases coupling risk when features reach into internals.

2) Independence / coupling concerns
- Import boundary enforcement
  - Architecture rules forbid components/* → engine/* and feature-to-feature internal imports, but enforcement relies on guardian collectors. Without lint rules preventing restricted imports, accidental coupling can occur.
- Public API surfaces not explicit enough
  - The architecture expects features to expose public entrypoints (index.ts/tsx). If those are not consistently present and lint-enforced, consumers may import internals.
- UI ↔ engine/drizzle/db direction
  - ARCHITECTURE.md forbids UI importing engine/db. Audit evidence does not show automated enforcement; this is an ongoing coupling risk especially as partial features get completed.
- Cross-stage orchestration responsibilities unclear in places
  - Orchestration must compose public interfaces without mutating internals — absent clear contract artifacts (types + tests) this can lead to brittle integrations.

3) Documentation gaps (concrete)
- Missing .env.example entries
  - 28 env keys are missing. Example keys (from report): GEMINI_API_KEY, IMAGEKIT_PRIVATE_KEY, MM_IMAGE_PROVIDER, MM_VOICE_PROVIDER, OPENAI_MAX_CONCURRENCY, RATE_LIMIT_STORE, ATOM_CRAFT_POLISH_PROVIDER, BRAIN_HISTORY_STORE, TOPIC_TITLE_HOOK_PROVIDER (full list in QUALITY_SCORE).
- Domain/shared contract directory
  - ARCHITECTURE.md references future src/domain/* but that surface is not shown as populated — missing central API/type contracts for cross-feature coordination.
- Public API ownership mapping
  - Features should publish explicit publicApiEntrypoints (ownership-rules.json referenced). The repo docs do not contain a readily visible mapping of each feature’s public exports and intended consumers.
- Test failure diagnostics / remediation guidance
  - QUALITY_SCORE notes tests failing but generated report does not include failing test names/stack traces. Easier triage needs more granular failure info in CI artifacts and docs.
- Status/contract of mocked vs live services
  - Current_State describes Partial/Mocked status, but there is no lightweight machine-readable flag or feature-flag mapping in code indicating which endpoints are mock-only vs production-ready.

4) Recommended next priorities (ordered, concrete actions)
1. Fix CI-grade failures (High priority)
   - Run: npm test locally, capture failing tests; fix or create failing-test tickets. Ensure CI fails fast on test/lint failures.
   - Run: npm run lint; resolve lint failures; add lint step to required CI checks if absent.
   - Outcome: pass tests + lint → restores confidence & allows safe refactors.

2. Populate .env.example and document env ownership (High)
   - Add the 28 missing env keys into .env.example with short descriptions and owners (example: GEMINI_API_KEY — LLM provider key — owner: infra/ai).
   - Add a README section mapping env keys → feature/owner → required vs optional → safe defaults for local dev.
   - Add a CI check that rejects code that references new process.env keys unless added to .env.example.

3. Enforce import/interface boundaries (High → Medium)
   - Add ESLint rules (no-restricted-imports or a custom rule) preventing:
     - components/* → engine/*, components/* → db/*, feature → otherFeature/internal paths.
   - Implement a test/lint job that fails on restricted/import violations.
   - Ensure owners declare publicApiEntrypoints (index.ts) for features used by others; add an eslint rule to prefer explicit imports from those public entrypoints.

4. Triage & split the large file (Medium)
   - Refactor src/lib/company-profile/csv-contract.ts into focused modules: types, parsers, validators, adapters. Target multiple files < 400 lines each.
   - Add unit tests that cover parsing and normalization behavior.

5. Harden contract visibility and domain types (Medium)
   - Create src/domain/ with explicit cross-feature types and stage contracts (e.g., discovery stage types, SocialDiscoveryProfile). Move existing UI-safe stage contract into a canonical location and ensure engine re-exports only necessary types.
   - Add small integration tests asserting the runtime shape of stage streams (NDJSON endpoints).

6. Improve visibility of partial/mocked status (Medium)
   - Add a machine-readable mapping (e.g., project-knowledge/STATUS_MAP.json or annotations in ownership-rules.json) for feature readiness: live / partial / mock / prototype. Surface in developer docs and CI warnings when tests hit mocked endpoints.
   - Enforce "hard stop" rule: attempts to consume a Mocked feature from production code must be gated behind explicit feature flags or test-only adapters.

7. Operationalize secrets & rate limits (Medium → Low)
   - For all image/voice/LLM provider keys (IMAGEKIT_*, MM_IMAGE_*, GEMINI_*, MM_VOICE_*), document the required secret store (Vault/Secrets Manager) and add a secure retrieval pattern example in docs.
   - Document expected concurrency / rate-limit envs (OPENAI_MAX_CONCURRENCY, RATE_LIMIT_STORE) and add runtime guards/metrics.

8. Improve CI test reporting & owner notifications (Low)
   - Ensure CI artifacts include failing test names and stack traces in generated reports (linked from QUALITY_SCORE).
   - Add a daily or PR-based reminder for owners of areas where probes changed status (tests/lint/security).

Quick tactical checks to run now
- npm run quality:update (or npm run quality:update:fast) locally to reproduce rubric probe results.
- npm test; npm run lint; fix blocking failures first.
- Add missing env keys to .env.example and commit under a named owner.

If you want, I can:
- Propose exact ESLint config snippets (no-restricted-imports) for the forbidden paths.
- Propose a concrete refactor plan for src/lib/company-profile/csv-contract.ts (split boundaries and test targets).
- Produce a template .env.example entries file with owners and short descriptions for the 28 missing keys.
