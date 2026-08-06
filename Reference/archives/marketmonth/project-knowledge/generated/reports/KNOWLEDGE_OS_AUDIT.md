<!-- GENERATED FILE: DO NOT EDIT -->
<!-- Source: project-knowledge/scripts/knowledge-os-audit.mjs -->
# Knowledge OS Audit

**Knowledge OS operational status: DEGRADED**

**Project closeout readiness: NOT READY**

Evaluated: `2026-07-31T18:25:07.659Z`

Run ID: `e30ff590-9972-4c07-ad4d-3570255f42f9`

> Knowledge OS operational status: DEGRADED. Project closeout readiness: NOT READY. Closeout reasons: lint failed (exit 1); test failed (exit 1); audit:deps failed (exit 1); daily:closeout failed (exit 1); 11 high/critical dependency advisories remain; 3 documented blocked remediation(s) — see DEPENDENCY_BLOCKERS.md. This does not constitute external certification. Limited external baseline coverage does not imply Knowledge OS malfunction.

## Scope

MarketMonth Project Knowledge OS — structure, security, independence, MCP, living detection, known risks

## Status semantics

- Knowledge OS operational (`READY` | `DEGRADED` | `NOT OPERATIONAL`): maps, checks, quality artifacts, MCP — not product dependency posture.
- Project closeout readiness (`READY` | `READY WITH WARNINGS` | `NOT READY`): required probes + high/critical dependency gate.
- `READY` never means externally certified.
- Exit code nonzero when project closeout is `NOT READY` or Knowledge OS is `NOT OPERATIONAL`.

### Closeout reasons

- lint failed (exit 1)
- test failed (exit 1)
- audit:deps failed (exit 1)
- daily:closeout failed (exit 1)
- 11 high/critical dependency advisories remain
- 3 documented blocked remediation(s) — see DEPENDENCY_BLOCKERS.md

### Knowledge OS reasons

- daily-closeout.mjs is 284 lines and still mixes orchestration and report body; no split required this pass

## Git

- Commit SHA: `76ea62febc335ebecbb6763c848e2898f58d27d0`
- Git scope: `project-root`

## Scores

- Internal Engineering Quality Score: **8.7/10** (rubric `2.1.0`)
- External Baseline Coverage: **50%** (`Limited`)
- External certification: `None`
- AI audit: `completed` (advisory only)

## Results

- Knowledge structure: `PASS`
- Canonical authority: `PASS`
- Monolithic files: `PASS` (largest PK script: `project-knowledge/scripts/knowledge-os-audit.mjs` @ 1035 lines)
- Mixed responsibility: `READY WITH WARNINGS`
- Component independence: `PASS` (unowned=0)
- Secret leak: `PASS`
- Documentation: `PASS`
- MCP readiness: `PASS`
- Living / stale detection: `PASS`

## Typecheck reliability

- Current typecheck result: `PASS` (exit 0)
- Probe reliability history: `FLAKY`
- Last 10 runs: 2 pass, 1 fail (n=3)
- Previously reported intermittent failure: `unresolved/unreproduced`

## Visibility timing (not continuous watch)

- **knowledge:update**: regenerates maps/indexes
- **knowledge:sync**: update + guardian warnings
- **knowledge:check**: stale compare + hard fail
- **quality:check**: stale quality artifacts + probes
- **daily:closeout**: full gate set
- **CI**: knowledge-check.yml

## Command evidence (same run `e30ff590-9972-4c07-ad4d-3570255f42f9`)

| Command | Exit | OK | Duration ms |
|---|---:|:---:|---:|
| `npm run typecheck` | 0 | yes | 33737 |
| `npm run lint` | 1 | no | 46583 |
| `npm run test` | 1 | no | 39435 |
| `npm run knowledge:update` | 0 | yes | 1741 |
| `npm run knowledge:check` | 0 | yes | 3025 |
| `npm run quality:update` | 0 | yes | 85470 |
| `npm run quality:check` | 0 | yes | 100430 |
| `npm run audit:deps` | 1 | no | 8378 |
| `npm run ai:audit` | 0 | yes | 27825 |
| `npm run mcp:test` | 0 | yes | 14930 |
| `npm run daily:closeout` | 1 | no | 285734 |

### project:audit equivalence

- Definition: `npm run project:audit → knowledge:check && quality:check`
- Invoked separately this run: `false`
- Equivalent would pass: `true`
- Shared probes already include knowledge:check and quality:check once; project:audit kept as convenience npm script only.

## Dependency severity counts

- critical: **0**
- high: **11**
- moderate: **6**
- low: **0**

> `npm run audit:deps` uses --audit-level=high (nonzero exit on high/critical only). Moderate and low findings still exist and are counted above.

## Known unresolved risks

- **dep-vulns-high** (high): 11 high/critical advisories remain; audit:deps exit=1. No force-fix applied. See dependencyVulnerabilitiesHigh and DEPENDENCY_BLOCKERS.md.
- **sharp-outside-next-16.2.11-range** (high): sharp@0.34.5 via next@16.2.11 optionalDependency ^0.34.5; patched >=0.35.0 is outside Next's declared range. Blocked until stable Next ships sharp>=0.35. No canary without approval.
- **next-npm-force-downgrade-ignore** (high): npm may suggest a force-downgrade for next. Ignored. Nested postcss cleared via overrides.next.postcss=8.5.22 (review 2026-07-25). next remains high via sharp until upstream ships sharp>=0.35.
- **eslint-10-peer-blocked** (high): eslint@10.8.0 attempted; eslint-config-next@16.2.11 plugins peer only eslint@^9 (invalid peer state). Reverted to eslint@^9.39.5. Remaining minimatch/plugin highs wait on upstream.

## High/critical dependency advisories (11)

| Package | Installed | Direct | npm suggested | Downgrade? | Safe path |
|---|---|:---:|---|:---:|---|
| `@eslint/config-array` | `0.21.2` | no | `eslint@10.8.0` | no | Requires reviewed major upgrade to eslint@10.8.0 — do not npm audit fix --force |
| `@eslint/eslintrc` | `3.3.6` | no | `eslint@10.8.0` | no | Requires reviewed major upgrade to eslint@10.8.0 — do not npm audit fix --force |
| `brace-expansion` | `5.0.8` | no | `eslint@10.8.0` | no | Requires reviewed major upgrade to eslint@10.8.0 — do not npm audit fix --force |
| `eslint` | `9.39.5` | yes | `eslint@10.8.0` | no | Requires reviewed major upgrade to eslint@10.8.0 — do not npm audit fix --force |
| `eslint-config-next` | `16.2.11` | yes | `eslint-config-next@12.0.4` | yes | Ignore npm force-downgrade suggestion (eslint-config-next@12.0.4) — do not npm audit fix --force |
| `eslint-plugin-import` | `?` | no | `eslint-config-next@12.0.4` | yes | Ignore npm force-downgrade suggestion (eslint-config-next@12.0.4) — do not npm audit fix --force |
| `eslint-plugin-jsx-a11y` | `?` | no | `eslint-config-next@12.0.4` | yes | Ignore npm force-downgrade suggestion (eslint-config-next@12.0.4) — do not npm audit fix --force |
| `eslint-plugin-react` | `?` | no | `true (unspecified)` | no | Non-major fix may be available — review changelog then upgrade |
| `minimatch` | `10.2.5` | no | `eslint@10.8.0` | no | Requires reviewed major upgrade to eslint@10.8.0 — do not npm audit fix --force |
| `next` | `16.2.11` | yes | `next@14.2.35` | yes | Ignore npm force-downgrade suggestion (next@14.2.35) — do not npm audit fix --force |
| `sharp` | `0.34.5` | no | `next@14.2.35` | no | Requires reviewed major upgrade to next@14.2.35 — do not npm audit fix --force |

## Classification lists

- Canonical: project-knowledge/PRODUCT.md, project-knowledge/ARCHITECTURE.md, project-knowledge/CURRENT_STATE.md
- Generated: `project-knowledge/generated/**`
- Deprecated / historical / orphaned: none confirmed

## Failed command tails

### `npm run lint` (exit 1)

```text
> marketing-ai@0.1.0 lint
> eslint


C:\Users\ofran\Desktop\MarketMonth\src\brain\channels\youtube-short\scene-structure.ts
  188:23  warning  '_drop' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\ofran\Desktop\MarketMonth\src\brain\evaluation\evidence\parse-structured.ts
  138:44  warning  'value' is defined but never used  @typescript-eslint/no-unused-vars

C:\Users\ofran\Desktop\MarketMonth\src\components\dashboard\content\studio\preview-canvas.tsx
   84:20  error    Error: Calling setState synchronously within an effect can trigger cascading renders

Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:
* Update external systems with the latest state from React.
* Subscribe for updates from some external system, calling setState in a callback function when external state changes.

Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).

C:\Users\ofran\Desktop\MarketMonth\src\components\dashboard\content\studio\preview-canvas.tsx:84:20
  82 |
  83 |   useEffect(() => {
> 84 |     if (!assetUrl) setZoomed(false);
     |                    ^^^^^^^^^ Avoid calling setState() directly within an effect
  85 |   }, [assetUrl]);
  86 |
  87 |   return (  react-hooks/set-state-in-effect
  229:12  warning  Unused eslint-disable directive (no problems were reported from 'jsx-a11y/media-has-caption')

✖ 4 problems (1 error, 3 warnings)
  0 errors and 1 warning potentially fixable with the `--fix` option.


npm warn Unknown env config "devdir". This will stop working in the next major version of npm.
```

### `npm run test` (exit 1)

```text
 ? (\n        <div\n          className="border-t border-border/50 px-2.5 py-2"\n          data-testid="studio-preview-voice-player"\n        >\n          <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.12em] text-text-muted">\n            Scene voiceover\n            {voiceDurationSeconds == null ? " · duration Unverified" : ""}\n          </p>\n          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}\n          <audio\n            controls\n            src={voiceUrl}\n            className="w-full"\n            data-testid="studio-preview-voice-audio"\n          />\n        </div>\n      ) : null}\n\n      {zoomed && assetUrl\n        ? createPortal(\n            <div\n              className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 sm:p-8"\n              role="dialog"\n              aria-modal="true"\n              aria-labelledby={titleId}\n              data-testid="studio-preview-zoom-dialog"\n              onClick={() => setZoomed(false)}\n            >\n              <p id={titleId} className="sr-only">\n                Zoomed scene preview\n              </p>\n              <button\n                type="button"\n                className="absolute top-3 right-3 rounded-md bg-white/10 p-2 text-white transition-colors hover:bg-white/20"\n                aria-label="Close zoomed preview"\n                data-testid="studio-preview-zoom-close"\n                onClick={() => setZoomed(false)}\n              >\n                <X className="h-4 w-4" aria-hidden />\n              </button>\n              <div\n                className={cn(\n                  "relative max-h-full max-w-full overflow-hidden shadow-2xl",\n                  isShort ? "aspect-[9/16]" : "aspect-video"\n         '... 790 more characters,
    expected: /studio-preview-onscreen-overlay/,
    operator: 'match',
    diff: 'simple'
  }

npm warn Unknown env config "devdir". This will stop working in the next major version of npm.
```

### `npm run audit:deps` (exit 1)

```text
 versions of eslint-plugin-jsx-a11y
      Depends on vulnerable versions of eslint-plugin-react
      node_modules/eslint-config-next
    eslint-plugin-jsx-a11y  >=6.5.0
    Depends on vulnerable versions of minimatch
    node_modules/eslint-config-next/node_modules/eslint-plugin-jsx-a11y
    eslint-plugin-react  >=7.23.0
    Depends on vulnerable versions of minimatch
    node_modules/eslint-config-next/node_modules/eslint-plugin-react

esbuild  <=0.24.2
Severity: moderate
esbuild enables any website to send any requests to the development server and read the response - https://github.com/advisories/GHSA-67mh-4wv8-2f99
fix available via `npm audit fix --force`
Will install drizzle-kit@0.18.1, which is a breaking change
node_modules/@esbuild-kit/core-utils/node_modules/esbuild
  @esbuild-kit/core-utils  *
  Depends on vulnerable versions of esbuild
  node_modules/@esbuild-kit/core-utils
    @esbuild-kit/esm-loader  *
    Depends on vulnerable versions of @esbuild-kit/core-utils
    node_modules/@esbuild-kit/esm-loader
      drizzle-kit  0.19.0 - 1.0.0-beta.1-fd8bfcc
      Depends on vulnerable versions of @esbuild-kit/esm-loader
      node_modules/drizzle-kit

sharp  <0.35.0
Severity: high
sharp inherited vulnerabilities in libvips: CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591 - https://github.com/advisories/GHSA-f88m-g3jw-g9cj
fix available via `npm audit fix --force`
Will install next@14.2.35, which is a breaking change
node_modules/sharp
  next  9.5.6-canary.0 - 10.0.7 || 14.3.0-canary.0 - 16.3.0-preview.7
  Depends on vulnerable versions of sharp
  node_modules/next

17 vulnerabilities (6 moderate, 11 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

npm warn Unknown env config "devdir". This will stop working in the next major version of npm.
npm warn Unknown env config "devdir". This will stop working in the next major version of npm.
```

### `npm run daily:closeout` (exit 1)

```text
> marketing-ai@0.1.0 daily:closeout
> node project-knowledge/scripts/daily-closeout.mjs


npm warn Unknown env config "devdir". This will stop working in the next major version of npm.
daily:closeout — NOT READY TO CLOSE
score 8.7/10 — report C:\Users\ofran\Desktop\MarketMonth\project-knowledge\generated\reports\DAILY_LATEST.md
```
