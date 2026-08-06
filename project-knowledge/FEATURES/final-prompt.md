# Feature — Final research prompt

## Purpose

Generate, validate, format, and export one company-specific ChatGPT research prompt with eight fixed sections and a 9/10 checklist gate.

## Status

Live

## Owners

`rpb-final-prompt`, `rpb-prompts`

## Key paths

- `src/features/research-prompt-builder/services/generate-research-prompt.ts`
- `src/features/research-prompt-builder/formatters/format-research-prompt.ts`
- `src/features/research-prompt-builder/prompts/research-prompt.ts`
- `src/app/api/research-prompt/route.ts`
- `src/features/research-prompt-builder/components/final-prompt-viewer.tsx`

## Contracts

- See `PROMPT_CONTRACT.md`
- Deterministic heading order
- Repair once on validation failure

## Non-goals

Running the research inside the app; multi-prompt studios; video scene prompts.
