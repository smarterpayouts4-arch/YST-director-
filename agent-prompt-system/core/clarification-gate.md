# Clarification gate

Ask a question **only** when all three are true:

1. Something required for safe or correct execution is **unresolved**.
2. Repository / project evidence **cannot** resolve it.
3. Choosing incorrectly would **materially change** the implementation.

If any condition fails → **do not ask**.

This file is a gate, not an expert system. Do not grow keyword matrices or scoring here.

## Worked examples

| Request | Ask? | Why |
|---------|------|-----|
| Rename `CustomerModal` to `ClientModal` | No | Fully specified; discover rename sites in repo |
| Make authentication more secure | No (usually) | Discovery first; security spec + code often define the gap as investigate/plan |
| Replace login with social auth; repo supports Google, GitHub, Microsoft with no owner signal | Yes | Real owner decision; wrong choice changes implementation |

## Repo answers first

Never ask the developer for facts the repository can answer (canonical modal, existing pattern, script name, route owner). Put those identities in `projectRefs`.

## Trivial requests

Zero questions. Emit a tight IntentContract and hand off.
