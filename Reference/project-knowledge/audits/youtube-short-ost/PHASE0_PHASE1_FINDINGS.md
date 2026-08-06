# YouTube Short OST — Phase 0 / Phase 1 findings

Status: development audit notes (not auto-committed).  
Date: 2026-08-02.  
HEAD baseline at audit: `d4bf245` + dirty OST v2 WIP.

## Phase 0 — Repository truth

| Item | Value |
|------|--------|
| Live burn-in path | `onScreenText` → `buildOnScreenTextLayout` → `titleOverlay` → `buildTitleAssOverlay` → FFmpeg `subtitles=` + fontsdir → `composedVideo` |
| Parser SoT | `src/brain/content-studio/on-screen-text-layout.ts` |
| Metrics SoT | `src/brain/content-studio/on-screen-text-layout-metrics.ts` |
| ASS builder | `src/brain/render/adapters/build-title-ass.ts` (sole) |
| Font | `assets/fonts/BricolageGrotesque-Bold.ttf` → ASS Fontname `Bricolage Grotesque 96pt ExtraBold` |
| FFmpeg PATH | Absent in shell; compose uses `resolveFfmpegPath` / `ffmpeg-static` |
| Competing burn-in | None (`drawtext` / second ASS builder absent) |
| JSON2Video text | Idle / unexported — do not delete in this change |

## Phase 1 — Risk-ranked findings (fleet)

1. **High — Old MP4s stay “current”**  
   Missing `ostLayoutVersion` passed provenance; preview `composedIsCurrent` ignored version/preset.

2. **High — ASS hardcodes + aggressive wrap**  
   `\move(...,0,320)` / `\fad(260,...)` ignored scaled timing; `guardTitleLines` maxChars≈9 over-split titles.

3. **Medium — DOM ≠ ASS**  
   CSS `%` top is width-relative; no ~4s exit; metrics unused by DOM; never overlay a current composed MP4.

4. **Medium — Soft stale / operator traps**  
   Version bump → readiness outdated without durable `status:stale`; draft OST hidden under succeeded MP4 when preview gate is wrong.

5. **Medium — Font logs blind**  
   libass `fontselect` stderr not quote-wrapped; regex never matched.

6. **Medium — Test gaps**  
   Missing version-invalidation matrix, golden ASS @1080×1920, real ffmpeg-static fixture.

7. **Low — Env**  
   `MM_OST_ANIMATION` absent; preset not in compose env fingerprint.

## Implement decisions (locked)

- Keep ASS/libass; default `stagger-fade-slide`
- `MM_OST_ANIMATION=static|stagger` (default stagger) with fingerprint participation
- Bump `OST_LAYOUT_VERSION` → **3**
- Metrics remain SoT; ASS End = opaqueUntil + exitFade so text stays readable ~4s
- Prefer wrap budget fix so “attracting attention?” is one Dialogue
- Do not delete JSON2Video / globals / unused `--compact` in this commit

## Evidence wording (post-gates)

Verified in automated development and local FFmpeg fixture tests; live-provider and operator visual acceptance remain pending.
