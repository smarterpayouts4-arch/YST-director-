# YouTube Short complete audit — 2026-08-02

Atom: `atom_909d95f74709` · base `http://localhost:3000`  
Script: [`scripts/audit-youtube-short-studio.mjs`](../../../scripts/audit-youtube-short-studio.mjs)  
Machine summary: [`evidence/audit-summary.json`](./evidence/audit-summary.json)

## Verdict

**Scene 1 Manual Short path: Pass (0 Fail).**  
**Package Assemble / Final download: Blocked (data)** — Export correctly shows `1 of 6 scenes ready` (disabled). Not a broken assemble button.

Overall slice status remains **Partial**: live Scene 1 compose + OST burn-in work; full Short export waits on scenes 2–6.

## Lane results

| Lane | Result | Evidence |
|------|--------|----------|
| A. Env gate | **Pass** | `operator-first-short-eval.ts` → Gate READY (live image/voice/compose/video + ImageKit/Gemini present) |
| B. Unit/domain | **Pass** | Focused Short suite **93/93** (assemble, compose, readiness, OST fixture, planner, parse/ingest, fingerprint, ASS) |
| C. Typecheck | **Pass** | `npm run typecheck` clean |
| D. Playwright UI | **Pass** (0 Fail) | See matrix below; screenshots under [`evidence/`](./evidence/) |
| E. API smoke | **Pass** | Production bundle 200; Scene 1 `composed=succeeded` `ostLayoutVersion=3`; no content API 5xx |
| F. Report | **Pass** | This file |

## Playwright check matrix

| Check | Status | Detail |
|-------|--------|--------|
| api.production-bundle | Pass | 6 scenes; s0 visual/narr/ost populated; composed succeeded; ostVer=3 |
| page.load | Pass | HTTP 200 |
| studio.scene-editor | Pass | Present |
| studio.manual | Pass | `aria-pressed=true` |
| studio.short-format | Pass | Short 9:16 selected |
| studio.readiness-list | Pass | prompt/still/voice/motion/composed all `ready`; scene ready for assembly |
| studio.prompts-hydrated | Pass | textareaLen=7394 matches API (collapsed counter can show 0) |
| studio.compose | Pass | Composed already Ready (ost v3 asset) |
| studio.composed-video | Pass | 1080×1920 · ~8.42s · ImageKit MP4 |
| studio.composed-seeks | Pass | Frames at 0.7s / 4.5s |
| studio.compose-download | Pass | HTTPS `.mp4` download href |
| studio.assemble-gate | **Blocked** | `1 of 6 scenes ready` disabled — correct gate |
| studio.download-final | **Blocked** | No package download until assemble |
| studio.paste-sheet | Pass | Open + cancel |
| api.critical-5xx | Pass | None |
| page.errors | Pass | None |

**Counts:** Pass 14 · Fail 0 · Blocked 2 · Partial 0 · Skip 0

## Visual notes (Playwright evidence)

- At ~0.7s: burned-in left title “Why is magnesium attracting attention?” with accent on magnesium ([`evidence/02-composed-t0_7.png`](./evidence/02-composed-t0_7.png)).
- Package title still says “creatine…” while Scene 1 content is magnesium — **Partial** content-consistency debt, not a compose pipeline break.
- Scenes 2–6 empty in storyboard — explains Assemble block.

## Honesty labels

- **Broken:** none found in this pass.
- **Blocked:** Assemble Final Short + package download (scenes 2–6 not Ready).
- **Verified:** Env live-ready; unit Short slice; Playwright Scene 1 Studio path; OST v3 composed MP4 dimensions + download link.
- **Not verified here:** live multi-scene GCS/Veo for scenes 2–6; clicking Assemble (correctly unavailable).

## How to re-run

```bash
# Server must be up on :3000
npx tsx scripts/operator-first-short-eval.ts   # with .env.local loaded
node scripts/audit-youtube-short-studio.mjs
# Optional: MM_AUDIT_COMPOSE=1  MM_AUDIT_ASSEMBLE=1  MM_AUDIT_ATOM_ID=…
```

## Related

- [`OPERATOR_CLICKTHROUGH_2026-08-02.md`](./OPERATOR_CLICKTHROUGH_2026-08-02.md)
- [`MANUAL_SHORT_STATUS.md`](./MANUAL_SHORT_STATUS.md)
- [`GATES_EVIDENCE.md`](./GATES_EVIDENCE.md)
