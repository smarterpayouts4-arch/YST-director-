# Three-Plane Foundation — Definition of Done

Checked against the Living Project Intelligence plan (2026-08-05).
Honesty pass 2026-08-06: unchecked items reflect the foundation-readiness audit
(`docs/audits/FOUNDATION_READINESS_AUDIT.md`).

## Product boundary

- [x] Governing sentence in PRODUCT.md, AGENTS.md, README, CURRENT_STATE
- [x] Four outcomes named
- [x] Explicit STOP after prompt export
- [x] Narrative quality rules for interview + master prompt (not video production)

## Product plane

- [x] Explicit workflow state machine ending at PROMPT_EXPORTED / COMPLETE
- [ ] Transitions hard-enforced in the reducer (currently soft-allowed)
- [x] Failure / degraded modes documented in workflow-states
- [x] Decision Ledger type + helpers
- [ ] Decision Ledger consumed by brief/prompt compilers

## AI control plane

- [x] Versioned contract registry
- [x] Context compiler per AI operation
- [x] AI operation registry + prompt versioning
- [x] AiTrace behavioral tuple
- [x] Prompt contract lint (semantic validators)
- [x] Six industry eval fixtures + injection-surface check
- [x] Typed config modules
- [x] Storage envelope + migrations

## Engineering intelligence plane

- [x] Live project-knowledge canon (not MarketMonth doctrine)
- [x] Living scanner → generated indexes/maps/reports with envelopes
- [x] Guardian hard/warn codes
- [ ] agent-learning approval pipeline (propose/review only; approval is manual)
- [x] Lean APS + Cursor adapters
- [x] Read-only `rpb_*` MCP (host stdio) — implemented and tested; Cursor connection is a local owner step
- [x] MCP profiles YAML (development on; research-future disabled)
- [x] doctor / verify scripts
- [ ] precommit-fast wired as an actual git hook (currently manual `npm run precommit:fast`)
- [x] GitHub Actions CI + generated-maps bot PR workflow (unproven on remote until first run)
- [ ] API route integration tests
- [ ] Playwright E2E (config + mocked happy path)
- [x] CURSOR_FOUNDATION_HARDENING_PROMPT.md
- [x] Honest CURRENT_STATE.md

## Reference library

- [x] Reorganized folders + manifest + concepts
- [x] Desktop narrative sources imported as advisory
- [x] Porting notes with do-not-adopt markers
