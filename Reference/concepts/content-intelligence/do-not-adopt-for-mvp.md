# Content Intelligence — do not adopt for MVP

Advisory fence derived from prompt-engineering transcripts and product doctrine.

| Pattern | Why not now |
|---------|-------------|
| Multi-agent / autonomous agents | Product is staged workflows, not agent swarms |
| RAG / embeddings / vector DB | Typed library records first; retrieval later if needed |
| Fine-tuning | Need golden failures before training |
| Memory agents | No persistent agent memory plane |
| Second-model critic | Deterministic curator + owner review first |
| Continuous / autonomous web research | Explicit non-goal |
| Exposed chain-of-thought requirements | Model reasoning effort is env-config; do not dump CoT into IR |
| Self-reflection loops in-chain | Prefer separate eval/review |
| Industry few-shots in runtime prompts | Leakage risk; keep company-agnostic contracts |
