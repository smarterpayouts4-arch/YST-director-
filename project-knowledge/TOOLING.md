# TOOLING — Doctor, Verify, MCP, APS

## Primary commands

| Script | Purpose |
|--------|---------|
| `npm run doctor` | Architecture health report (also runs automatically before `dev` / `start:safe`) |
| `npm run dev` | **Default:** `doctor` then Next.js; fails closed if doctor fails |
| `npm run dev:fast` | Next.js only (skip doctor) for tight UI loops |
| `npm run start:safe` | `doctor` then production `next start` |
| `npm run knowledge:update` | Regenerate indexes/maps/reports under `generated/` |
| `npm run knowledge:check` | Verify generated envelopes exist |
| `npm run knowledge:guardian` | Emit `PK-HARD-*` / `PK-WARN-*` findings |
| `npm run agent:install` | Copy APS adapters into `.cursor/` |
| `npm run agent:validate` | Check APS sync + inventory |
| `npm run mcp:server` | Run RPB MCP over stdio |
| `npm run mcp:test` | Smoke: list tools, reject arbitrary path |
| `npm run mcp:doctor` | Required `rpb_*` tools present |
| `npm run verify` | Full merge gate: doctor + lint + typecheck + test + knowledge + APS + MCP + build |

## MCP profiles

| Profile | Role |
|---------|------|
| **RPB MCP** (primary) | Allowlisted project docs + generated inventories |
| **Context7** | Technical library docs only — not product truth |
| GitHub / Playwright | Optional, on demand |
| Filesystem / shell / web-search / write MCP | Do **not** adopt for MVP product intelligence |

RPB MCP must never be a runtime dependency of the Next.js app.

## APS

Agent Prompt System routes Cursor work: classify → ≤3 workflows → resolve `project-context/` pointers → task spec → evidence labels. Install with `npm run agent:install`.

## Agent learning

`agent-learning/` stores candidates only. Permanence requires human approval. Never auto-rewrite `AGENTS.md` or canonical doctrine.
