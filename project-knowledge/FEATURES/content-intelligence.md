# FEATURE — Content Intelligence

Status: **Live** (Librarian MVP frozen) · Topic Engine **Live** (freeze deferred)  
Owner: product

## Purpose

Independent domain after Research Prompt Builder export. Librarian ingests completed external research into a governed Content Intelligence Library. Topic Engine (Live) consumes only `PublishedLibraryDto`.

## Live now

- Domain at `src/features/content-intelligence/{library,contracts}/`
- Step 5 thin paste handoff (local component state only → CI ownership on Send)
- **Send to Librarian replaces the active intelligence workspace with a fresh Library (new `libraryId`)**; prior library stops being active (no multi-paste item accumulation until Freshness ships)
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

Librarian MVP frozen 2026-08-12 on `ci-librarian-1.1.1` + `gpt-5.6-terra` at medium reasoning. Do not change extract/repair prompts, model, curator, quote verifier, kinds, or 150k input without a new freeze decision. Sol was not required. Handoff lifecycle (fresh Library per Send) is a storage/workspace clarification — not an extract reopen; owner may re-stamp freeze after verifying Send A → Send B provenance.

P2 (recorded, not in this freeze): “What we learned” caps each group at 6, so `isHypothesis: true` items stored as `kind: other` can be hidden under Facts & limitations.

## Topic Engine (Live — freeze deferred)

- Ready CTA: **Continue to Topics** → `/content-intelligence/topics?projectId&artifactId&return`
- Loads artifact-scoped `PublishedLibraryDto` only (never raw research / private LibraryItems)
- Rail: Librarian `06` · Topics `07` · Atom `08` (Atom = UI label for the locked Canonical Topic Packet; not a separate Content Atom architecture)
- AI proposes up to 3 **Directions** (content lanes with required `decisionQuestion`); owner selects; AI proposes exactly **6** topic opportunities; owner selects one → **one Canonical Topic Packet** (`contracts/topic-packet.ts`)
- **`ci-topics-1.1.9`** + `TOPIC_ENGINE_MODEL` / `gpt-5.6-sol` (freeze deferred pending owner six-topic + Atom smoke): Topic Strategy Doctrine in Topics prompt (curiosity = audience-relevant unresolved distinction; latent discovery→reframe→payoff potential — not mandatory seven-scene structure); supportingItemIds as Atom creator intelligence substrate; packet hydrates `decisionQuestion` + topic-relative `supportingInsights` (eligible fact\|competitor\|opportunity\|tension\|demand; skip blank/hypotheses; exact-dedupe; hard cap 8; never audience/moment; score-all-zero fail-open facts then tension\|opportunity); teaching-support hard floor ≥2 plus soft decision-rule extras; Atom UI insights-first. No Marketing-folder RAG, Atom synthesis LLM, or channel generators.
- Also retained: content lanes + decisionQuestion; shared supportingItemIds grounding contract; Directions validate→repair; title/premise audience voice; priority 1 = Recommended for Directions and Topics (no `recommended` boolean); topics repair exactly 6 from DTO or fail-closed; normally three useful grounded lanes; never invent a third to fill the screen; ops `propose-topic-directions` / `propose-topic-opportunities`
- Model routing: Topic Engine uses `TOPIC_ENGINE_MODEL` (default `gpt-5.6-sol`); Librarian remains on `OPENAI_MODEL` / Terra
- TE session stores `promptVersion` + direction diagnostics (`draftCount` / `keptCount` / `droppedCount` / `model`); old prompt sessions regenerate
- TE state: `content-intelligence-topics:v1` (sibling key; does not extend Librarian library schema)
- Step 8 Atom handoff page: full strategic brief + packet identity; owner can copy/download Canonical Topic Packet JSON (`canonical-topic-packet-{topicId}.json`) and copy a Markdown brief — machine handoff for channel systems; TE does not write hooks/scripts here
- Ready CTA **Send to Social Media** → `/social-media?...ids` only (no channel ingest/persist from TE)
- Packet consumer semantics documented for channel handoff (`doNotClaim` = compatibility mirror of `restrictions`; `confidence` = topic-selection; `sourceRefs` = provenance only); generation/payload shape unchanged
- Downstream: Social Media org hub (nav) → YouTube Shorts (Partial P1A — sole ingest owner). Other channels Planned as sibling brains under Social Media
- Structure: keep `topic-engine-shell` / `librarian-shell` as compose-first orchestrators (children already extracted). No folder split before channel work; revisit only if a third stage or second consumer appears.

## Not shipped yet

- File upload ingest
- Freshness (`current` / `superseded` / `stale`)
- Additional channel generators beyond YouTube Shorts P1A (Long-form, LinkedIn, calendars, scripts)
- Autonomous topic selection

## Non-goals

RAG, multi-agent, fine-tune, cloud DB for current MVP, runtime Reference transcript imports, web research inside Librarian or Topic Engine, platform-specific topic packets.
