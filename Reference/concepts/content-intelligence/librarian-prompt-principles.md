# Librarian prompt principles (distilled)

**Authority:** advisory · **Applies to:** Content Intelligence Librarian only  
**Source transcripts:** `Reference/agent-systems/prompt-engineering/` (do not runtime-import)

## Adopt

1. **Single clear task** — turn completed external research into governed, provenance-aware library items.
2. **System vs task separation** — trusted instructions vs untrusted research payload fences.
3. **Role + task + constraints + explicit output contract** — structured Zod output; no free-form dump.
4. **Controlled context** — research artifact + thin owner restrictions; do not dump full RPB IR.
5. **Insufficient evidence** — surface `needs_review` / empty kinds; never invent customer problems or strategy.
6. **Prompt/version traceability** — Librarian owns its runtime prompt version (not RPB’s).
7. **Deterministic validation after extract** — quote checks, schema, status gates in TypeScript.
8. **Eval / golden thinking** — representative research reports before expanding taxonomy.

## Reject for Librarian MVP

Multi-agent orchestration · RAG/vector DB · fine-tuning · memory agents · second-model critic · autonomous browsing · required chain-of-thought in outputs · giant transcript dumps in prompts · topic/hook/script generation
