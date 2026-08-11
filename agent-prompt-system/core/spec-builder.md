# Spec builder → IntentContract

Before substantial edits, compile an IntentContract (see `intent-contract.md`) and render it with `templates/cursor-instruction.md`.

## Required fields

1. **goal** — what must change (preserve user wording; do not expand ambition)
2. **taskType** — from `request-router.md`
3. **scope** — In / Out (paths, stages)
4. **constraints** — must remain true (MVP bounds, safety, user limits)
5. **acceptanceCriteria** — observable checks / commands
6. **projectRefs** — real inspectable identities discovered in the repo
7. **userDecisions** — explicit choices from the original request and/or clarification
8. **unresolved** — material gaps only (`none` when clear)

## Authoring rules

- Markdown-first. Do not require JSON serialization at runtime.
- Preserve limiting statements from the user ("don't create a new component", "without changing behavior").
- Never promote `model_inference` into constraints, acceptance, or userDecisions.
- Product-touching work: resolve north star via `project-context/PRODUCT.md` → canon.
