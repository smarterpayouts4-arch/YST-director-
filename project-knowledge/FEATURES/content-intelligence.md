# FEATURE — Content Intelligence

Status: **Partial** (Librarian vertical slice)  
Owner: product

## Purpose

Independent domain after Research Prompt Builder export. Librarian ingests completed external research into a governed Content Intelligence Library. Topic Engine (Planned) consumes only `PublishedLibraryDto`.

## Live now (PR1)

- Domain at `src/features/content-intelligence/{library,contracts}/`
- Step 5 thin paste handoff (local component state only → CI ownership on Send)
- Immutable `ResearchArtifact` (raw source only — no extract metadata)
- Separate `ExtractionRun` records (model, promptVersion, extractedAt, validationResult)
- Op `extract-content-intelligence` via shared structured-output gateway
- Deterministic `curate-library` + owner review (`needs_review` / `accepted` / `rejected`)
- Publish accepted items to `PublishedLibraryDto`
- Storage key `content-intelligence:v1`

## Locked kinds

`fact` · `audience` · `moment` · `tension` · `opportunity` · `demand` · `competitor` · `restriction` · `unresolved` · `limitation` · `other`

Evidence/source/confidence are item metadata, not kinds.  
Origin: `extracted` | `owner_edited` | `owner_added` (distinct from provenance).

## Acceptance gate before Librarian freeze

PR1 structure is accepted. Before Topic Engine work, smoke-test intelligence quality on:

1. Actual ZYNAVA completed research response  
2. 2–3 very different completed research reports  

Check only:

| Check | Pass means |
|-------|------------|
| Intelligence vs summary | Terra extracts reusable items, not a report paraphrase |
| Kind usage | Locked kinds used naturally (no platform/evidence kinds) |
| Quote integrity | `evidenceQuote` ⊆ raw `ResearchArtifact` (or cleared + needs_review) |
| Hypothesis | Uncertainty / hypothesis preserved via `isHypothesis` + kind choices |
| Edit origin | Edit → `owner_edited` |
| Add origin | Owner-added item stays `owner_added`, distinct from extracted |
| Publish filter | `PublishedLibraryDto` = accepted items only |
| Weak evidence | Missing/weak → `needs_review` / omit — not invention |
| Agnostic | No industry/platform hardcoding in extracted structure |

If those pass → **freeze Librarian**. Next domain piece: Topic Engine discovery/design consuming only `PublishedLibraryDto`.

Do **not** start before freeze: upload, freshness, RAG, agents, refresh.

## Not shipped yet

- File upload ingest
- Freshness (`current` / `superseded` / `stale`)
- Topic Engine / `topics/` tree

## Non-goals

RAG, multi-agent, fine-tune, cloud DB for current MVP, runtime Reference transcript imports, topics/content/hooks/scripts generation, web research inside Librarian.
