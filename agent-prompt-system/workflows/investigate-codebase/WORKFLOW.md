---
id: investigate-codebase
version: 1.1.0
title: Investigate Codebase
---

# Investigate Codebase

Map owners, sources of truth, and risks before changing code.

1. Compile IntentContract with `taskType: investigate` (zero questions unless clarification gate fires).
2. Read CURRENT_STATE and ARCHITECTURE pointers → canonical docs.
3. Use RPB MCP inventories when available (`rpb_get_route_inventory`, etc.).
4. Identify owners via `ownership-rules.json`.
5. Put real paths/symbols into `projectRefs`; report findings before proposing edits.
6. End state: filled IntentContract + boring instruction; Cursor agent executes the investigation.
