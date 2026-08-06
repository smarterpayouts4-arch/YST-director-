# APS System — Research Prompt Builder

## Purpose

Give Cursor agents the right workflow and context at the right time without a giant always-on bible.

## Loop

1. Classify the request (investigation / planning / implementation / verification / audit / security / closeout).
2. Select 1–3 workflow IDs from `manifest.json`.
3. Resolve only those workflows' `project-context/` pointers → read canonical `project-knowledge/` targets.
4. Emit a short task spec (goal, in/out, acceptance, verification).
5. Implement inside scope.
6. Finish with evidence labels: Verified / Partially verified / Not verified / Blocked / Assumed.

## Separation

```text
Project Knowledge ≠ Agent Prompt System ≠ Product MCP ≠ Runtime Product Prompts
```

## Product outcomes (must not regress)

Accuracy · Specificity · Research Depth · Repeatability
