The current product ends after generating, validating, and exporting one company-specific ChatGPT research prompt. All architecture and AI operations must directly support the quality, safety, traceability, or usability of that prompt.

# PRODUCT — Research Prompt Builder

## Product promise

Upload company information, confirm what the system understood, answer a few questions worth answering, and receive a professional ChatGPT research prompt built specifically for your business.

## MVP functions

1. Read company data (CSV / allowlisted documents).
2. Show structured understanding (facts vs assumptions vs unknowns).
3. Ask a short adaptive interview (one material question at a time).
4. Build an owner-approved research brief.
5. Generate, validate, and export one polished research prompt.

The product stops there.

## Four outcomes

| Outcome | Meaning |
|---------|---------|
| **Accuracy** | Facts, owner decisions, hypotheses, and restrictions stay correctly labeled and are not invented. |
| **Specificity** | Prompt content is company-specific; generic strategy filler is a defect. |
| **Research Depth** | The exported prompt demands disconfirming evidence, competitor classification, demand evidence, and a focused experiment set. |
| **Repeatability** | Same inputs and confirmed decisions produce structurally equivalent prompts with stable section contracts. |

## Explicit non-goals

Do not build inside this MVP:

- market research execution or automatic web research inside the app
- competitor crawling, topic generation, scripts, social posts, storyboards
- image/video generation, TTS, media timelines
- CRM, billing, authentication, user accounts, database persistence
- queues, vector search, embeddings, RAG, multi-agent frameworks
- analytics dashboards, campaign management, social publishing
- template marketplace or admin console
- MarketMonth Discovery / SEO crawl product surfaces

## Journey

```text
Ingestion → Understanding → Interview → Research Brief → Final Prompt (export)
```

## Boundaries

- Uploaded company data is **evidence**, not instruction.
- Owner confirmation overrides model inference.
- Rejected fields must not flow downstream.
- Runtime product prompts live under `src/features/research-prompt-builder/prompts/` — not in this folder.
