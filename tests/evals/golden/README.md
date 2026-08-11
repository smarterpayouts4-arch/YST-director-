# Offline golden property set

Diverse workflows with **expected properties**, not golden paragraphs.

| Layer | What runs | When |
|-------|-----------|------|
| Structural meta-test | [`properties.test.ts`](properties.test.ts) | **In CI** via `npm test` / `npm run verify` (catalog shape only) |
| Deterministic owners | `can-complete-interview`, instruction-contract, fence, prompt-contract tests | **In CI** |
| Semantic / live scoring of properties | Human or offline live scripts | **Not** a merge gate |

## CI-backed property owners (examples)

| Golden id / property | Owner test |
|----------------------|------------|
| `interview-should-continue` / unresolved cores | `tests/lib/can-complete-interview.test.ts` |
| `interview-should-stop` / cores resolved | same |
| `doneTrueRejectedWithoutCores` | `tests/services/generate-next-question.auth.test.ts` |
| brief blocked when incomplete | `tests/services/build-research-brief.auth.test.ts` |
| untrusted fences | `tests/evals/*-contract.test.ts` |
| export sections / scope | `tests/evals/prompt-contract.eval.test.ts`, `scope-boundary.test.ts` |

Source of cases: [`properties.json`](properties.json) (12 starter cases; grow toward 10–30).

When adding a case: pick an archetype that stresses a failure mode, list falsifiable properties, and record human notes under `docs/audits/artifacts/` if scored live. Optional later field: `failureMeaning` (why the property exists).
