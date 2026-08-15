# FEATURE — YouTube Shorts

Status: **Partial** (P1A frozen + P1B storyboard + P1C production expansion)  
Owner: product

## Purpose

Channel generator for YouTube Shorts. Consumes a Canonical Topic Packet (Atom) into an immutable Shorts-owned portfolio, then storyboard → production expansion into seven complete scene packages for external still → voice → motion. This product does not render video or invent media.

Social Media is the **organizational parent only** (nav/journey hub). Shorts is a complete independent brain under that parent. Future Long-form / LinkedIn are sibling trees — never import Shorts creative internals.

## Partial now (P1A + P1B + P1C)

- Domain at `src/features/social-media/youtube-shorts/{brain,contracts,schemas,state,components,config,prompts,services,export}/`
- Routes: `/social-media` (nav hub only) → click YouTube Shorts → `/social-media/youtube-shorts`
- Ready Atom CTA **Send to Social Media** → IDs only (no ingest) → hub → channel click → **Shorts shell sole ingest owner**
- Hub must not import Shorts contracts/state or call ingest/persist
- Atom identity agreement lives at `content-intelligence/contracts/resolve-atom-identity.ts` (Shorts re-exports as `resolveShortsIdentity`)
- Storage key `social-media-youtube-shorts:v1` with `sessionsByTopicPacketId` multi-portfolio map
- Full immutable `ingestedAtom` snapshot; byte-stable re-ingest (no timestamp bump)
- 16-field projection contract (UI shows compact **Atom received** — not a field dump)
- Resume: Shorts storage first; one-time TE seed via `loadTopicSession` only when missing + `artifactId`
- P1B: `YOUTUBE_SHORTS_MODEL` / `getYouTubeShortsModel()` (default `gpt-5.6-terra`); one `generate-shorts-storyboard` operation; Shorts Story Brain at `brain/` (distilled MD → `prompts/story-brain.ts`; never RAG / never import `Reference/`); model locks `storyArchitecture` (`hookWhy`, `beats[].because`) then writes exactly 7 scenes; spoken first-hearing language + Hook procedure + causal beats + 22-word narration budget + spoken rewrite pairs + concept naming / two-beat payoff + repeated-bigram echo check + closed-world locations / spoken-only analyst idioms / payoff compression (`ci-shorts-1.5.4`); generated/working/approved snapshots; owner review/edit/approve. No AI on mount.
- P1B workspace (density): 3-column status card; seven small 9:16 contact-sheet thumbs; field-tab scene editor; View Full Story overlay drawer. No image attachment.
- Scene package placement: selected scene uses a **field-tab inspector** — Role, Purpose, Scene Description, Timing, Narration, On-Screen Text (storyboard) plus Visual Prompt, Voice Direction, Asset Type, Motion Prompt, Continuity (production). One active panel; Copy ×3 enabled after expand.
- P1C: sibling `youtube-shorts-production` schema (`projectVisualContinuity`, optional CHARACTER*, per-scene `continuityDelta` + visual/motion/voice/asset). One `expand-shorts-production` whole-board call; narration/OST omitted from LLM and merged on export from approved storyboard. Persist `generatedProduction` + `workingProduction` + `productionPromptVersion` + `productionGeneratedAt`. No `approvedProduction`. Clear production on storyboard regenerate/edit/reopen. Deterministic paste export in `export/format-scene-paste.ts`.
- Continuity is an **internal** production concept — export maps only supported locks into `CHARACTER NAME` / `CHARACTER IDENTITY` / `CHARACTER CONTINUITY` when talent exists; never bare `CONTINUITY:` or `PROJECT VISUAL CONTINUITY` paste headers.
- Future scene-level repair (not implemented): revising Scene N must see Atom truth, the approved storyboard, neighbors N-1/N+1, and overall progression. No per-scene LLM in P1C v1.
- Reference HOW library on disk at `Reference/channels/youtube-shorts/` — **never** runtime-imported; **never** stored in session. No feature-local raw Reference corpus. Shorts-owned brain MD under `src/features/social-media/youtube-shorts/brain/` is a deliberate distill, not a raw dump. Working director files: Arijon visual grammar + Milne scene direction (P1C). Raw books retired from the active repo (provenance in SOURCE_MAP).

## Not shipped yet

- External stills into 9:16 frames / continuity still review / motion generation UI
- Sibling channels (`youtube-long-form/`, etc.)

## Non-goals (current phase)

RAG, runtime Reference imports, shared Social Media creative brain (`SOCIAL_MEDIA_MODEL`, parent `prompts|state|schemas|services`), lifting ingest to parent `social-media/` beyond nav, Social Media Atom store, reopening TE/Librarian freezes.
