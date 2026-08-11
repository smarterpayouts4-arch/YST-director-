# Agent Prompt System — Intent Compiler

Portable Cursor kit that compiles messy developer intent into a small **IntentContract** and a boring task instruction. Distinct from runtime product prompts and Next.js APIs.

APS is a **compiler, not an agent**. Soft enforcement today (Skill + rules). Hooks are deferred until correction-cost evidence proves need.

## Overview

1. Preserve user intent  
2. Discover relevant project evidence  
3. Build IntentContract (eight semantic fields; markdown-first)  
4. Ask only if the clarification gate fires  
5. Render the contract  
6. Hand off — Cursor agent executes under selected workflow(s)  
7. Verify against acceptance criteria + evidence labels  

## Quick start

```bash
npm run agent:install
npm run agent:validate
```

## How Cursor uses it

| Installed | Adapter SoT |
|-----------|-------------|
| `.cursor/rules/agent-prompt-router.mdc` | `adapters/cursor/agent-prompt-router.mdc` |
| `.cursor/rules/agent-bootstrap.mdc` | `adapters/cursor/agent-bootstrap.mdc` |
| `.cursor/skills/aps-router/SKILL.md` | `adapters/cursor/skills/aps-router/SKILL.md` |

**Primary Phase-1 entry:** the `aps-router` Skill. Do not hand-edit installed copies — edit adapters, then re-run `agent:install`.

## Folder reference

- `core/` — invariants, router, IntentContract, clarification gate, context, verification, safety
- `templates/` — boring Cursor instruction render
- `tests/` — Gate A fixtures (JSON for invariants only; not runtime interchange)
- `workflows/` — focused playbooks (not inlined into the Skill)
- `project-context/` — **pointers** to `project-knowledge/*`
- `adapters/cursor/` — Cursor bridge SoT
- `scripts/` — install / validate

## Adding a workflow

1. Add `workflows/<id>/WORKFLOW.md` with frontmatter `id: <id>`
2. Register in `manifest.json`
3. Ensure `required_context` stubs exist under `project-context/`
4. Run `npm run agent:validate`

## Updating project context

Edit pointer stubs only. Canonical truth stays in `project-knowledge/`.

## Portability

Core + workflows must not embed MarketMonth product doctrine or absolute host paths. Product north star resolves via pointers.

## Safety and privacy

APS is Cursor-only. Never merge into Next.js runtime or product prompts.

## Maintenance

After adapter edits: `npm run agent:install && npm run agent:validate`.

Audit snapshot (scores): `docs/audits/APS_INTENT_COMPILER_AUDIT.md`.

## Troubleshooting

If validate fails on sync: re-run install. If workflows missing context stubs: create pointer files. If pointer targets missing under `project-knowledge/`: fix the stub or add the canon doc.
