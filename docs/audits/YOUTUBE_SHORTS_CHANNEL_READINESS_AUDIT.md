# YouTube Shorts Channel Readiness Audit

**Mode:** Forensic only — no production implementation  
**Date:** 2026-08-13  
**Scope:** Social Media shell + YouTube Shorts channel readiness after Canonical Topic Packet / Atom  
**Evidence labels:** Verified · Partially verified · Not verified · Blocked · Assumed  

This is **this product’s** channel-readiness report. It is **not** a duplicate of the MarketMonth archive audit at `Reference/archives/marketmonth/project-knowledge/audits/youtube-shorts-forensic/`. Cite that archive as pattern-mining only.

---

## 1. Executive verdict

The project is **ready to receive** Social Media **downstream of Atom** as a new domain. It is **not** ready as a finished YouTube Shorts product.

Reusable infrastructure already exists: Canonical `TopicPacket`, structured-output gateway, per-domain model env pattern, operation registry, Topic Engine localStorage resume, journey-rail Social Media chapter placeholder, and the compact-doctrine-in-TypeScript pattern used by Topic Engine.

There is **no** live channel / video / storyboard / media-generation system in `src/`. MarketMonth Shorts material under `Reference/archives/marketmonth/` is docs-only and must not be ported.

**Smallest correct architecture:** Atom → Shorts-owned ingest snapshot → Storyboard LLM → owner approval → Expansion LLM → copy/download production prompts. Reject one-call giant prompts and per-scene LLM agents for P1.

**Canon tension (Verified):** `AGENTS.md` says channel generators are next. `project-knowledge/PRODUCT.md` still lists storyboards / image-video generation as MVP non-goals. P1 requires an explicit owner canon amendment — not a silent contradiction.

**Isolation law (locked):** Canonical Atom is the last shared intelligence artifact. Social Media is navigation only. Every channel owns a complete independent creative brain.

---

## 2. What exists today

| Area | Status | Evidence |
|------|--------|----------|
| Canonical Topic Packet / Atom | Live | `src/features/content-intelligence/contracts/topic-packet.ts` |
| Ready / Atom UI (step 08) | Live | `topic-ready-view.tsx` — export only; no forward CTA to Shorts |
| Social Media journey chapter | Placeholder | `journey-chapters.ts` — `kind: "future"`, empty `stepIds` |
| `/social-media` routes | Absent | No `src/app/social-media/` |
| YouTube Shorts feature tree | Absent | No `src/features/social-media/` |
| Channel LLM ops | Absent | Registry ends at Topic Engine ops |
| Media generation (Gemini/Wan/TTS/FFmpeg) | Absent | Not in `src/` or `.env.example` |
| Cold Atom smoke | Script only | `scripts/smoke-atom-dual-118.mts` — long-form outline, not Shorts, not app-wired |

**Evidence:** Verified.

---

## 3. Frozen Atom handoff readiness

**Score: 9/10 (Verified).**

`TopicPacket` is already the channel-neutral strategic handoff. Claim surface is `supportingInsights` + `evidenceQuotes`, bounded by `restrictions` / `limitations` / uncertainty. `sourceRefs` / `provenanceNotes` are provenance only. `doNotClaim` mirrors `restrictions`.

Ready (step 08) exports JSON/Markdown and does not navigate forward. Persistence: `content-intelligence-topics:v1`. Resume keeps Ready+packet even when prompt version differs.

Closest live fixture: `scripts/_live-atom-118-dual.json` framework atom titled **“Why price per serving can still compare the wrong things”** (owner phrasing was slightly shorter). Audit uses the persisted fixture, not a fabricated packet.

**Gap:** No Shorts ingest. No CTA. No Shorts-owned Atom snapshot.

**Smallest fix (P1):** CTA **Create for YouTube Shorts** → one-shot copy of full `TopicPacket` into Shorts session as immutable `ingestedAtom`.

---

## 4. Social Media navigation readiness

**Score: 4/10 (Verified).**

Social Media exists only as a future chapter preview in `JourneyRail`. `researchSettled` exists but is never passed `true` on Atom. No hub route.

**Smallest fix:** `/social-media` hub with link-only channel cards; Shorts live; others coming-soon. Shorts pages pass `researchSettled={true}`. Do **not** add numbered step 09 — rail hardcodes `{step} / 08`.

---

## 5. YouTube Shorts route/shell readiness

**Score: 0/10 (Verified).**

No route, shell, session, or UI.

**Smallest fix:** `src/app/social-media/youtube-shorts/page.tsx` + `youtube-shorts-shell.tsx` mirroring Topics page pattern (client + Suspense + query params).

---

## 6. Existing channel/video code inventory

**Score: 0/10 production channel code (Verified).**

| Item | Classification |
|------|----------------|
| Journey Social Media chapter | Nav placeholder |
| TopicPacket channel comments | Contract only |
| TE / RPB bans on scripts / seven-scene | Correct upstream fence |
| `smoke-atom-dual-118.mts` `coldChannel` | RISK if promoted to `src/` — keep script-only |
| MarketMonth Content Brain / `produceContentBundle` | FORBIDDEN-TO-COPY archive |

---

## 7. Existing model-routing infrastructure

**Score: 8/10 reusable (Verified).**

- `OPENAI_MODEL` (Terra) — Librarian / RPB  
- `TOPIC_ENGINE_MODEL` (Sol) — Topic Engine only  
- Global `OPENAI_REASONING_EFFORT`  
- Gateway: `parseStructuredOutput` with optional `model` override  
- Repair ≤1 for most ops; AiTrace in-memory  

**Recommendation:** one `YOUTUBE_SHORTS_MODEL` + `getYouTubeShortsModel()`. Do **not** use `SOCIAL_MEDIA_MODEL`. Do **not** reuse `TOPIC_ENGINE_MODEL`. Do not split storyboard/expansion env vars until telemetry proves need.

---

## 8. Existing persistence/resume infrastructure

**Score: 8/10 pattern reusable (Verified).**

Topic Engine pattern: envelope + `resume-topic-session.ts` + no silent regen on mount when resumable. Prompt-version mismatch resumes with banner (code), does not auto-regenerate.

**P1 Shorts:** mirror with `social-media-youtube-shorts:v1`, keyed by `topicPacketId`, holding `ingestedAtom` + creative stages. After ingest, Shorts must not re-read TE storage on every mount.

---

## 9. Reference corpus inventory

| Need | Path | Runtime today |
|------|------|---------------|
| Marketing hook | `Reference/advisory-sources/narrative/marketing-hook.txt` | No |
| Storytelling | part-1 (uncatalogued), part-2, `Reference/concepts/story-and-hook-for-research-prompts.md` | Partial RPB only |
| Line of Discovery (7 roles as named framework) | **Not found** | TE latent quality lens only |
| Short video workflow | `Reference/advisory-sources/narrative/short-video-workflow.txt` | No |
| Arijon PDF | `Reference/_OceanofPDF.com_Grammar_of_the_Film_Language_-_Daniel_Arijon.pdf` (~726 pp) | No notes / not in manifest |
| Hooked / TARI | extract + ethical-tari concept | Interview UX; Variable Reward rejected |
| MarketMonth Shorts | `Reference/archives/marketmonth/` | Not product truth |

**Evidence:** Verified. Distill independently per channel into compact TypeScript doctrine. **Not RAG.**

---

## 10. Marketing Hook doctrine extraction

**Topic-level (already upstream / Atom / TE):** audience must care; curiosity from unresolved distinction; anti-clickbait; planted question as strategic tension.

**Shorts execution (storyboard doctrine):** first-frame clarity; context before cleverness; open-loop pacing; visual hook; no opaque clickbait; deliver on promise.

**Reject for Shorts story doctrine:** algorithm scrollback hacks; comment-fight virality; feed-mismatch ops tricks.

**Evidence:** Verified from `marketing-hook.txt` + TE doctrine fence (no finished hooks at Topic Engine).

---

## 11. Storytelling doctrine extraction

**Storyboard:** Dance (but/therefore); conversational one-to-one tone; story lens; rhythm in narration; memorable payoff / direction; anticipation / curiosity / climax adapted to ~50s.

**Expansion / delivery:** visual hook pairing; body language / gesture only as production notes; not schema enums.

**Product/habit only:** Hooked Trigger→Action→Variable Reward→Investment — keep out of Shorts story unless separately justified. Variable Reward rejected for owners.

---

## 12. Line of Discovery doctrine extraction

In-repo: TE `topic-strategy-doctrine.ts` treats Discovery / Mistake / Reframe / Framework / Payoff as a **latent quality lens**, not a schema enum. No file defines the seven roles as Emotional Hook → … → Payoff verbatim.

Short-video-workflow’s seven scenes are a magnesium-specific example (social proof, food route) — do not hard-code those labels.

**Verdict:** Shorts **default spine + quality lens**. Not a Zod enum. Not a global Social Media schema. Future Long-form must ignore freely. Never invent Mistake/Framework unsupported by Atom.

---

## 13. Short Video Workflow doctrine extraction

From `short-video-workflow.txt` (**Verified**):

- Story first, prompts second  
- Complete story reviewed together  
- ~6–8s per scene, ~49–52s total for seven scenes  
- Narration controls timing  
- Narration / on-screen text / visual do different jobs  
- Detailed production prompts only after story approval  
- Continuity across the sequence  
- Health language careful (aligns with Atom restrictions)

**Runtime vs UI:** story-first + approval = UI architecture + storyboard prompt. Timing budgets + layering rules = Shorts doctrine. Image-vs-video asset picking = Expansion / later P2.

---

## 14. Grammar of Film Language relevance extraction

Arijon PDF present; TOC extracted via bookmarks (**Verified**). Book assumes horizontal cinema, live actors, multi-camera dialogue coverage — not 9:16 or AI plates.

Relevant enduring principles: film as visual communication; action/reaction; peak moments; shot distance vocabulary; centre of interest; line of interest / screen-side continuity; match position/movement/look; cutting on action; movement into/out of frame; motivated camera movement; naturalistic flow; technique serves the scene.

Not relevant as Shorts defaults: parallel editing; full re-establish coverage; pan/track/zoom as law; 1970s optical punctuation as required grammar.

---

## 15. Arijon → modern AI-video translation matrix

| Source principle | Classification | Modern Shorts translation |
|------------------|----------------|---------------------------|
| Technique serves the scene | ESSENTIAL | Choose camera/framing/movement only when it clarifies the beat |
| Peak moments only | ESSENTIAL | Each ~7s clip does one narrative job |
| Centre of interest | ESSENTIAL | One dominant subject per plate |
| Match position / movement / look | ESSENTIAL | Continuity QA across adjacent clips |
| Cutting on action | ESSENTIAL | Align transitions to motion peaks when i2v used |
| Line of interest / 180° | NEEDS MODERN ADAPTATION | Screen-side character map, not triangle coverage recipes |
| Shot distance | NEEDS MODERN ADAPTATION | Prompt vocabulary (CU/MS/FS), not lens mm |
| Motivated camera movement | ESSENTIAL | Cut unmotivated “cinematic” motion from prompts |
| Optical fades/wipes | NEEDS MODERN ADAPTATION | Prefer hard cut / jump / sudden CU intent |
| Parallel editing | NOT RELEVANT (default) | Only if Short explicitly runs A/B beats |
| 9:16 / safe text zone | NOT ARIJON | Modern channel convention — label as such |

---

## 16. Reference → runtime doctrine matrix

| Source | Principle | Shorts relevance | Storyboard or Expansion? | Runtime doctrine? | Exact location | Modern translation |
|--------|-----------|------------------|--------------------------|-------------------|----------------|--------------------|
| marketing-hook | Context before cleverness | High | Storyboard | Yes (distilled) | `marketing-hook.txt` | First beat states situational context before clever phrasing |
| marketing-hook | Open loops | High | Storyboard | Yes | same | Delay closure; chain curiosity without opaque clickbait |
| storytelling-part-2 | Dance but/therefore | High | Storyboard | Yes | `storytelling-part-2.txt` | Connect beats with conflict/consequence, not “and then” lists |
| storytelling-part-2 | One-to-one tone | High | Storyboard | Yes | same | Conversational narration to one shopper |
| storytelling-part-1 | Anticipation / climax | Medium | Storyboard | Partial | `storytelling-part-1.txt` | Compress anticipation→payoff into seven beats |
| short-video-workflow | Story before prompts | High | UI + Storyboard | Yes | `short-video-workflow.txt` | Approve storyboard before expansion |
| short-video-workflow | Distinct jobs for N/T/V | High | Both | Yes | same | Narration explains; text highlights; visual shows |
| TE doctrine | LoD latent lens | High | Storyboard | Yes (Shorts-owned rewrite) | `topic-strategy-doctrine.ts` | Default spine; collapse unsupported roles |
| Arijon | Peak moments | High | Expansion | Yes | PDF Ch.2 / Ch.28 | One clear job per clip |
| Arijon | Continuity matching | High | Expansion | Yes | PDF Ch.3 | Match position/movement/look |
| Hooked | Variable Reward | Low | — | No | hooked extract | PRODUCT/HABIT only — reject for Shorts |
| MarketMonth | produceContentBundle | Anti-pattern | — | No | archive | Do not copy shared multi-format brain |

---

## 17. What belongs in Storyboard

- Shorts creator role + Atom closed-world rules  
- Distilled marketing / storytelling / LoD-as-lens / Shorts timing constraints  
- Output: ~7 editable scenes (role, purpose, narration, description, duration, on-screen text)  
- Owner-visible whole-story duration  

Not: camera grammar, motion vectors, full visual prompts, lens/lighting databases.

---

## 18. What belongs in Expansion

- Production director role; approved storyboard is immutable creative plan  
- Distilled film grammar / continuity / modern 9:16 conventions  
- Project-level visual continuity + per-scene deltas  
- visualPrompt, motionPrompt (timed beats), voiceDirection, assetType, negatives  

Must not rewrite approved narration/order/thesis silently.

---

## 19. What must remain outside both prompts

- Raw research / Librarian internals / rejected items  
- Topic Engine hidden reasoning / unselected topics  
- Marketing folders / Arijon PDF / RAG dumps  
- Hooked habit-loop compulsion mechanics  
- Algorithm scrollback hacks  
- Other channels’ outputs / storyboards  
- Identity IDs as claim sources; `sourceRefs` / `provenanceNotes` as claim authorization  
- `doNotClaim` duplicate list (send `restrictions` only)  

---

## 20. Atom → Shorts input contract

### Field classification (Verified from `topic-packet.ts`)

| Field | Class |
|-------|--------|
| title, premise, audience, customerMoment, tension, opportunity, decisionQuestion, desiredTakeaway | REQUIRED BY CHANNEL |
| whyItMatters | USEFUL |
| supportingInsights, evidenceQuotes | REQUIRED BY CHANNEL (claim surface) |
| restrictions, limitations, hypothesisDependencies, unresolvedAssumptions | SAFETY-CRITICAL |
| confidence | USEFUL (tone; not permission to strengthen) |
| sourceRefs, provenanceNotes, supportingItemIds | PROVENANCE ONLY — hide from model |
| doNotClaim | HIDE FROM MODEL (mirror of restrictions) |
| topicPacketId, projectId, artifactId, libraryId, territoryId, topicId, version, status, createdAt | HIDE FROM MODEL / UI+trace |

### Smallest `YouTubeShortsInput`

```text
title, premise, audience, customerMoment, decisionQuestion,
tension, opportunity, whyItMatters, desiredTakeaway,
supportingInsights, evidenceQuotes,
restrictions, limitations, hypothesisDependencies, unresolvedAssumptions,
confidence
```

Project from **Shorts-owned** `ingestedAtom`, not live TE storage. Trace `topicPacketId` outside the model call.

Smoke `atomPayload()` currently includes sourceRefs/provenanceNotes — **stricter exclusion** recommended (**Verified**).

---

## 21. Seven-scene structure verdict

Treat **7 × ~7s** as the owner’s current target architecture. Nothing in the repo materially conflicts.

Line of Discovery seven roles = **default spine + quality lens**, not hard enums. Roles may collapse/reinterpret. Channel may discover expression; must not invent false conflict/mistake/framework.

---

## 22. Current Atom seven-scene stress test

Fixture: framework Atom in `scripts/_live-atom-118-dual.json` — *Why price per serving can still compare the wrong things*. Conceptual only; no final narration.

| Role | Classification | Atom-supported reading |
|------|----------------|------------------------|
| Emotional Hook | NATURAL | Shopper treating cheaper PPS as proof |
| Curiosity | NATURAL | Can similar serving counts still be unfair? |
| Discovery | NATURAL | Elemental Mg / elemental Fe vs compound weight |
| Mistake | POSSIBLE | Shopper’s shortcut — FORCED if inventing a product “mistake” |
| Reframe | NATURAL | PPS secondary until elemental amount matches |
| Framework | POSSIBLE | “Check declared amount then price” — FORCED if inventing branded multi-step method |
| Payoff | NATURAL | Match serving + declared amount before cheaper-wins |

---

## 23. One-call vs two-call architecture verdict

| Option | Verdict |
|--------|---------|
| A — one giant production call | Reject — weak story discovered after cost |
| B — storyboard → approve → expand | **Select** — matches workflow doctrine + TE human-gate pattern |
| C — per-scene agents | Reject for P1 — MarketMonth showed refresh loss / duplicate charges / no correlation IDs |

---

## 24. Minimal storyboard schema

```text
{
  estimatedTotalSeconds: number,
  scenes: [{
    sceneNumber, storyRole, purpose,
    narration, sceneDescription,
    durationSeconds, onScreenText
  }]
}
```

`storyRole` is a **string**, not a seven-value enum. Skip lens/lighting/motion vectors pre-approval.

---

## 25. Minimal production scene schema

| Field | Class |
|-------|--------|
| sceneNumber, storyRole, durationSeconds, purpose | REQUIRED (from approved story) |
| narration, onScreenText | REQUIRED (immutable from approval unless safety surface) |
| visualPrompt, voiceDirection, assetType, motionPrompt, negativeConstraints | REQUIRED |
| projectVisualContinuity (root) + continuityDelta | REQUIRED |
| timedBeats inside motionPrompt | REQUIRED for ~7s control |
| shotSize, cameraMovement, characterAction, safeZone, productionNotes | OPTIONAL |
| characterName/wardrobe as film-school DB | UNNECESSARY if continuity contract covers identity |
| transitionIn/Out ontology | OPTIONAL / DERIVABLE |

---

## 26. Character/visual continuity contract

Prefer **one project-level visual continuity object** in expansion output + small per-scene deltas. Storyboard may name a recurring character lightly; Expansion creates the continuity bible once. Do not repeat uncontrolled prose seven times.

---

## 27. Timing/narration contract

- Target 6–8s/scene, ~45–55s total  
- Duration generated but constrained; owner reviews total before expansion  
- ~15–22 spoken words/scene at conversational pace (**Assumed** heuristic)  
- Silence / reaction allowed  
- Narration / on-screen text / visual must not redundantly say the same thing  

---

## 28. Safety/claim contract

Atom is authoritative strategic context. Do not invent research; do not turn source refs into unsupplied claims; do not silently resolve assumptions; do not strengthen hypothesis language; do not convert limitations into facts; do not claim causal/medical outcomes unsupported by Atom. If a desired scene needs unsupported info, rewrite creative treatment — do not fabricate evidence. Wellness: emotional visuals allowed; narration/OST remain governed by Atom restrictions.

---

## 29. Persistence/resume contract

| Concern | Rule |
|---------|------|
| Storage key | `social-media-youtube-shorts:v1` (`YOUTUBE_SHORTS_STORAGE_KEY`) |
| Atom ownership | Immutable `ingestedAtom: TopicPacket` copied once on CTA |
| After ingest | No live TE re-read for that portfolio |
| Stages | draft → edited → approved → expanded |
| Owner edits | Persist separately from generated snapshot |
| Regen | Explicit only — never on mount / refresh / prompt-version bump |
| Expansion gate | Blocked until storyboard approval |
| TE clear after ingest | Must not wipe Shorts portfolio |

Filesystem/cloud portfolio: out of P1 unless owner authorizes later.

---

## 30. Cost/failure analysis

| Call | When | Risk | Guard |
|------|------|------|-------|
| Storyboard | Explicit generate / regenerate | Auto-fire on mount | Resume gate + ref like TE |
| Expansion | Explicit after approval | Fire before approval | UI + server gate |
| Repair | Validation failures | Extra tokens | ≤1 attempt |
| Per-scene LLM | Temptation | 7× cost / drift | Forbidden in P1 |
| Prompt-version bump | Revisit route | Silent regen | Banner + explicit regenerate |
| Double-click generate | Duplicate charge | Disable while in-flight; idempotent client gate |

---

## 31. Model-routing recommendation

- Env: `YOUTUBE_SHORTS_MODEL` (default owner-chosen; plan placeholder `gpt-5.6-terra`)  
- Accessor: `getYouTubeShortsModel()`  
- Ops: `generate-shorts-storyboard`, `expand-shorts-scenes`  
- `promptModule`: `shorts-generate-storyboard` \| `shorts-expand-scenes`  
- Prompt version: `ci-shorts-0.1.0` (both ops; bump together or document split later)  
- Reasoning: start on global `OPENAI_REASONING_EFFORT` unless owner splits later  
- Do not add `YOUTUBE_SHORTS_STORYBOARD_MODEL` / `_EXPANSION_MODEL` until proven  

---

## 32. UI/state-flow recommendation

```text
Ready (08) → CTA Create for YouTube Shorts
  → one-shot ingest TopicPacket into Shorts session
  → /social-media/youtube-shorts
  → (optional hub /social-media with link-only cards)
  → Generate storyboard → edit → Approve
  → Expand production scenes → copy/download
```

Atom page: keep Research open (`researchSettled=false`). Shorts shells: `researchSettled=true`. Hub must not import Shorts shell/session.

---

## 33. Exact minimal files that would need to be created/changed

### CREATE (P1 — after separate owner approval; not this audit task)

```text
src/features/social-media/
  components/
    social-media-rail.tsx
    channel-hub.tsx
  youtube-shorts/
    components/
      youtube-shorts-shell.tsx
      storyboard-review.tsx
      production-scenes-view.tsx
    config/constants.ts
    contracts/
      youtube-shorts-input.ts
      ingest-topic-packet.ts
    prompts/
      prompt-version.ts
      storyboard-doctrine.ts
      expansion-doctrine.ts
      generate-storyboard.ts
      expand-scenes.ts
      shared-guardrails.ts
      repair-output.ts
    schemas/
      youtube-shorts-storyboard.ts
      youtube-shorts-production.ts
      shorts-session.ts
    services/
      generate-storyboard.ts
      expand-scenes.ts
      format-shorts-export.ts
    state/
      shorts-storage.ts
      resume-shorts-session.ts

src/app/social-media/page.tsx
src/app/social-media/youtube-shorts/page.tsx
src/app/api/social-media/youtube-shorts/storyboard/route.ts
src/app/api/social-media/youtube-shorts/expand/route.ts

tests/youtube-shorts/...
tests/evals/youtube-shorts-*-contract.test.ts
tests/ai/youtube-shorts-model-routing.test.ts
tests/api/youtube-shorts-*.route.test.ts
```

### TOUCH (surgical)

`topic-ready-view.tsx` (CTA L88), `topic-engine-shell.tsx` (handler), `env.ts`, `.env.example`, `openai.ts`, `registry.ts`, `schema-names.ts`, `operations/types.ts`, `contracts/types.ts` + `registry.ts`, `src/ai/README.md`, then `npm run knowledge:update`. Canon FEATURE/PRODUCT/CURRENT_STATE amend in P1 PR.

### NEVER CREATE

Shared Social Media brain paths (`social-media/prompts|schemas|services|state`), `SOCIAL_MEDIA_MODEL`, `ci-social-media-*`, `social-media-generation:v1`, `SocialMediaStoryboard`, master content plan, MarketMonth Content Brain, TE doctrine imports, step 09, lifted `social-media/contracts/ingest-*`, second Atom type.

---

## 34. What must NOT change

Librarian freeze (`ci-librarian-1.1.1`), `PublishedLibraryDto`, Topic Engine prompts/model (`ci-topics-1.1.9`), `buildTopicPacket`, `TopicPacket` field set (no platform fields), RPB prompt-contract bans, no Marketing-folder RAG, no Atom synthesis LLM, `parse-structured-output.ts` implementation, JourneyRail counter semantics (` / 08`), MarketMonth archive as product truth.

Ready may gain a CTA without changing packet semantics.

---

## 35. P1 / P2 / P3 implementation plan

| Phase | Scope |
|-------|--------|
| **P1** | Hub + Shorts route + Atom ingest snapshot + storyboard LLM + editable review + approval + expansion LLM + copy/download. No media APIs. |
| **P2** | Asset generation (image/i2v/TTS) only if justified — providers do not exist in this repo today |
| **P3** | Assembly / export timeline only if justified |

---

## 36. Acceptance tests (P1 target)

- Ingest copies full `TopicPacket` once; subsequent mounts do not re-read TE for that portfolio  
- Resume survives refresh and TE session clear after ingest  
- Storyboard does not auto-run on mount when resumable  
- Expansion refused before approval  
- Approved narration/order not silently rewritten  
- Closed-world: no claims beyond insights/quotes; restrictions honored  
- Ops registry + schema names + README + model routing tests pass  
- Import boundary: Shorts does not import TE `topic-strategy-doctrine` / TE `shared-guardrails`  

---

## 37. Cold Atom-only creator test

Using only the framework Atom fixture (no Librarian, no TE reasoning):

1. Project to `YouTubeShortsInput` (strict exclusion list).  
2. Produce a seven-scene conceptual spine with LoD roles classified NATURAL/POSSIBLE/FORCED.  
3. Assert no invented elemental/medical claims beyond supportingInsights/evidenceQuotes.  
4. Assert restrictions (non-medical, disclosure, etc.) appear as generation constraints.  
5. Mark robustness: YES / YES WITH GAPS / NO for Shorts using Atom alone.

Prior smoke `coldChannel` is long-form outline — replace with Shorts-specific eval when P1 lands; do not promote the smoke script into `src/`.

---

## 38. Final readiness score

| Area | CURRENT | TARGET | GAP | SMALLEST FIX |
|------|---------|--------|-----|--------------|
| Atom handoff | 9 | 10 | No Shorts ingest | CTA + `ingestedAtom` snapshot |
| Navigation | 4 | 9 | No hub/CTA | Hub + researchSettled on Shorts |
| Social Media shell | 2 | 8 | Placeholder only | Nav-only components |
| YouTube Shorts route | 0 | 9 | Missing | page + shell |
| Channel persistence | 0 | 9 | Missing | `social-media-youtube-shorts:v1` |
| Model routing | 8 | 9 | No Shorts env | `YOUTUBE_SHORTS_MODEL` |
| Reference doctrine | 3 | 8 | Not distilled | Shorts doctrine TS modules |
| Storyboard prompt | 0 | 9 | Missing | `generate-storyboard.ts` |
| Storyboard schema | 0 | 9 | Missing | `youtube-shorts-storyboard.ts` |
| Owner review UI | 0 | 9 | Missing | `storyboard-review.tsx` |
| Expansion prompt | 0 | 9 | Missing | `expand-scenes.ts` |
| Production schema | 0 | 9 | Missing | `youtube-shorts-production.ts` |
| Film grammar doctrine | 1 | 8 | PDF only | `expansion-doctrine.ts` |
| Continuity | 0 | 8 | Missing | projectVisualContinuity |
| Safety | 7 | 9 | Needs Shorts guardrails | Shorts `shared-guardrails.ts` |
| Tests | 2 | 9 | Smoke only | Shorts test suites |
| Cost protection | 6 | 9 | Patterns exist; unused | Resume + explicit generate |
| Media integrations | 0 | 0 (P1) | N/A | Stay out of P1 |

---

## 39. Smallest architecture recommendation

```text
ONE Canonical TopicPacket
  → one-shot ingest into Shorts portfolio (ingestedAtom)
  → ONE Shorts storyboard operation
  → OWNER APPROVAL (edits respected)
  → ONE Shorts expansion operation
  → deterministic UI / export

No shared Social Media creative brain.
No master storyboard.
No per-scene agents.
No RAG.
No media pipeline in P1.
```

---

## 40. OWNER DECISION GATE

1. **Ready for Social Media downstream of Atom?** Yes — as a new domain after Ready; not as finished Shorts product.  
2. **Reusable infrastructure?** TopicPacket, gateway, env/model pattern, registry, TE resume pattern, journey Social placeholder, doctrine-in-TS pattern.  
3. **New architecture or mostly downstream feature?** Mostly a new downstream vertical slice using existing patterns — not a Topic Engine reopen.  
4. **Two-operation Storyboard → Expansion smallest correct?** Yes.  
5. **Line of Discovery?** Default spine + quality lens — not fixed enums, not global Social schema.  
6. **Which Arijon principles in runtime doctrine?** Peak moments, continuity matching, centre of interest, cutting on action, motivated movement, technique serves scene, naturalistic flow.  
7. **Modernize how?** Screen-side maps, prompt shot vocabulary, hard-cut punctuation, 9:16/safe-zone as modern (not Arijon-labeled).  
8. **Storyboard compact doctrine?** Marketing/story/LoD-lens/Shorts timing/closed-world/safety.  
9. **Expansion compact doctrine?** Film grammar continuity + modern vertical production conventions + immutable approved story.  
10. **Exact Atom projection?** 17-field `YouTubeShortsInput` above; hide provenance/IDs/`doNotClaim`.  
11. **Smallest safe persistence?** `social-media-youtube-shorts:v1` with immutable `ingestedAtom` + staged creative state; no auto-regen.  
12. **Exact P1 to working Shorts preview?** CTA → ingest → Shorts page → storyboard generate/edit/approve → expansion → copy/download. No media APIs.

---

# CHANNEL ISOLATION CONTRACT

1. **Canonical Atom is the final shared strategic artifact.** After Atom, creative reasoning does not shared-merge across channels.  
2. **Social Media itself has no creative brain.** `src/features/social-media/` is navigation / organization only (hub, rail, cards, presentational layout).  
3. **Every channel begins independently from Atom.** No Atom → generic Social Media Content Plan → channels. No master storyboard. No shared script adapted per platform.  
4. **Every channel owns its complete creative/runtime brain** — model config, prompt versions, doctrine, prompts, guardrails, input projection, schemas, repair, services, API routes, session, persistence, resume, export, evals, tests, UI flow — under its own folder (e.g. `youtube-shorts/`).  
5. **No channel consumes another channel’s output.** Shorts must never import Long-form internals (and vice versa).  
6. **No shared storyboard / script / content-plan layer exists** (`SocialMediaStoryboard`, `SocialMediaContentPlan`, etc. forbidden).  
7. **Shared infrastructure is permitted only when semantically neutral** — `TopicPacket` type, `parseStructuredOutput`, `toCiApiError`, JourneyRail, buttons/layout, env plumbing.  
8. **Reference DNA is distilled independently for each channel.** Overlapping sources may inform different runtime doctrines. No giant `SOCIAL MEDIA DOCTRINE`.  
9. **Channel model routing, persistence, prompt versions, schemas, and evaluations remain channel-private** (`YOUTUBE_SHORTS_MODEL`, `ci-shorts-*`, `social-media-youtube-shorts:v1` — never `SOCIAL_MEDIA_MODEL` / `ci-social-media-*` / `social-media-generation:v1`).  
10. **The same Atom is expected to produce materially different content** across Shorts, Long-form, LinkedIn, etc., while preserving governed strategic truth.

### Isolation architecture diagram

```text
                         CANONICAL ATOM
                              │
          ┌───────────────────┼────────────────────┐
          │                   │                    │
          ▼                   ▼                    ▼
   YOUTUBE SHORTS       YOUTUBE LONG-FORM       LINKEDIN
       BRAIN                 BRAIN                BRAIN
          │                   │                    │
  Shorts storyboard      Long-form outline    Native written plan
          │                   │                    │
  Shorts production     Long-form production   Native post
          │                   │                    │
          ▼                   ▼                    ▼
      Shorts output        Long output        LinkedIn output
```

**There must be NO shared creative node below Atom.**

### Shorts product flow (with Atom firewall + human gate)

```text
Canonical Atom (TE Ready)
      │
      ▼  [AI boundary: none — deterministic copy]
Social Media (nav only)
      │
      ▼
YouTube Shorts  ── ingest ──► ingestedAtom (Shorts-owned snapshot)
      │                         [persistent state]
      ▼  [AI: Storyboard LLM + Shorts doctrine]
7-scene editable preview
      │
      ▼  [HUMAN APPROVAL BOUNDARY]
Approved storyboard (persistent; edits respected)
      │
      ▼  [AI: Expansion LLM + film grammar doctrine]
7 production-grade prompts (persistent)
      │
      ▼
Copy / Download / future generation pipeline
```

### Isolation red-team answers

1. **Hidden Social Media brain?** No — if the locked map is followed. Parent folder is rail + hub only. Soft risk of generic `promptModule` names is closed by `shorts-*` prefixes.  
2. **Creative DTO generalized too early?** No — `YouTubeShortsStoryboard` / `YouTubeShortsProductionScenes` only.  
3. **Doctrine above channel boundary?** No — both doctrine files under `youtube-shorts/prompts/`.  
4. **Shared persistence?** No — Shorts key only; TE read is one-shot seed into `ingestedAtom`.  
5. **Can Long-form ignore every Shorts creative decision?** Yes — own tree/model/version/schemas/session; must not import Shorts internals; copy ingest pattern later, do not lift shared ingest in P1.  
6. **Same Atom, different architectures?** Yes — PASS condition. Shared content plan would FAIL.  
7. **Sharing only truth + neutral infra?** Yes.  
8. **File-map changes before P1?** `promptModule` → `shorts-*`; constant `YOUTUBE_SHORTS_STORAGE_KEY`; schema filenames `youtube-shorts-*.ts`; **do not** lift loader/guardrails to `social-media/`; **do** snapshot Atom into Shorts portfolio on handoff.

**Independence test:** PASS with naming locks, no-lift rule, and Shorts-owned `ingestedAtom`.

---

## Stop condition

This audit is complete. **Do not implement** Social Media routes, schemas, production prompts, model env vars, or doctrine modules until a separate owner-approved P1 task.

**Must not touch:** Librarian, PublishedLibraryDto, Topic Engine, `ci-topics-1.1.9`, Atom builder, Ready freeze internals (except future CTA wiring in P1), Research Prompt Builder.
