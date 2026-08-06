# ADR 0001 — Three-plane separation

## Status

Accepted

## Context

Agents and humans mix product UI, runtime LLM prompts, and repository intelligence into one undifferentiated context, which causes scope creep and unsafe writes.

## Decision

Separate **Product**, **AI Control**, and **Engineering Intelligence** planes. Canonical doctrine lives in `project-knowledge/`. Runtime prompts stay under feature modules. APS and MCP read doctrine; they do not own product truth.

## Consequences

- Clear ownership and review boundaries
- MCP/APS cannot silently become product runtime
- Slightly more navigation for agents (bootstrap + CURRENT_STATE first)
