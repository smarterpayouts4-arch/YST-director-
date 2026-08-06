---
id: ref-mcp-001
title: MCP Boundaries
authority: advisory
status: reviewed
topics: [mcp, security, tooling]
applies_to: [mcp, project-knowledge]
date_added: 2026-08-05
source_file: product-specs/innovative-tech-agent-os.txt
---

# MCP Boundaries

MCP is supporting plumbing — not the agent, not the intelligence engine, not the product workflow.

## Adopt now (rpb-development)

- Custom RPB Project Intelligence MCP (host stdio, read-only, document IDs)
- Context7 for technical library docs
- GitHub MCP read-only when CI exists
- Playwright MCP on demand

## Do not adopt for MVP

- Generic filesystem MCP
- Shell / Docker-control MCP
- General web-search MCP as product capability
- MCP write tools
- YouTube / research MCPs (profile defined, disabled)

RPB MCP must never be a runtime dependency of the Next.js app.
