# Agent Prompt System (RPB lean)

Portable Cursor task-routing kit for **Research Prompt Builder**.

## Overview

Classify substantial requests → pick ≤3 workflows → resolve `project-context/` pointers into canonical `project-knowledge/` → write a short task spec → verify with evidence labels.

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

Do not hand-edit installed copies — edit adapters, then re-run `agent:install`.

## Folder reference

- `core/` — router, spec builder, context selection, verification, safety
- `workflows/` — focused playbooks
- `project-context/` — **pointers** to `project-knowledge/*` (not doctrine copies)
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

Core + workflows must not embed MarketMonth product doctrine or absolute host paths.

## Safety and privacy

APS is Cursor-only. Never merge into Next.js runtime or product prompts.

## Maintenance

After adapter edits: `npm run agent:install && npm run agent:validate`.

## Troubleshooting

If validate fails on sync: re-run install. If workflows missing context stubs: create pointer files.

## Uninstalling

Delete installed `.cursor/rules/agent-*.mdc` and `.cursor/skills/aps-router/` (optional). Keep `agent-prompt-system/` as SoT.
