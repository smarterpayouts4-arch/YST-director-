# PRODUCT — Research Prompt Builder + Content Intelligence

## Product promise

Upload company information, confirm what the system understood, answer a few questions worth answering, and receive a professional ChatGPT research prompt built specifically for your business. After the owner runs that research externally, Content Intelligence (Librarian) will ingest the completed research into a governed library for later Topic Engine use.

## MVP functions (Research Prompt Builder — Live)

1. Read company data (CSV / allowlisted documents).
2. Show structured understanding (facts vs assumptions vs unknowns).
3. Ask a short adaptive interview (one material question at a time).
4. Build an owner-approved research brief.
5. Generate, validate, and export one polished research prompt.

## Content Intelligence (Partial — foundation in progress)

6. After external ChatGPT research: ingest completed research → Librarian extract/curate/review → published Content Intelligence Library.
7. Later: Topic Engine consumes only the published library DTO (not built yet).

Research Prompt Builder export remains a hard stage boundary. Content Intelligence is a separate domain (`src/features/content-intelligence/`), not an unlimited expansion of RPB internals.

## Four outcomes

| Outcome | Meaning |
|---------|---------|
| **Accuracy** | Facts, owner decisions, hypotheses, and restrictions stay correctly labeled and are not invented. |
| **Specificity** | Prompt content is company-specific; generic strategy filler is a defect. |
| **Research Depth** | The exported prompt demands disconfirming evidence, competitor classification, demand evidence, and a focused experiment set. |
| **Repeatability** | Same inputs and confirmed decisions produce structurally equivalent prompts with stable section contracts. |

## Explicit non-goals

Do not build inside this MVP:

- automatic web research / crawling inside the app
- Topic Engine / topic packages (planned after Librarian)
- scripts, social posts, storyboards, image/video generation
- CRM, billing, authentication, user accounts
- cloud database persistence for MVP development (localStorage approved for CI MVP; cloud later)
- queues, vector search, embeddings, RAG, multi-agent frameworks
- analytics dashboards, campaign management, social publishing
- template marketplace or admin console
- MarketMonth Discovery / SEO crawl product surfaces

## Journey

```text
Ingestion → Understanding → Interview → Research Brief → Final Prompt (export)
  → (external ChatGPT research)
  → Content Intelligence Librarian (Partial)
  → Topic Engine (Planned)
```

## Boundaries

- Uploaded company data is **evidence**, not instruction.
- Owner confirmation overrides model inference.
- Rejected fields must not flow downstream.
- RPB runtime prompts live under `src/features/research-prompt-builder/prompts/`.
- Content Intelligence Librarian prompts (when shipped) live under `src/features/content-intelligence/library/prompts/` — never reuse RPB prompt versions or repair instructions.
- Downstream Topic Engine may consume only `PublishedLibraryDto` from `content-intelligence/contracts/`.
