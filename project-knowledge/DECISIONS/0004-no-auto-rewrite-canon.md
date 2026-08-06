# ADR 0004 — No auto-rewrite of canon

## Status

Accepted

## Context

Knowledge scripts and agents might “helpfully” rewrite PRODUCT/ARCHITECTURE/SECURITY.

## Decision

Human doctrine under `project-knowledge/` (except `generated/`) must never be auto-rewritten. Scripts write **only** under `project-knowledge/generated/`. Generated files carry a do-not-hand-edit marker.

## Consequences

- Guardian flags missing markers and missing required docs
- Index regeneration is safe and idempotent
