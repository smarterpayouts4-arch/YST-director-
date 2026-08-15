# YouTube Shorts Story Brain

This folder is the Shorts-owned storytelling intelligence layer.

```text
Clean Atom (WHAT / WHY)
        ↓
YouTube Shorts Story Brain (HOW)
        ↓
locked storyArchitecture
        ↓
seven connected scenes
```

These Markdown files are the human-readable brain. They are a deliberate distill of approved Reference sources, not a copy of those sources.

Runtime does **not** load `Reference/`. Runtime does **not** RAG this folder. The compact operational extract lives in `prompts/story-brain.ts` and is assembled into `generate-shorts-storyboard`.

| File | Job |
|------|-----|
| `story-principles.md` | High-level HOW, including spoken first-hearing language and the 22-word narration budget |
| `hook-strategy.md` | How to choose a truthful Hook (`hookWhy` names the beaten alternative) |
| `story-architecture.md` | How to lock one story, then write seven causal scenes |
| `reference-map.md` | Adopted / adapted / rejected sources |

## Update rule

Edit the Markdown first. Port only operational decision rules into `story-brain.ts` in the same change. Bump `SHORTS_RUNTIME_PROMPT_VERSION`. Do not add worked examples, product names, or topic-specific cases.
