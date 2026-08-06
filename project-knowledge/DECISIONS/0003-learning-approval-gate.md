# ADR 0003 — Learning approval gate

## Status

Accepted

## Context

Progressive learning is valuable, but silent rule rewrites corrupt governance.

## Decision

Agents may append candidates to `agent-learning/candidates.ndjson`. Permanence into `approved/*` or canonical docs requires human approval. Rejected items go to `rejected.ndjson`.

## Consequences

- Safe proposal path without auto-mutating `AGENTS.md` or Cursor rules
- Review script lists pending candidates only
