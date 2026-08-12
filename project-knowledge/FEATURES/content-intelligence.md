# FEATURE — Content Intelligence

Status: **Live** (Librarian MVP frozen) · Topic Engine **Planned**  
Owner: product

## Purpose

Independent domain after Research Prompt Builder export. Librarian ingests completed external research into a governed Content Intelligence Library. Topic Engine (Planned) consumes only `PublishedLibraryDto`.

## Live now

- Domain at `src/features/content-intelligence/{library,contracts}/`
- Step 5 thin paste handoff (local component state only → CI ownership on Send)
- Immutable `ResearchArtifact` + separate `ExtractionRun`
- Op `extract-content-intelligence` (`ci-librarian-1.1.1`) via shared gateway
- Deterministic curate with **stricter auto-stage** + exception queue
- Owner UI: summary + needs attention + technical details (advanced records secondary)
- **Research intelligence ready** is a status; `PublishedLibraryDto` auto-builds when no exceptions remain, scoped to the active artifact (accepted items only; no raw research, rejected items, or extraction internals)
- Hard max research input from `research-input-limits.ts` (`MAX_RESEARCH_INPUT_CHARS`, JS `string.length`) — **no silent truncation**; capacity counter only at ≥85% of max
- Acceptance of a full research report does **not** guarantee every fact becomes a Librarian artifact; extraction output limits (e.g. ≤80 items) are a separate downstream policy
- Storage key `content-intelligence:v1`

## Locked kinds

`fact` · `audience` · `moment` · `tension` · `opportunity` · `demand` · `competitor` · `restriction` · `unresolved` · `limitation` · `other`

Evidence/source/confidence are item metadata, not kinds.  
Origin: `extracted` | `owner_edited` | `owner_added` (distinct from provenance).

## Auto-stage (clean → accepted)

All of: statement present · confidence medium/high · verified verbatim `evidenceQuote` · non-empty provenance · not `unresolved` · not `quoteCleared`.  
Hypotheses may auto-accept only when `isHypothesis: true` and otherwise clean.  
Else → `needs_review` (Needs your attention).

## Freeze

Librarian MVP frozen 2026-08-12 on `ci-librarian-1.1.1` + `gpt-5.6-terra` at medium reasoning. Do not change extract/repair prompts, model, curator, quote verifier, kinds, or 150k input without a new freeze decision. Sol was not required.

P2 (recorded, not in this freeze): “What we learned” caps each group at 6, so `isHypothesis: true` items stored as `kind: other` can be hidden under Facts & limitations.

## Not shipped yet

- File upload ingest
- Freshness (`current` / `superseded` / `stale`)
- Topic Engine / `topics/` tree

## Non-goals

RAG, multi-agent, fine-tune, cloud DB for current MVP, runtime Reference transcript imports, topics/content/hooks/scripts generation, web research inside Librarian.
