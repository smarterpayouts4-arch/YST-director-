---
id: ref-learning-001
title: Progressive Learning (Safe Path)
authority: advisory
status: reviewed
topics: [agents, learning, approval]
applies_to: [agent-learning, agent-prompt-system]
date_added: 2026-08-05
source_file: agent-systems/progressive-agent-learning-loop.jpg
---

# Progressive Learning — Safe Path

The diagram shows an agent writing corrections directly into a rules file. That is **useful intent, unsafe mechanism**.

## Adopt

```text
Correction detected
 → Learning candidate created
 → Duplicate/conflict scan
 → Evidence attached
 → Human review
 → Approved rule pack
```

Store candidates in `agent-learning/candidates.ndjson`. Never silently rewrite `AGENTS.md` or Cursor rules.

## Do not adopt

- Agent auto-editing governing instruction files
- Accumulating thousands of overlapping rules without dedupe
- Treating packaging sync as proof of agent compliance
