<!-- HISTORICAL / PRIOR-PROJECT — not product source of truth. Keep field-separation lessons. Do not inherit Fill Scene, src/brain/, Veo, or D:\MarketMonthMedia. -->

# YouTube Short scene prompt requirements

Operator guide for what you must supply in Content Studio **Manual Short** mode to produce a scene through still → voice → (optional motion) → compose → final short.

**Multi-scene prompt-writing systems:** use [`youtube-short-prompt-system-brief.md`](./youtube-short-prompt-system-brief.md) — emit **N separate** MarketMonth pastes (5–7 scenes, ~7s video). Fill Scene remains **one scene at a time**; do not paste a mega-doc into one Fill.

**Source of truth in code (do not invent different numbers elsewhere):**

- Field ceilings: `src/brain/channels/youtube-short/scene-field-limits.ts`
- Paste / labeled validation: `src/brain/channels/youtube-short/parse-labeled-scene-prompt.ts`
- Scene readiness + narration pacing hint: `src/brain/content-studio/compute-scene-readiness.ts`
- Short total duration policy: `src/brain/channels/youtube-short/duration-policy.ts`
- Motion clip lengths (Veo): `src/brain/render/generate-video.ts` (`VEO_SUPPORTED_DURATION_SECONDS`)

---

## What you are creating

Each **scene** needs a structured package of text. You can enter it:

1. **Field by field** in the Studio scene editor, or  
2. As one **Paste Prompt** with labeled section headers (then review/apply).

The system does **not** invent a full scene brief for you in Manual mode. You provide the creative inputs; MarketMonth generates/stores the media.

Typical per-scene generation order:

1. Save prompts  
2. Generate **still image**  
3. Generate **voice** (from narration)  
4. If Asset Type = `video`: generate **motion clip** (Veo)  
5. **Compose** scene MP4 (still or motion + voice + optional on-screen text)  
6. When all scenes are ready: **Assemble Final Short**

---

## Required vs optional (per scene)

| Input | Required? | Notes |
|-------|-----------|--------|
| **Visual Prompt** | Yes | Still plate / framing / look for image generation |
| **Narration** | Yes | Spoken voiceover script for TTS |
| **Asset Type** | Yes | `image` or `video` only |
| **Motion Prompt** | Yes **only if** Asset Type = `video` | Shot action for Veo; not needed for still-only scenes |
| **On-Screen Text** | Optional | Burned-in titles/captions; empty = none |
| **Voice Direction** | Optional | Delivery notes for TTS (tone, pace). **Not spoken** |
| **Character Name / Identity / Continuity** | Optional | Short-level Character Profile (WHO layer), not a per-scene field |
| **Global Visual Style** | Optional | Package-level look continuity across scenes |

**Readiness rule:** a scene’s prompts are “complete” when visual + narration are non-empty, and motion is present when asset type is video. On-screen text may be empty.

---

## Character limits (hard ceilings)

These are enforced on paste ingest and durable save.

| Field | Max characters | Code constant |
|-------|----------------|---------------|
| Visual Prompt | **20,000** | `SCENE_VISUAL_PROMPT_MAX_CHARS` |
| Motion Prompt | **20,000** | `SCENE_MOTION_PROMPT_MAX_CHARS` |
| Narration (spoken) | **1,200** | `SCENE_NARRATION_MAX_CHARS` |
| Voice Direction | **800** | `SCENE_VOICE_DIRECTION_MAX_CHARS` |
| On-Screen Text | **250** | `SCENE_ON_SCREEN_TEXT_MAX_CHARS` |
| Whole Paste Prompt package | **64,000** | `SCENE_PASTE_PROMPT_MAX_CHARS` |
| Character Name | **80** | `PRIMARY_CHARACTER_NAME_MAX_CHARS` |
| Character Identity | **4,000** | `PRIMARY_CHARACTER_IDENTITY_MAX_CHARS` |
| Character Continuity | **4,000** | `PRIMARY_CHARACTER_CONTINUITY_MAX_CHARS` |

**Practical note:** hard max for narration is 1,200 characters, but for **video** scenes you should aim much shorter so voice fits one motion clip (see below).

---

## Voiceover / narration

### What to write

- **Narration** = the exact words to speak. This becomes TTS `scriptUsed`.
- **Voice Direction** = performance notes only (e.g. “calm, slightly urgent, no smile”). Never put stage directions inside Narration if you do not want them spoken.

### Hard limit

- Narration ≤ **1,200** characters.

### Soft budget for video scenes (strongly recommended)

For `assetType = video`, motion clips are only **4 / 6 / 8 seconds** (Veo). Studio shows an advisory hint when narration is likely longer than one 8s clip:

- Aim about **~18–21 words** (~**7–8 seconds**) of speech for a single motion clip.
- Advisory thresholds: **> 125 characters** or **> 21 words**.
- If voice is longer than the motion clip, compose **holds the last frame** for the remaining narration time. That is allowed, but pacing feels better when narration fits the clip.

For **image** (still-only) scenes, there is no 8s motion budget; scene length is driven by the generated voice duration (compose pads the still to match).

### Duration authority

- After voice is generated, **`scene.voice.durationSeconds`** is the authority for that scene’s length.
- Planned `durationSeconds` on the scene card is a planning cache only.

---

## How long the shot / video needs to be

### Whole Short (package)

| Policy | Value |
|--------|--------|
| Product default target | **60 seconds** total |
| Absolute MarketMonth max | **180 seconds** total |

Per-scene planned duration cannot exceed the same 180s policy family; totals still must stay ≤ 180s.

### Per-scene motion clip (Veo, when Asset Type = video)

Supported lengths only: **4, 6, or 8 seconds**.

MarketMonth picks the **shortest** supported length that covers the voice duration (or **8s** if voice is longer). Compose then syncs audio + visual (pad/hold as needed).

Aspect / format defaults for motion: **9:16**, **720p** (Veo config).

### Still-only scenes

No Veo length. Visual is one still; timeline length follows voice.

---

## Visuals — what belongs where

### Visual Prompt (still)

Use for:

- Subject, setting, camera framing, lighting, wardrobe, props  
- Brand-safe look, continuity cues that belong in the **plate**

Do **not** put these reserved section headers inside Visual Prompt (save will reject):

- `NARRATION`
- `ON-SCREEN TEXT` / `ON SCREEN TEXT`
- `ASSET TYPE`
- `MOTION PROMPT` / `VIDEO PROMPT` / `MOTION INSTRUCTIONS`

Those belong in their own fields (or labeled paste sections).

### Motion Prompt (video only)

Describe **shot action only** — what moves, camera move, gesture, timing.  
Do not restate the entire still essay; identity locks can be short.

### On-Screen Text

- Max **250** characters.  
- Optional. Keep short for vertical readability (often 1–3 short lines).  
- Empty means no burned-in titles for that scene.

### Character Profile (package-level WHO)

Optional but useful for recurring talent:

| Subfield | Max | Purpose |
|----------|-----|---------|
| Name | 80 | Display / identity label |
| Identity | 4,000 | Who they are / look / wardrobe baseline |
| Continuity | 4,000 | Cross-scene locks (face, hair, outfit consistency) |

Character sections in a paste brief are **Short-level**, not scene fields. Character is never required to validate a scene paste.

---

## Paste Prompt labeled format

Paste a brief with **heading lines**, then bodies. Required for a valid labeled package:

```text
VISUAL PROMPT:
<still plate description>

NARRATION:
<spoken words only>

ASSET TYPE:
image
```

or for motion:

```text
VISUAL PROMPT:
<still plate description>

NARRATION:
<spoken words only>

ON-SCREEN TEXT:
Optional short titles

ASSET TYPE:
video

MOTION PROMPT:
<shot action only>
```

Optional extras:

```text
VOICE DIRECTION:
calm, clear, mid pace

CHARACTER NAME:
Alex

CHARACTER:
Identity description…

CHARACTER CONTINUITY:
Cross-scene locks…
```

**Aliases accepted:** `ON SCREEN TEXT`, `VIDEO PROMPT` / `MOTION INSTRUCTIONS` → motion, `VOICEOVER DIRECTION` → voice direction.

**Rules:**

- `ASSET TYPE` must be exactly `image` or `video` (case-insensitive).  
- Unknown labeled sections are reported and **not** merged into supported fields.  
- Whole paste ≤ 64,000 characters; per-field caps still apply after parse.

---

## Checklist: minimum to generate one complete scene

### Image scene

1. Visual Prompt (non-empty, ≤ 20,000 chars)  
2. Narration (non-empty, ≤ 1,200 chars; voice direction optional)  
3. Asset Type = `image`  
4. On-screen text optional  
5. Generate still → voice → compose  

### Video scene

1. Everything in the image list  
2. Asset Type = `video`  
3. Motion Prompt (non-empty, ≤ 20,000 chars)  
4. Prefer narration within ~18–21 words / ~125 chars for clean 8s sync  
5. Generate still → voice → motion → compose  

### Full Short

- One or more scenes each Ready (prompts + required assets)  
- Total voice-driven duration ≤ **180s** (default aim **60s**)  
- Assemble Final Short → preview / download  

---

## Quick reference card

| Question | Answer |
|----------|--------|
| Must I write a scene prompt? | Yes (Manual mode) — visual + narration at minimum |
| Spoken script limit? | Hard max **1,200** chars |
| Best narration length for video? | ~**18–21 words** / ~**7–8s** |
| Visual prompt limit? | **20,000** chars |
| Motion prompt limit? | **20,000** chars (video only) |
| On-screen text limit? | **250** chars (optional) |
| Motion clip lengths? | **4 / 6 / 8** seconds only |
| Whole Short length? | Default **60s**, max **180s** |
| Character profile required? | No (optional Short-level WHO) |

---

## Related

- Local media storage (where generated files land): `D:\MarketMonthMedia`, served at `http://localhost:3500/api/media/...`  
- Operator live-gate helper: `npx tsx scripts/operator-first-short-eval.ts`  
- Field-limit tests: `src/brain/channels/youtube-short/phase3f-scene-field-limits.test.ts`
