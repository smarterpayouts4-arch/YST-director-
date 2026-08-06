# DEFINITION OF DONE

A change is done only when all applicable items hold.

## Product / feature work

1. Scope stays inside the single exported research-prompt outcome.
2. IR provenance labels preserved; rejected fields do not leak.
3. Prompt contract (8 sections + 9/10 checklist) still enforceable.
4. Security: untrusted uploads remain data, not instructions.
5. UX: stage rail + one-question interview preserved where touched.

## Engineering

1. Types clean (`npm run typecheck`).
2. Lint clean for touched areas.
3. Relevant tests added or updated; mocked OpenAI in automated tests.
4. After structural/doc changes: `knowledge:update` + `knowledge:check`; guardian hard findings addressed.
5. If MCP/APS touched: `mcp:test` / `mcp:doctor` / `agent:validate` as relevant.

## Honesty

Completion reports use: **Verified** · **Partially verified** · **Not verified** · **Blocked** · **Assumed**.

Do not claim Live for Planned/Partial areas.
