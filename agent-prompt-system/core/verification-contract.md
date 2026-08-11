# Verification contract

## Evidence labels

Label every material claim:

| Label | Meaning |
|-------|---------|
| Verified | Command/output or direct inspection confirms |
| Partially verified | Some evidence; gaps remain |
| Not verified | Not checked |
| Blocked | Could not check |
| Assumed | Believed without evidence — call out |

Prefer `npm run verify` subsets over claiming full green without running.

## Correction-cost signals (primary APS KPI)

**Primary:** intent correction rate — how often the developer must correct what the agent thought they wanted.

Supporting:

| Signal | Meaning |
|--------|---------|
| Clarification burden | Questions asked (target 0 for trivial) |
| Wrong-scope / wrong-file rate | Edits outside contract scope |
| Requirement reversal | User restates intent after work starts |
| First-pass acceptance | Acceptance criteria met without rework |
| Contract edit rate | Developer modifies compiled contract before acting |

Do **not** optimize for prompt-prose beauty scores. Gate A fixtures use deterministic invariants (`tests/intent-contract-fixtures.json`), not NLP similarity.
