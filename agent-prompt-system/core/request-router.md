# Request router

Map user intent to a `taskType` and ≤3 workflow IDs. Keep this table small.

**Principle:** `taskType` assists workflow selection. It does **not** alter user intent. An imperfect type with an accurate IntentContract is fine.

## taskType table

| User wants to… | taskType | Prefer workflows |
|----------------|----------|------------------|
| understand / find / explain | investigate | `investigate-codebase` |
| decide / design / architect | plan | `plan-feature` |
| change / build / fix / refactor | implement | `implement-feature` (+ `test-and-verify`) |
| test / check / prove | verify | `test-and-verify` |
| assess / review | audit | `audit-existing-system` |
| security-specific assessment/change | security | `review-security-and-privacy` |
| finish / document / clean up | closeout | `daily-project-closeout` |

Select **1–3** workflows. State them in the APS brief, then compile the IntentContract.

## Bypass

Typos, locate-a-file, explain-one-function, one-line fixes — skip full compile.
