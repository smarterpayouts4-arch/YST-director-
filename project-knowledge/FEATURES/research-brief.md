# Feature — Research brief

## Purpose

Assemble an owner-approved research brief from confirmed profile + interview answers, preserving restrictions and hypotheses.

## Status

Live

## Owners

`rpb-brief`

## AI operation

- `operationId`: `build-research-brief`
- Prompt module: `src/features/research-prompt-builder/prompts/research-brief.ts`
- Runtime version: `rpb-runtime-1.4.0`
- Server gate: `canCompleteInterview` must be true before brief construction (UI bypass rejected)
- Map: [`src/ai/README.md`](../../src/ai/README.md) (pointer only)

## Key paths

- `src/features/research-prompt-builder/services/build-research-brief.ts`
- `src/features/research-prompt-builder/components/research-brief-editor.tsx`
- `src/features/research-prompt-builder/prompts/research-brief.ts`
- `src/app/api/research-brief/route.ts`

## UX

Owner reviews an **agency-style brief** with progressive disclosure (same pattern as Step 2):

- Left **Brief outline** rail (4 sections) + one open panel  
- Desktop: fixed-height panel with internal scroll — not an endless page of textareas  
- Default **read** mode; **Edit** toggles editors for the active section only  
- Sticky Previous / Next section / Generate research prompt  

Sections:

1. Audience & tension  
2. Strategic bet  
3. Company & channel  
4. Guardrails  

IR field keys stay unchanged; only presentation and prompts improve.

## Contracts

- Owner approval before final prompt generation
- IR labels preserved (confirmed vs hypothesis vs restrictions)
- Audience-first substance; one primary platform

## Non-goals

Executing the research; publishing content; dark-pattern urgency; video scripts / topic calendars.
