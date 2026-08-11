# PROMPT_QUALITY_CALIBRATION_01

**Canonical calibration audit for company-analyst intake.**  
Do not create a parallel CALIBRATION_02 doc — deltas append below.

| Pass | Runtime version | Artifacts |
|------|-----------------|-----------|
| Initial marketing lens | `rpb-runtime-1.0.0` → `1.1.0` | `docs/audits/artifacts/calibration-01/` |
| Intake strategist + clean fields | `1.1.0` → `1.2.0` | `docs/audits/artifacts/calibration-02/` |

Date: 2026-08-06 (local) / live 1.2.0 run 2026-08-07 UTC  
Branch: `feat/prompt-quality-calibration`

## Current AI interpretation architecture

```text
CSV upload
  → sanitize + assertCsvUpload
  → parseCsvText + normalizeCell
  → buildEvidencePacket (exact-row dedupe, 40k budget, row-N refs)
  → assembleCompanyAnalysisContext (80 rows / 36k / redactDeep)
  → buildCompanyAnalystPrompt (trusted instructions + untrusted JSON fence)
  → ONE parseStructuredOutput call (operation: analyze-company)
  → Zod CompanyUnderstandingSchema
  → Step 2 structured understanding only (no raw CSV)
```

Step 2 four-section confirmation UI is present in repo (`PROFILE_SECTIONS` / `who_we_help` … `trust_and_limits` in `lib/profile.ts`). No conflict with this calibration pass.

## Independent verifier?

**No.** There is no second AI verification layer. Post-model checks on this path are Zod shape validation only.

## Runtime prompt version

| Item | Value |
|------|--------|
| Defined | [`src/features/research-prompt-builder/prompts/prompt-version.ts`](../../src/features/research-prompt-builder/prompts/prompt-version.ts) |
| History | `1.0.0` → `1.1.0` (marketing lens) → **`1.2.0`** (intake strategist, clean field routing) |
| Current | `rpb-runtime-1.2.0` |
| Stamped in instructions | All runtime prompts under `prompts/` including `company-analyst.ts` |
| Returned to client | `POST /api/company/understand` → `promptVersion` |
| Persisted in traces | `structured-openai` → `recordTrace({ promptVersion })` |
| Final prompt metadata | Separate `PROMPT_VERSION` on final research prompt (unchanged) |

No new versioning mechanism was introduced. Fresh 1.2.0 re-ingest confirmed in `calibration-02/summary.json`.

## Exact prompt change

**File changed (runtime behavior):** [`company-analyst.ts`](../../src/features/research-prompt-builder/prompts/company-analyst.ts) only.

**Read-only:** [`shared-guardrails.ts`](../../src/features/research-prompt-builder/prompts/shared-guardrails.ts) — not modified. Reusable shared-rule candidates deferred (see below).

Trusted instructions now require audience-first marketing-strategy extraction priority, claim≠proof, repetition≠corroboration, no invention, regulated boundaries, concise Step 2 foundation. Untrusted fence / packet JSON path unchanged. Full prompt text not dumped here.

## Fixture names and industries

| Fixture CSV | Industry | Company |
|-------------|----------|---------|
| `tests/evals/fixtures/calibration-csvs/supplement.csv` | Dietary supplements / AI comparison | ZYNAVA |
| `…/restaurant.csv` | Restaurant / hospitality | Harbor Table |
| `…/contractor.csv` | Local residential contractor | Ridge Line Remodeling |
| `…/professional-service.csv` | Bookkeeping / professional services | Clearpath Bookkeeping |
| `…/ecommerce.csv` | E-commerce home goods | Parcel & Pine |

Live outputs: `docs/audits/artifacts/calibration-01/*-understanding.json`  
Summary: `docs/audits/artifacts/calibration-01/summary.json` (`promptVersion: rpb-runtime-1.1.0`, all five `ok`)

**Confirmation:** All five calibration CSVs were freshly re-ingested via live OpenAI (`gpt-5.6-terra`) after the prompt change using `scripts/run-calibration-ingest.mjs`.

## Scoring (kept distinct)

### A. Deterministic instruction-contract scores (not model-output improvement)

Scale 0–2 per dimension via `scoreInstructionContract` in `tests/evals/company-analyst-contract.test.ts`.

| Dimension | Before (1.0.0 generic) | After (1.1.0) |
|-----------|------------------------|---------------|
| Audience-first | 0 | 2 |
| Customer tension | 0 | 2 |
| Offer + how value created | 0 | 2 |
| Market + next step | 0 | 2 |
| Differentiation / proof / trust | 0–1 | 2 |
| Claim boundaries | 1 (regulated mention only) | 2 |
| Unknowns | 1 | 2 |
| Claim ≠ proof | 0 | 2 |
| Repetition ≠ corroboration | 0 | 2 |
| No invent | 1 | 2 |
| Evidence refs | 1 | 2 |
| Do not write strategy | 0 | 2 |

These scores measure **instruction coverage only**.

### B. Live model-output quality scores (separate)

Heuristic 0–2 checklist on actual `companyUnderstanding` JSON after fresh re-ingest (identity/offer, audience, tension, differentiation, proof, claims, unknowns, conciseness, evidence cited, slogan-as-claim handling). Max 20.

| Fixture | Live total | Notes |
|---------|------------|-------|
| supplement | 20/20 | Medical boundaries present; slogans not used as proof |
| restaurant | 20/20 | Allergen / shared-fryer boundary; tagline called out as slogan |
| contractor | 20/20 | Permit-scope boundary; slogan called out |
| professional-service | 20/20 | Tax-advice boundary; slogan called out |
| ecommerce | 20/20 | Warranty-SKU boundary; slogan called out |

Observed strength: model consistently listed marketing slogans inside `claimsAndRestrictions` as non-proof. Audience often classified `observed_fact` when the CSV itself stated the audience (appropriate given evidence).

## Observed failures

None blocking on the five live runs. Remaining systemic gaps (not failures of this prompt change):

- No automated evidence-ref ↔ packet row integrity check  
- No near-duplicate clustering beyond exact-row dedupe  
- No unsupported-specificity validator beyond prompt + Zod  
- Classification badges still not shown in Step 2 UI (out of scope)

## Tests added or updated

| Test | Role |
|------|------|
| `tests/evals/company-analyst-contract.test.ts` | Instruction contract + untrusted boundary (CSV cell only inside fence, never in trusted instructions) |
| `tests/ingestion/parse-csv.test.ts` | Exact-row dedupe warning + single retained slogan row |
| `tests/evals/scope-boundary.test.ts` | Re-run — raw CSV excluded from final/compiler |

## Regression results

| Gate | Result |
|------|--------|
| Focused vitest (contract + ingestion + scope-boundary) | PASS (14 tests) |
| Live calibration ingest (5/5) | PASS |
| `npm run verify` | **PASS** (doctor, lint, typecheck, 80 unit tests, knowledge, APS, MCP, build, e2e) |

## Remaining semantic-verification gaps

Candidates for **later** controlled changes (not implemented here):

| ID | Change | Recommendation |
|----|--------|----------------|
| A | Deterministic evidence-reference integrity validator | Worth a follow-up if refs drift |
| B | Deterministic near-duplicate text clustering | Optional; prompt already steers; exact-row dedupe exists |
| C | Unsupported-specificity validator | Optional post-parse |
| D | Validate-and-repair pass on analyze-company | Optional; unused today |
| E | Independent second AI verifier | **Not recommended now** — live fixtures show prompt+Zod preserved claims/trust boundaries |

**Later shared-guardrails recommendation (not done):** promote “marketing claim ≠ proof” / “repetition ≠ corroboration” into `shared-guardrails.ts` if interview/brief prompts need the same rule. Keep this PR local to `company-analyst.ts`.

## Whether a second validation layer is recommended

**No second AI verifier for this calibration.** Live outputs already surface slogan-vs-proof and regulated boundaries. Prefer deterministic A/C later if needed.

## Pass 1.2.0 — intake strategist + clean field routing

### Prompt change

**File:** [`company-analyst.ts`](../../src/features/research-prompt-builder/prompts/company-analyst.ts) only.  
**Read-only:** `shared-guardrails.ts` (no longer uses `SHARED_ANALYST_PERSONA` on this call; call-specific intake persona).

Adds: customer situation → value mechanism → competition clues (named/evidenced only) → trust/boundaries → gaps via classification/explanations.  
Hard rule: do **not** insert Opportunity / expansion / storytelling / competitor-research prose into `offer`, `likelyAudience`, `geography`, `differentiators`, or `websiteAction` values. Those decisions defer to interview + research brief.

### Instruction-contract scores (deterministic — not model-output scores)

All v1.2 contract dimensions score **2** in `company-analyst-contract.test.ts` (intake persona, clean field semantics, no-opportunity-in-values, defer-to-interview, claim≠proof, competition rules, never omit boundaries).

### Live before vs after (same 5 CSVs)

Heuristic live score /20 (identity, audience, tension, diffs, proof, claims, slogan-as-non-proof, evidence, **valuesStayClean**, how-value-in-offer). Instruction scores are separate.

| Fixture | 1.1.0 (`calibration-01`) | 1.2.0 (`calibration-02`) | Notes |
|---------|--------------------------|--------------------------|--------|
| supplement | 20/20 | 20/20 | Boundaries + clean values retained |
| restaurant | 18/20 | 18/20 | Offer gained explicit value-mechanism wording; allergen boundary retained; values clean |
| contractor | 18/20 | 18/20 | Fixed-scope value mechanism clearer; permit boundary retained; values clean |
| professional-service | 20/20 | 20/20 | Tax boundary retained |
| ecommerce | 20/20 | 20/20 | Warranty-SKU boundary retained |

`valuesStayClean = 2` on all five at 1.2.0 (no Opportunity/expansion prose in confirmable values).  
Regulated / slogan-as-non-proof wins from 1.1.0 **preserved**.

### Fleet correction applied

Orphan `workingAssumptions` / `importantUnknowns` are not used as a dump for strategy recommendations. Gaps stay in classification, explanations, claims, and unknowns; strategic priority selection stays in interview/brief.

## Final recommendation

Keep `rpb-runtime-1.2.0` intake-strategist contract. No second AI verifier. No CALIBRATION_02 markdown — this file remains canonical.

## Evidence labels (summary)

| Claim | Label |
|-------|--------|
| Instruction contract 1.2.0 | **Verified** (unit tests) |
| Untrusted-evidence boundary | **Verified** |
| Zod structure | **Verified** |
| Scope isolation | **Verified** |
| Clean confirmable field values (no opportunity prose) | **Verified** on 5 live fixtures |
| 1.1.0 slogan≠proof / boundaries retained at 1.2.0 | **Verified** on 5 live fixtures |
| Repository verification (`npm run verify`) | **Verified** PASS (80 unit tests, e2e ok) |
| Universal live quality beyond these fixtures | **Partially verified** |
| Second AI verifier required | **Not verified** / not recommended |
