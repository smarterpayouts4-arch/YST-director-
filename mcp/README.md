# Research Prompt Builder MCP

Host-stdio, **read-only** project intelligence MCP for Cursor.

## Role

- Allowlisted document IDs only
- Prefix: `rpb_`
- No write tools
- No MarketMonth discovery/SEO tools
- Not a runtime dependency of the Next.js app

## Commands

```bash
npm run mcp:server
npm run mcp:test
npm run mcp:doctor
```

## Tools

- `rpb_get_agent_bootstrap`
- `rpb_list_project_docs`
- `rpb_find_project_doc`
- `rpb_read_project_doc`
- `rpb_product_overview`
- `rpb_architecture_map`
- `rpb_current_state`
- `rpb_get_repository_tree`
- `rpb_get_route_inventory`
- `rpb_get_prompt_inventory`
- `rpb_get_schema_inventory`
- `rpb_get_guardian_report`
- `rpb_get_reference_concept`

Logs go to **stderr** only (stdout is MCP protocol).
