---
name: aps-router
description: >-
  USE WHEN starting a substantial coding task — compile an APS IntentContract:
  preserve intent, discover project evidence, clarify only on material
  unresolved decisions, render a boring Cursor instruction, then hand off
  under selected workflows. Do not expand ambition.
---

# APS Intent Compiler Skill

Primary Phase-1 orchestrator. APS **compiles**; the Cursor agent **executes**.

## Pointer rule

APS `project-context/` files are pointers, not doctrine. Resolve every pointer and read the canonical `project-knowledge/` document. Prefer `rpb_read_project_doc` when RPB MCP is available.

## Steps

1. **Preserve** user intent (do not rewrite meaning; do not increase ambition).
2. **Discover** relevant project evidence (paths, symbols, tests, rules, specs) — repo answers first.
3. **Build** the IntentContract (`core/intent-contract.md`) — eight fields only.
4. **Clarify** only if `core/clarification-gate.md` three conditions all hold; otherwise zero questions.
5. **Render** with `templates/cursor-instruction.md`.
6. **Hand off:** Cursor agent executes under 1–3 workflows from `manifest.json` / `core/request-router.md`. APS supplies the contract, not the execution.
7. **Supply verification criteria** from `acceptanceCriteria`; finish with evidence labels (`core/verification-contract.md`).

## APS brief (first user-visible paragraph)

```text
Selected workflows: <id-1>, <id-2?>
```

Then the rendered `APS INTENT CONTRACT` block.

## Bypass

Typos, locate-a-file, explain-one-function, one-line fixes — skip full compile.

## Not this system

Runtime product prompts under `src/features/**/prompts/` and Next.js API routes are separate from APS. Do not inline all seven workflows into this skill.
