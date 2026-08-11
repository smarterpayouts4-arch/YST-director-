# Feature — Ingestion

## Purpose

Accept allowlisted company uploads, sanitize, extract text, and build a bounded evidence packet.

## Status

Live

## Owners

`rpb-ingestion` (see `ownership-rules.json`)

## AI operation (document extract)

- `operationId`: `extract-supporting-context`
- Prompt module: `src/features/research-prompt-builder/prompts/supporting-context.ts`
- Runtime version: `rpb-runtime-1.4.0`
- Map: [`src/ai/README.md`](../../src/ai/README.md) (pointer only)

## Key paths

- `src/features/research-prompt-builder/ingestion/`
- `src/app/api/documents/extract/route.ts`

## Contracts

- Untrusted data delimiters
- Size/MIME limits
- No path leakage to clients

## Non-goals

Archives, executables, macro execution, persistent upload storage.
