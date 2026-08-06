# MCP Lockdown — Research Prompt Builder

Policy source: `docs/ai/mcp-profiles.yaml` (profile `rpb-development`).
This document is the owner-facing checklist for aligning Cursor's actual MCP
surface with that policy. Audit context: `docs/audits/FOUNDATION_READINESS_AUDIT.md` §10.

## Target state

| Tier | Servers / tools |
|------|-----------------|
| **Always enabled** | RPB Project Intelligence (`rpb_*`, host stdio) · Context7 (technical library docs only) |
| **On demand** | GitHub **read-only** · Playwright browser · Perplexity (developer research only) |
| **Disabled** | GitHub write tools (`create_or_update_file`, `push_files`, `merge_pull_request`, `delete_file`, `issue_write`, …) · MCP gateway-control tools (`mcp-add`, `mcp-exec`, `mcp-config-set`, `code-mode`, …) · YouTube/transcript tools (MVP) · RepoBrain mutation tools (`import_*`, `set_active_project`, `create_reference_package`) · any generic filesystem or shell MCP |

## Why

- Project policy is read-only, allowlisted MCP for product intelligence
  (ADR `project-knowledge/DECISIONS/0002-read-only-mcp.md`).
- The Docker MCP gateway currently exposes ~100 tools including GitHub write
  and gateway self-modification — far beyond what this project needs, and a
  real blast radius if an agent misfires.

## Owner steps (local, one time)

1. Connect RPB MCP:

   ```powershell
   Copy-Item .cursor\mcp.json.example .cursor\mcp.json
   ```

   Then reload Cursor. `.cursor/mcp.json` is gitignored.

2. In Cursor Settings → MCP:
   - Disable **MCP_DOCKER** for this project, or disable its GitHub-write and
     `mcp-*` gateway tools if per-tool toggles are available.
   - Leave **Perplexity** enabled but treat it as on-demand developer research.
   - Disable or leave **RepoBrain** off for this project (duplicates RPB
     project intelligence; has import/write paths).

3. Verify: ask the agent to list available `rpb_*` tools — 13 read-only tools
   should appear; no `create_or_update_file` / `push_files` should be callable.

## Version pinning

- MCP SDK: `@modelcontextprotocol/sdk` pinned via `package.json` /
  `package-lock.json`. Do **not** accept automatic major protocol upgrades;
  any SDK bump must pass `npm run mcp:test` (smoke + allowlist drift) and
  `npm run mcp:doctor` before merge.
- The MCP specification continues to evolve (authorization hardening,
  stateless operation, protocol revisions). Treat spec-version changes as a
  reviewed dependency change, never a silent update.

## Never

- MCP write tools for this repository's product intelligence.
- Web-search MCP as a product runtime capability.
- Enabling the `rpb-research-future` (YouTube) profile during MVP.
