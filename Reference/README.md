# Reference Library (Advisory Only)

**Authority:** `advisory` — never project truth.

This folder holds source materials, diagrams, transcripts, and distilled concepts that inform Research Prompt Builder. Canonical decisions live in `/project-knowledge/`. Implementation evidence lives in `/src/`.

## Structure

```text
Reference/
├── README.md                 ← this file
├── manifest.json             ← machine-readable catalog
├── agent-systems/            ← agent loop diagrams + course transcripts
│   └── prompt-engineering/   ← prompt/context engineering transcripts (advisory raw)
├── product-specs/            ← RPB MVP build prompt, System Flow, Agent OS guide
│   ├── fixtures/             ← design / demo company CSVs (advisory copies)
│   └── content-intelligence/ ← CI architecture discovery (advisory)
├── concepts/                 ← short distilled notes (preferred reading)
│   └── content-intelligence/ ← Librarian principles + do-not-adopt fence
├── channels/
│   └── youtube-shorts/       ← Shorts-owned HOW library (never runtime-import)
│       ├── README.md         ← Atom firewall + prompt-not-video
│       ├── SOURCE_MAP.md     ← what each source is / is not
│       ├── director/         ← Arijon visual grammar + Milne scene direction
│       ├── owner-notes/
│       ├── scene-prompt-examples/
│       ├── prior-system/     ← historical MarketMonth patterns
│       └── incoming/         ← unreviewed drops; not doctrine
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
5. `Reference/channels/youtube-shorts/` (Shorts HOW craft only — never topic truth; Atom always wins)
6. `Reference/archives/marketmonth/` (implementation patterns only — never product doctrine)

## Hard rules

- Do not treat Reference as Product Knowledge.
- Do not auto-rewrite PRODUCT.md / ARCHITECTURE.md from Reference content.
- Do **not** runtime-import any Reference file into product code (including `channels/youtube-shorts/**`).
- Canonical Atom (`TopicPacket`) is the only dynamic governed intelligence input for channels.
- Short-video / YouTube Shorts HOW material for the channel brain lives under `channels/youtube-shorts/`; distill later into Shorts-owned doctrine — never RAG, never localStorage. The later product emits a video-generation-ready **prompt**; it does not render video. There is no feature-local raw corpus under `src/features`.
- Ethical TARI (Trigger→Action→Reward→Investment) applies to **owner interview UX**, not dark-pattern habit design.
- MCP and Living Intelligence serve Cursor/developers; they do not expand customer-facing product scope.
- Do **not** runtime-import prompt-engineering transcripts into Content Intelligence or RPB prompts.
