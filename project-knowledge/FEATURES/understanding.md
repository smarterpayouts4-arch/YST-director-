# Feature — Company understanding

## Purpose

Turn the evidence packet into a structured company understanding with IR provenance labels; let the owner confirm, correct, or reject fields.

## Status

Live

## Owners

`rpb-understanding`

## Key paths

- `src/features/research-prompt-builder/services/analyze-company.ts`
- `src/features/research-prompt-builder/components/company-understanding.tsx`
- `src/app/api/company/understand/route.ts`

## Contracts

- Classify `observed_fact` / assumptions / unknowns
- Rejected fields do not flow downstream

## Non-goals

Inventing facts; treating website copy repetition as independent proof.
