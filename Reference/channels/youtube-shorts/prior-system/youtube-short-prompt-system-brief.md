<!-- HISTORICAL / PRIOR-PROJECT — not product source of truth. Keep one-beat-per-package / image-first lessons. Do not inherit Fill Scene, src/brain/, Veo, or D:\MarketMonthMedia. Atom closed-world overrides “do not invent a fixed topic.” -->

# YouTube Short — prompt-system brief (multi-scene)

**Audience:** Any external prompt-writing system (or writer) that must produce MarketMonth-ready paste packages for Manual Short Studio.

**Operator field ceilings and aliases:** see [`youtube-short-scene-prompt-requirements.md`](./youtube-short-scene-prompt-requirements.md) (do not invent different numbers).

**Code SoT:**

- Paste parser: `src/brain/channels/youtube-short/parse-labeled-scene-prompt.ts`
- Field ceilings: `src/brain/channels/youtube-short/scene-field-limits.ts`
- Soft narration pacing (video): `src/brain/content-studio/compute-scene-readiness.ts`
- Motion clip lengths (Veo today): `src/brain/render/generate-video.ts` (`VEO_SUPPORTED_DURATION_SECONDS` = 4 / 6 / 8)

---

## Goal

From **one creative brief**, emit a MarketMonth package for **5–7 scenes** (default **5** unless the user asks otherwise):

1. Shared character / continuity (optional but recommended)
2. **N separate labeled pastes** — one per Studio scene slot
3. Each scene targets **~7 seconds** of spoken VO (fits one **8s** motion clip)
4. Pipeline: **stills first → voice → motion → compose → assemble**

Do **not** invent a fixed product topic. Use `[...]` placeholders or the user’s topic when provided.

---

## Critical MarketMonth constraint

Studio **Paste Prompt / Fill Scene is single-scene only**.

- One paste fills the **currently selected** scene (`atomId` + `sceneId`).
- `SCENE N` is a **document label only** — it does **not** split a mega-doc into multiple scenes.
- If you emit one giant paste with `SCENE 1`…`SCENE 7` and the operator pastes it into Fill Scene, **repeated sections merge into that one scene**.

**Required output shape:** emit **N separate pastes** (or N clearly delimited blocks the operator copies one at a time into Scene 1…N).

---

## Package rules

| Rule | Value |
|------|--------|
| Scene count | **5–7** for this brief (MarketMonth allows 2–12) |
| Asset type (default) | `video` for every scene unless asked for still-only |
| Aspect | Vertical **9:16** |
| Motion clip lengths | **4 / 6 / 8** seconds only (system picks shortest that covers voice; prefer VO that fits **8s**) |
| Narration soft budget (video) | Aim **~18–21 words** (~7–8s). Soft advisory if **> 125 chars** or **> 21 words** |
| Narration hard max | **1,200** characters |
| Whole paste max (per Fill) | **64,000** characters |
| Generation order | Save → **Image** → **Voice** → **Video** → **Compose**; when all Ready → **Assemble Final Short** |

---

## What each field needs (structure)

| Field | Required? | Needs | Must not contain |
|-------|-----------|--------|------------------|
| **CHARACTER NAME** | Optional (Short-level) | Short talent label | Scene action / narration |
| **CHARACTER IDENTITY** | Optional (Short-level) | Look, age range, hair, wardrobe baseline | Shot motion / spoken words |
| **CHARACTER CONTINUITY** | Optional (Short-level) | Cross-scene locks (face, hair, outfit, setting) | Full still essay |
| **VISUAL PROMPT** | **Yes** | Still plate: subject, setting, framing, lighting, props, composition, avoid list | Reserved headers (`NARRATION`, `ON-SCREEN TEXT`, `ASSET TYPE`, `MOTION PROMPT`…); spoken script; full motion essay |
| **NARRATION** | **Yes** | Exact spoken words for **this** scene only | Stage directions / tone notes |
| **VOICE DIRECTION** | Optional | TTS pace, tone, emphasis — **not spoken** | Words meant to be spoken |
| **ON-SCREEN TEXT** | Optional | Burned-in title lines (≤ **250** chars) | Layout/design notes (system-owned) |
| **ASSET TYPE** | **Yes** | Exactly `image` or `video` | Any other value |
| **MOTION PROMPT** | **Yes if video** | Shot action only (~7–8s): gesture, camera, timing; short identity locks OK | Full still-plate rewrite; spoken script |

**Header aliases** (case-insensitive; trailing `:` optional):

- Character identity: `CHARACTER` / `CHARACTER PROMPT` / `CHARACTER IDENTITY`
- Continuity: `CHARACTER CONTINUITY` / `CHARACTER CONTINUITY PROMPT`
- Motion: `MOTION PROMPT` / `VIDEO PROMPT` / `MOTION INSTRUCTIONS`
- Voice: `VOICE DIRECTION` / `VOICEOVER DIRECTION` / `PERFORMANCE DIRECTION`
- OST: `ON-SCREEN TEXT` / `ON SCREEN TEXT`

`OVERLAY DESIGN NOTES` is ignored (not merged).

**Image-first rule:** VISUAL must stand alone as a still plate. MOTION is action-only. Do not put the full plate in MOTION.

---

## Required output format

### 1) Package header (once)

```text
# SHORT PACKAGE
SCENE_COUNT: 5
# Allowed: 5, 6, or 7

CHARACTER NAME
[short talent label]

CHARACTER IDENTITY
[look / wardrobe baseline]

CHARACTER CONTINUITY
[cross-scene locks]

# Optional note for operator (not a paste field):
# GLOBAL VISUAL STYLE — set in Studio Global Visual Style field if needed (not part of Fill Scene paste)
```

### 2) Per-scene paste blocks (repeat N times)

Emit **clear delimiters** so each block can be copied into the matching Studio scene.

```text
===== SCENE 1 PASTE (copy into Studio scene 1) =====
SCENE 1

CHARACTER NAME
[same as package if linking this scene to the character]

CHARACTER IDENTITY
[...]

CHARACTER CONTINUITY
[...]

VISUAL PROMPT
[still plate for this beat only — vertical 9:16]
[no readable text/logos in the image unless intentional]

NARRATION
[exact spoken words — aim ~18–21 words for ~7–8s]

VOICE DIRECTION
[optional — pace/tone only]

ON-SCREEN TEXT
[optional — short title lines ≤250 chars]

ASSET TYPE
video

MOTION PROMPT
[shot action only for ~7–8s]
[preserve identity/framing; no new people/text/logos]
===== END SCENE 1 =====
```

Repeat for **SCENE 2 … SCENE N** with **different** visual, narration, motion, and OST per beat. Reuse the same CHARACTER* text when linking the same talent.

### Image-only scene variant

If a beat must be still-only:

```text
ASSET TYPE
image
```

Omit `MOTION PROMPT` (or leave empty). Keep VISUAL + NARRATION required.

---

## Operator handoff (after you emit the package)

1. Ensure atom is **locked** and Manual Short has **N scenes** (add empty scenes in Studio if needed; package min is 2, max 12).
2. For each scene `1…N`: select scene → Paste Prompt → paste **that scene’s block only** → **Fill Scene** → review → **Save Scene**.
3. **Generate Image** for every scene (stills first).
4. **Generate Voice** for every scene.
5. **Generate Video** for every `video` scene.
6. **Compose** / Complete Scene for every scene.
7. When all scenes Ready → **Assemble Final Short**.

Nothing generates until Save + asset steps.

---

## Failure list (do not emit)

- Missing `VISUAL PROMPT`, `NARRATION`, or `ASSET TYPE`
- `ASSET TYPE` not exactly `image` or `video`
- `video` without non-empty `MOTION PROMPT`
- Reserved section headers buried inside VISUAL PROMPT
- One mega-paste meant for Fill Scene that contains all scenes without per-scene delimiters for separate pastes
- Narration that is a multi-scene script in one field (each paste = one scene only)
- Over caps: visual/motion 20,000; narration 1,200; voice direction 800; OST 250; character name 80; identity/continuity 4,000 each; single paste 64,000

---

## Checklist for the prompt-writing system

```
[ ] SCENE_COUNT set to 5, 6, or 7
[ ] Optional CHARACTER* defined once and reused when linking
[ ] Exactly N delimited PASTE blocks
[ ] Each block: VISUAL + NARRATION + ASSET TYPE
[ ] Each video block: MOTION non-empty
[ ] Each video narration aimed at ~18–21 words / ~7–8s
[ ] VISUAL = still plate; MOTION = action only
[ ] No topic-locked filler unless the user supplied a topic
[ ] Operator can copy Scene k paste into Studio scene k without editing headers
```

---

## Related

- Operator single-scene guide: [`youtube-short-scene-prompt-requirements.md`](./youtube-short-scene-prompt-requirements.md)
- Local media after generation: `D:\MarketMonthMedia` via `http://localhost:3500/api/media/...`
