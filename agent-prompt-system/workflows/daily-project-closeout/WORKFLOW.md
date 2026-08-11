---
id: daily-project-closeout
version: 1.1.0
title: Daily Project Closeout
---

# Daily Project Closeout

End-of-day gates under IntentContract `taskType: closeout`.

1. `npm run typecheck` / tests as relevant
2. `npm run knowledge:update && npm run knowledge:check`
3. `npm run knowledge:guardian` (acknowledge warns; fix hards)
4. `npm run mcp:test` / `mcp:doctor` if MCP touched
5. `npm run agent:validate` if APS touched
6. Honest status vs CURRENT_STATE (Live / Partial vocabulary — no numeric APS scores)
