# Agent Learning (safe path)

Progressive learning for Research Prompt Builder agents.

## Rules

1. Agents may **propose** candidates only.
2. Human approval is required before anything becomes permanent in `approved/`.
3. Never auto-rewrite `AGENTS.md`, Cursor rules, or `project-knowledge/` doctrine.
4. Rejected items are recorded in `rejected.ndjson` for audit.

## Layout

```text
candidates.ndjson   # pending proposals (one JSON object per line)
rejected.ndjson     # rejected proposals
approved/           # human-approved durable notes
reports/            # duplicate / conflict reviews
scripts/            # propose.mjs, review.mjs
```

## Commands

```bash
node agent-learning/scripts/propose.mjs --area coding --summary "Prefer narrow modules"
node agent-learning/scripts/review.mjs
```
