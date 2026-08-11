# IntentContract

Semantic contract compiled from messy developer intent + project evidence.  
**Runtime artifact = rendered markdown** (see `templates/cursor-instruction.md`). JSON is for fixtures/tooling only — not a mandatory interchange format.

## Eight fields (v1 — nothing else)

| Field | Meaning |
|-------|---------|
| `goal` | What must change |
| `taskType` | investigate / plan / implement / verify / audit / security / closeout |
| `scope` | In / out (paths, stages) |
| `constraints` | Must remain true |
| `acceptanceCriteria` | Observable completion conditions |
| `projectRefs` | Real paths, symbols, tests, scripts, rules, specs, issue/spec IDs |
| `userDecisions` | Explicit implementation-relevant choices from the original request **or** clarification |
| `unresolved` | Material remaining uncertainty, including model inference that would materially affect implementation |

**Rejected for v1:** `confidence`, `reasoning`, `recommendedApproach`, `persona`, `model`, `complexityScore`, `evidenceSufficiency`, Assumptions section, large intent taxonomies.

## Provenance (promotion protection)

Item-level origins only: `user_explicit` | `project_evidence` | `user_selected_option` | `user_edit` | `model_inference`.

Invariant: **`model_inference` may never become a requirement, constraint, acceptance criterion, or user decision.**

Inference routing (no Assumptions field):

- Safe to verify during discovery/implementation → keep internal; do not emit.
- Materially affects implementation → put in `unresolved`.

## Evidence sufficiency (compiler invariant, not a field)

Every `project_evidence` claim that materially influences implementation must resolve to a real inspectable source (file, symbol, test, rule, spec, script, or MCP product identity).

## Ambition

APS may increase precision, never ambition. Preserve user statements that limit scope.
