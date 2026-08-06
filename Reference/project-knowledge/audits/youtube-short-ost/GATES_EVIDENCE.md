# OST upgrade — gates evidence

Date: 2026-08-02

## Commands

| Gate | Result |
|------|--------|
| `npm test` | **Pass** — 847/847 (includes OST FFmpeg fixture) |
| `npm run typecheck` | **Pass** |
| `npm run lint` | **Pass** (0 errors; 2 pre-existing warnings outside OST) |
| `npm run build` | **Pass** |
| `git diff --check` | **Partial** — unrelated `csv-contract.ts` blank-EOF; OST files clean |

## Focused OST proof

- Golden ASS @1080×1920: Fontsize=131, 3 title Dialogues, scaled `\move`/`\fad`, no `\pos`, event End ≈ 4.24s (opaque through 4.00s)
- Real lavfi + libass fixture via `resolveFfmpegPath`: frames at 0.0 / 0.3 / 0.7 / 2.0 / 4.3 / 5.5; hold > pre-enter and post-exit
- Freshness: missing `ostLayoutVersion` and version=2 mark composed outdated; preview uses `isComposedVideoVisuallyCurrent`

## Evidence wording

Verified in automated development and local FFmpeg fixture tests; live-provider and operator visual acceptance remain pending.

## Soft knowledge warnings (build)

- `PK-WARN-008: acknowledged — Freshness pilot CURRENT_STATE verified_against_commit optional; not part of OST scope`
