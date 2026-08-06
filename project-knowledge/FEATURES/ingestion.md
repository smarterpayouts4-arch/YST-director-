# Feature — Ingestion

## Purpose

Accept allowlisted company uploads, sanitize, extract text, and build a bounded evidence packet.

## Status

Live

## Owners

`rpb-ingestion` (see `ownership-rules.json`)

## Key paths

- `src/features/research-prompt-builder/ingestion/`
- `src/app/api/documents/extract/route.ts`

## Contracts

- Untrusted data delimiters
- Size/MIME limits
- No path leakage to clients

## Non-goals

Archives, executables, macro execution, persistent upload storage.
