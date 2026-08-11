# Enforcement deferred (Gate C)

Hooks, fail-closed validators, and contract-presence gates are **not** part of Phase 1.

Building enforcement for failures that have not happened is how agent systems go wrong: every deterministic rule blocks some bad behavior and also constrains future model capability.

## When to revisit

Only after measured correction-cost failures justify it:

- Intent correction rate stays high after Gate A/B
- Agents repeatedly skip IntentContracts on substantial work
- Model inference repeatedly promotes into requirements despite documentation

## If earned later

Prefer Skill reminders and narrow `preToolUse` checks. Do **not** base the compiler on `beforeSubmitPrompt` prompt rewriting or untested `updated_input` for `Task` subagents.

See also: `docs/audits/APS_INTENT_COMPILER_AUDIT.md` (Gate C section).
