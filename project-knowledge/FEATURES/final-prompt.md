# Feature — Final research prompt

## Purpose

Generate, validate, format, and export one company-specific ChatGPT research prompt with eight fixed sections and a 9/10 checklist gate.

## Status

Live

## Owners

`rpb-final-prompt`, `rpb-prompts`

## AI operation

- `operationId`: `compile-research-prompt`
- Prompt module: `src/features/research-prompt-builder/prompts/research-prompt.ts`
- Runtime version: `rpb-runtime-1.4.0`
- Export `PROMPT_VERSION`: `1.1.0`
- Map: [`src/ai/README.md`](../../src/ai/README.md) (pointer only)

## Key paths

- `src/features/research-prompt-builder/services/generate-research-prompt.ts`
- `src/features/research-prompt-builder/formatters/format-research-prompt.ts`
- `src/features/research-prompt-builder/prompts/research-prompt.ts`
- `src/app/api/research-prompt/route.ts`
- `src/features/research-prompt-builder/components/final-prompt-viewer.tsx`

## Contracts

- See `PROMPT_CONTRACT.md`
- Deterministic heading order
- Final compile allows ≤2 repair attempts on validation failure, then a post-lint with no further repair

## Non-goals

Running the research inside the app; multi-prompt studios; video scene prompts.
