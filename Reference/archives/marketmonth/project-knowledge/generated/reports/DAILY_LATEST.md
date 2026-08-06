<!-- GENERATED FILE: DO NOT EDIT -->
<!-- Source: project-knowledge/scripts/daily-closeout.mjs -->
# Daily closeout — 2026-07-31

**STATUS: NOT READY TO CLOSE**

- Commit SHA: `76ea62f`
- Git scope: `project-root`
- Internal Engineering Quality Score: **8.7/10** (MarketMonth rubric `2.1.0`)
- Formula: `87/100 = 8.7/10`
- Perfect-score eligible: `no`
- Evaluations complete: `yes`
- External Baseline Coverage: **50%** (`Limited`)
- External certification: `None`

> Internal score is not industry-certified or independently certified.

## Category scores

- Architecture quality: 20/20 (10/10) — checks: PK-QUALITY-001, PK-QUALITY-002, PK-QUALITY-003, PK-QUALITY-063, PK-QUALITY-064, PK-QUALITY-065
- File and folder organization: 14/15 (9.3/10) — checks: PK-QUALITY-060, PK-QUALITY-061, PK-QUALITY-062
- Ownership clarity: 15/15 (10/10) — checks: PK-QUALITY-004, PK-QUALITY-005
- Documentation freshness: 15/15 (10/10) — checks: PK-QUALITY-020, PK-QUALITY-021, PK-QUALITY-022
- Type safety and code quality: 12/15 (8/10) — checks: PK-QUALITY-030, PK-QUALITY-031, PK-QUALITY-033, PK-QUALITY-034, PK-QUALITY-032
- Testing and verification: 5/10 (5/10) — checks: PK-QUALITY-040, PK-QUALITY-041, PK-QUALITY-042, PK-QUALITY-043
- Security and configuration: 6/10 (6/10) — checks: PK-QUALITY-050, PK-QUALITY-051, PK-QUALITY-052, PK-QUALITY-053

## Hard failures (2)

- lint failed (exit 1)
- test failed (exit 1)

## Soft warnings (0)

None.

## Probe results

- typecheck: pass (exit 0)
- lint: fail (exit 1)
- test: fail (exit 1)

## AI advisory

- Status: `ok`
- Provider: `openai`
- Live API: `yes`
- AI influence on official score: **none**

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
  - ARCHITECTURE.md forbids UI importing engine/db. Audit evidence does not show automated enforce

## Remaining issues

- `PK-QUALITY-043` (high): npm test suite must pass
- `PK-QUALITY-051` (high): Referenced process.env keys should appear in .env.example
- `PK-QUALITY-034` (medium): Lint must pass
- `PK-QUALITY-060` (low): Source files should stay under the agreed line threshold

## Recommended next priority

npm test suite must pass

## Changed files (working tree vs HEAD)

- `data/fixtures/golden-topics-report.json`
- `data/fixtures/industry-agnostic-measurement.json`
- `docs/ai/phase2-baseline-failures.md`
- `project-knowledge/CURRENT_STATE.md`
- `project-knowledge/PRODUCT.md`
- `project-knowledge/generated/indexes/manifest.json`
- `project-knowledge/generated/maps/API_MAP.md`
- `project-knowledge/generated/maps/ENV_MAP.md`
- `project-knowledge/generated/maps/FILE_OWNERSHIP.md`
- `project-knowledge/generated/reports/AI_AUDIT.md`
- `project-knowledge/generated/reports/QUALITY_SCORE.md`
- `project-knowledge/generated/reports/STRUCTURE_WARNINGS.md`
- `project-knowledge/generated/reports/ai-audit.json`
- `project-knowledge/generated/reports/quality-score.json`
- `project-knowledge/ownership-rules.json`
- `project-knowledge/scripts/lib/quality-collect/docs.mjs`
- `src/app/(app)/dashboard/page.tsx`
- `src/app/(app)/strategy/page.tsx`
- `src/app/api/brain/content/production/route.ts`
- `src/app/api/onboarding/workspace-context/route.ts`
- `src/app/dev/brain/idea-lab/idea-lab-ui.test.ts`
- `src/app/dev/brain/idea-lab/use-idea-lab-sandbox.ts`
- `src/app/globals.css`
- `src/brain/atom/compile/index.ts`
- `src/brain/atom/content-atom.schema.ts`
- `src/brain/atom/generate.ts`
- `src/brain/atom/index.ts`
- `src/brain/atom/validate/index.ts`
- `src/brain/channels/youtube-short/index.ts`
- `src/brain/channels/youtube-short/ingest-scene-prompt.ts`
- `src/brain/channels/youtube-short/render-saved-scene-image.ts`
- `src/brain/channels/youtube-short/validate-format-package.ts`
- `src/brain/channels/youtube-short/youtube-short-service.ts`
- `src/brain/connected-system.test.ts`
- `src/brain/content-studio/schemas/format-package.ts`
- `src/brain/core/get-brand-core.ts`
- `src/brain/evaluation/subjects/extract-outcome-subjects.ts`
- `src/brain/policy/model-registry.ts`
- `src/brain/render/generate-voice.ts`
- `src/brain/render/index.ts`
- `src/brain/use-cases/generate-content-directions.e2e.test.ts`
- `src/components/brand/brand-approved.tsx`
- `src/components/dashboard/content/content-studio.test.ts`
- `src/components/dashboard/content/content-studio.tsx`
- `src/components/dashboard/content/hooks/use-atom-content-studio/studio-production-api.ts`
- `src/components/dashboard/content/hooks/use-atom-content-studio/use-atom-content-studio.ts`
- `src/components/dashboard/content/hooks/use-atom-content-studio/use-studio-edit-actions.ts`
- `src/components/dashboard/content/studio/preview-canvas.tsx`
- `src/components/dashboard/content/studio/prompt-rail/prompt-rail-actions.tsx`
- `src/components/dashboard/content/studio/prompt-rail/scene-editor.tsx`
- `src/components/dashboard/content/studio/prompt-rail/studio-prompt-rail.tsx`
- `src/components/dashboard/content/studio/storyboard.tsx`
- `src/components/dashboard/content/studio/vision-shell.tsx`
- `src/components/dashboard/dashboard-home/phase-query.ts`
- `src/components/dashboard/marketing-topic/hooks/use-content-directions.ts`
- `src/components/dashboard/marketing-topic/marketing-topic-session.test.ts`
- `src/components/layout/app-sidebar.tsx`
- `src/engine/discovery/index.ts`
- `src/lib/dev/bootstrap-dev-workspace.ts`
- `src/lib/discovery/discovery-narrative.schema.ts`
