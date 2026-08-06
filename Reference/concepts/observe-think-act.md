---
id: ref-agent-loop-001
title: Observe–Think–Act Agent Loop
authority: advisory
status: reviewed
topics: [agents, orchestration, context, tool-use]
applies_to: [agent-prompt-system, project-knowledge, mcp]
date_added: 2026-08-05
source_file: agent-systems/agent-loop-observe-think-act.jpg
---

# Observe–Think–Act Agent Loop

Agents work in a controlled loop:

1. **OBSERVE** — Read context, files, previous tool results.
2. **THINK** — Reason about the next narrow action; check definition of done.
3. **ACT** — Call a tool, edit a file, or run a command.
4. Loop until definition of done → synthesize final response.

## Adopt for RPB

- Cursor engineering sessions follow this loop with APS workflows.
- Product workflow is a **state machine**, not a free-running agent loop.
- Always require an explicit definition of done before stopping.

## Do not adopt

- Unbounded autonomous loops without verification.
- Multi-agent debates as a default architecture for the MVP.
