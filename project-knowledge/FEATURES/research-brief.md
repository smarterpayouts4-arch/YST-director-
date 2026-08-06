# Feature — Research brief

## Purpose

Assemble an owner-approved research brief from confirmed profile + interview answers, preserving restrictions and hypotheses.

## Status

Live

## Owners

`rpb-brief`

## Key paths

- `src/features/research-prompt-builder/services/build-research-brief.ts`
- `src/features/research-prompt-builder/components/research-brief-editor.tsx`
- `src/app/api/research-brief/route.ts`

## Contracts

- Owner approval before final prompt generation
- IR labels preserved

## Non-goals

Executing the research; publishing content.
