# Content Intelligence

Independent domain after Research Prompt Builder export.

## Workflows

| Workflow | Path | Status |
|----------|------|--------|
| **Librarian** | `library/` | Live (MVP frozen) — paste handoff → extract → curate → review → publish |
| **Topic Engine** | `topics/` | Live — `ci-topics-1.1.9` (freeze deferred pending smoke); Directions → 6 topics → Canonical Topic Packet; consumes only `PublishedLibraryDto` |

## Firewall

Librarian and Topic Engine **must not** share runtime prompts, prompt versions, AI operation IDs, workflow state, repair instructions, or output schemas — except explicit DTOs under `contracts/` (`PublishedLibraryDto`).

They **may** reuse the shared Terra client, operation registry, traces, and `src/ai/structured-output` gateway.

## RPB boundary

Step 5 may collect completed research as a **thin handoff** only. RPB must not persist, interpret, validate, or own completed research. On Send, ownership transfers to Content Intelligence (`content-intelligence:v1`).

Do not import RPB prompts, anchors, prompt-contract, decision-ledger, or `structured-openai` adapter.
