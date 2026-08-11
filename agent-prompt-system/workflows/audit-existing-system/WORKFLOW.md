---
id: audit-existing-system
version: 1.1.0
title: Audit Existing System
---

# Audit Existing System

Findings-first audit with evidence. Separate findings from fixes unless asked.

1. Compile IntentContract with `taskType: audit`.
2. Compare CURRENT_STATE claims against code; put inspected paths in `projectRefs`.
3. Prefer Verified / Partially verified labels.
4. Do not expand into an unsolicited rewrite program (precision, not ambition).
