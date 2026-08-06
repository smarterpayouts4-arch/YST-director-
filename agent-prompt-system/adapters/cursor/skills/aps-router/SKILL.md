---
name: aps-router
description: >-
  USE WHEN starting a substantial coding task in this repo — run Agent Prompt
  System preflight: classify request, select ≤3 workflows from
  agent-prompt-system/manifest.json, resolve project-context pointers into
  canonical project-knowledge/, emit task spec before large edits.
---

# APS Router Skill

## Pointer rule

APS `project-context/` files are pointers, not doctrine. Resolve every pointer and read the canonical `project-knowledge/` document. Prefer `rpb_read_project_doc` when RPB MCP is available.

## Steps

1. Read `core/request-router.md` and `manifest.json`.
2. Pick 1–3 workflows.
3. APS brief: `Selected workflows: …`
4. Resolve required_context pointers → canonical docs.
5. Write short task spec.
6. Finish with evidence labels.

## Bypass

Typos, locate-a-file, explain-one-function, one-line fixes.
