# Feature — Adaptive interview

## Purpose

Ask one material, industry-specific question at a time using ethical TARI UX; accumulate answers into the research brief.

## Status

Live

## Owners

`rpb-interview`

## AI operation

- `operationId`: `generate-next-question`
- Prompt module: `src/features/research-prompt-builder/prompts/next-question.ts`
- Runtime version: `rpb-runtime-1.4.0`
- Completion owner: `canCompleteInterview` (server + client + Build-brief UI)
- Map: [`src/ai/README.md`](../../src/ai/README.md) (pointer only)

## Key paths

- `src/features/research-prompt-builder/components/interview-question.tsx`
- `src/features/research-prompt-builder/services/generate-next-question.ts`
- `src/features/research-prompt-builder/lib/can-complete-interview.ts`
- `src/app/api/interview/next/route.ts`

## Data in

Owner-confirmed profile from Step 2 (`ConfirmedCompanyProfile`) plus prior Q/A. Assembled by `assembleInterviewContext` — not a re-read of the raw CSV.

## UX

- Label: `Question N` (hard max 7; **no target / typical question count**)
- Strategy cards when strategic research priorities are unresolved (at most once) — not a bare Q1 ritual
- Hook → action → continue: short question, one CATEGORY_HOOK punchline, answer box, Save
- Rail interview beat is fixed (“One decision. Then the next.”) so it does not fight the main hook
- Context and file upload are collapsed; answered question stays visible while next loads / on retry
- Short-form enforced in `validation/interview.ts` (not prompt soft caps alone)
- Reset clears project storage and ephemeral busy/error flags for clean retests
- No gamification / Hooked compulsion loops; ethical single-decision only

## Contracts

- One question on screen
- Information gain over questionnaire length; stop when material decisions are resolved
- No dark patterns / gamification

## Non-goals

Endless surveys; gamification; research execution; Hooked-style compulsion loops.
