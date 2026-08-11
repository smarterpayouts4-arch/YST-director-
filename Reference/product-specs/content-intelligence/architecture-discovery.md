# Content Intelligence — Architecture Discovery (advisory)

**Authority:** advisory · Not product truth. Canonical status: `project-knowledge/CURRENT_STATE.md` + `PRODUCT.md`.

## Domain

```text
RPB export → external ChatGPT research
  → Content Intelligence Librarian (Partial)
  → PublishedLibraryDto
  → Topic Engine (Planned)
```

## Placement

```text
src/features/content-intelligence/
  contracts/   # PublishedLibraryDto only
  library/     # Librarian (PR1+)
  # topics/ created only when Topic Engine ships — no empty scaffold
```

## Librarian job

Turn completed external research into governed, provenance-aware Content Intelligence.  
Terra (`OPENAI_MODEL`) structured extract + deterministic curation + owner review.

## Development persistence

`content-intelligence:v1` localStorage behind CI storage module. Not permanent cloud architecture.

## Hard firewalls

- No RPB prompt/version/repair reuse
- No Topic Engine reading Librarian private state
- No runtime import of Reference transcripts
- Shared AI gateway at `src/ai/structured-output/` only for HOW to call the model
