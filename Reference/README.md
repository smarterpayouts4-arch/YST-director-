# Reference Library (Advisory Only)

**Authority:** `advisory` — never project truth.

This folder holds source materials, diagrams, transcripts, and distilled concepts that inform Research Prompt Builder. Canonical decisions live in `/project-knowledge/`. Implementation evidence lives in `/src/`.

## Structure

```text
Reference/
├── README.md                 ← this file
├── manifest.json             ← machine-readable catalog
├── agent-systems/            ← agent loop diagrams + course transcripts
├── product-specs/            ← RPB MVP build prompt, System Flow, Agent OS guide
│   └── fixtures/             ← design / demo company CSVs (advisory copies)
├── concepts/                 ← short distilled notes (preferred reading)
├── advisory-sources/
│   └── narrative/            ← Hooked / storytelling / marketing hook / short-video sources
└── archives/
    └── marketmonth/          ← MarketMonth APS/MCP/knowledge (patterns only)
```

Active design scratchpad (not Reference): `docs/working/INTERVIEW_UX_WORKING.md`.

`approved.csv` is the rich website-scrape source; the live app sample is the converted `field,value` copy under `public/samples/zynava-company.csv` (mirrored in `product-specs/fixtures/`).

## Authority order

1. Live `project-knowledge/` (approved RPB truth)
2. Live code under `src/`
3. Distilled `Reference/concepts/`
4. `Reference/product-specs/` and `Reference/agent-systems/`
5. `Reference/archives/marketmonth/` (implementation patterns only — never product doctrine)

## Hard rules

- Do not treat Reference as Product Knowledge.
- Do not auto-rewrite PRODUCT.md / ARCHITECTURE.md from Reference content.
- Short-video production workflows are **out of MVP scope**.
- Ethical TARI (Trigger→Action→Reward→Investment) applies to **owner interview UX**, not dark-pattern habit design.
- MCP and Living Intelligence serve Cursor/developers; they do not expand the customer-facing product beyond one exported research prompt.
