# Operator clickthrough — Manual Short Scene 1 (2026-08-02)

Atom: `atom_909d95f74709` · Studio Manual · Short 9:16 · Scene 1 of 5  
Env (presence only): `MM_IMAGE_RENDER=live`, `MM_VOICE_RENDER=live`, `MM_VIDEO_RENDER=live` + `veo`, `MM_SCENE_COMPOSE_RENDER=live` + `ffmpeg`, Gemini + ImageKit + FFmpeg path set.

## Sequence executed

| Step | Result |
|------|--------|
| Open `/content?atomId=atom_909d95f74709` | **Verified** — Manual pressed; Scene 1 selected |
| Readiness before recompose | Composed MP4 **Outdated**; still/voice/motion Ready; Export **Not ready** |
| Preview before recompose | Draft synced motion+VO + DOM OST (expected when composed not current) |
| Click **Regenerate Scene MP4** | **Verified** — UI showed `Composing…` then completed (~15s) |
| Readiness after | Composed MP4 **Ready**; **Scene ready for assembly**; Export **1 of 5 scenes ready** (disabled) |
| Preview after | Label **Final Scene · 8.67s**; no DOM OST overlay over MP4 |
| Composed asset | ImageKit URL; `videoWidth=1080`, `videoHeight=1920`, `duration≈8.67s`, `readyState=4` |
| Visual @ t=0.7s | Burned-in left title: “Why is **magnesium** attracting attention?” (accent on magnesium) |
| Visual @ t=4.5s | Title no longer visible in frame (exit ~4s hold) |
| Scene MP4 download link | Present (`Download scene MP4` / titles+voice) |
| Assemble Final Short | **Blocked** — only 1/5 scenes ready; storyboard scenes 2–5 empty (no thumbnails / no assets) |
| Package download outside Studio | **Not verified** — requires all scenes Ready first |

## Honesty notes

1. **Scene 1 path is live-operator-good** for recompose + burned OST + Final Scene preview.
2. **Full Short assemble remains limited by multi-scene completeness**, not by compose failure — matches the status-eval claim that Generate Complete Scene is per-scene and package export needs all scenes Ready.
3. Package title (“creatine…”) vs Scene 1 OST (“magnesium…”) is content-consistency debt in this atom, not an OST pipeline failure.
4. Screenshots saved under Cursor temp: `ost-scene1-final-after-recompose.png`, `ost-scene1-composed-t0.7.png`, `ost-scene1-composed-t4.5.png`.

## Evidence labels

- **Verified:** Outdated → Recompose → Final Scene Ready; ImageKit composed 1080×1920; OST burn-in at 0.7s; exit by 4.5s; no DOM over current MP4.
- **Blocked:** Assemble Final Short + full-package download (scenes 2–5 not produced).
- **Partially verified:** Subjective “looks good enough to ship” — titles readable and left/large; operator taste still personal.

## Status eval verdict (unchanged, now operator-grounded)

Manual pump plumbing is real. Live providers work for Scene 1 compose when env is set. Feeling “limited” is accurate for **package-level** completion until every scene is generated — not because Scene 1 compose is fake.
