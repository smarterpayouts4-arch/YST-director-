# Feature — Company understanding

## Purpose

Turn the evidence packet into a structured company understanding with IR provenance labels; let the owner confirm or correct fields before interview.

## Status

Live

## Owners

`rpb-understanding`

## AI operation

- `operationId`: `analyze-company`
- Prompt module: `src/features/research-prompt-builder/prompts/company-analyst.ts`
- Runtime version: `rpb-runtime-1.4.0`
- Map: [`src/ai/README.md`](../../src/ai/README.md) (pointer only)

## Key paths

- `src/features/research-prompt-builder/services/analyze-company.ts`
- `src/features/research-prompt-builder/lib/profile.ts`
- `src/features/research-prompt-builder/components/company-understanding.tsx`
- `src/app/api/company/understand/route.ts`

## Confirmation UX (Step 2)

Owner reviews **five sections** (one open at a time), not a ten-item census:

1. Who we’re helping  
2. Company and offer  
3. Focus and next step  
4. Trust and proof  
5. Off-limits  

Short-form Step 2 UX: punchy section payoff line, short field labels, clamped long values, Continue only after all five sections get **Looks right**. Optional notes stay collapsed on section 5. Underlying IR field keys stay separate (not merged in schema).

Persisted projects restore prior understanding from local storage; **Reset** then re-upload (or sample CSV) is required to re-run the analyst after a runtime prompt bump.

## Contracts

- Classify `observed_fact` / assumptions / unknowns on IR fields
- Corrected and confirmed values flow into `ConfirmedCompanyProfile`
- Rejected fields must not flow downstream (status supported in schema; reject control not required in current UI)
- Analyst runtime prompt stamped via `RUNTIME_PROMPT_VERSION` (`rpb-runtime-1.4.0`)

## Non-goals

Inventing facts; treating website copy repetition as independent proof; writing strategy recommendations into confirmable field values.
