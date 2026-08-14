# FEATURE — YouTube Shorts

Status: **Partial** (P1A foundation)  
Owner: product

## Purpose

Channel generator for YouTube Shorts. Consumes a Canonical Topic Packet (Atom) into an immutable Shorts-owned portfolio, then (later) storyboard/expansion that emits a video-generation-ready **prompt**. This product does not render video.

Social Media is the **organizational parent only** (nav/journey hub). Shorts is a complete independent brain under that parent. Future Long-form / LinkedIn are sibling trees — never import Shorts creative internals.

## Partial now (P1A — zero AI)

- Domain at `src/features/social-media/youtube-shorts/{contracts,schemas,state,components,config}/`
- Routes: `/social-media` (nav hub only) → click YouTube Shorts → `/social-media/youtube-shorts`
- Ready Atom CTA **Send to Social Media** → IDs only (no ingest) → hub → channel click → **Shorts shell sole ingest owner**
- Hub must not import Shorts contracts/state or call ingest/persist
- Atom identity agreement lives at `content-intelligence/contracts/resolve-atom-identity.ts` (Shorts re-exports as `resolveShortsIdentity`)
- Storage key `social-media-youtube-shorts:v1` with `sessionsByTopicPacketId` multi-portfolio map
- Full immutable `ingestedAtom` snapshot; byte-stable re-ingest (no timestamp bump)
- 16-field projection contract tested for P1B (UI shows compact **Atom received** — not a field dump)
- Resume: Shorts storage first; one-time TE seed via `loadTopicSession` only when missing + `artifactId`
- Reference HOW library on disk at `Reference/channels/youtube-shorts/` — **never** runtime-imported; **never** stored in session. No feature-local raw corpus under `src/features`. Working director files: Arijon visual grammar + Milne scene direction. Raw books retired from the active repo (provenance in SOURCE_MAP).

## Not shipped yet

- Storyboard LLM / Shorts doctrine distill (P1B)
- Expansion (P1C)
- `prompts/`, AI routes, `YOUTUBE_SHORTS_MODEL`, AI ops registry entries
- Sibling channels (`youtube-long-form/`, etc.)

## Non-goals (current phase)

RAG, runtime Reference imports, shared Social Media creative brain (`SOCIAL_MEDIA_MODEL`, parent `prompts|state|schemas|services`), lifting ingest to parent `social-media/` beyond nav, Social Media Atom store, reopening TE/Librarian freezes.
