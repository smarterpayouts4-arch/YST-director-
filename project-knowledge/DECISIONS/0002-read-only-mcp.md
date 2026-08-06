# ADR 0002 — Read-only MCP

## Status

Accepted

## Context

Arbitrary filesystem or write-capable MCP tools risk leaking secrets and rewriting doctrine.

## Decision

RPB MCP is host-stdio, read-only, document-ID allowlisted (`rpb_*` tools only). No MarketMonth discovery/SEO tools. No write tools. No arbitrary path arguments.

## Consequences

- Safer agent context loading
- Unknown IDs return `DOCUMENT_NOT_REGISTERED` with alternatives
- Inventories come from generated maps, not free-form FS walks from the model
