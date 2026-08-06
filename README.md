# Research Prompt Builder

> **The current product ends after generating, validating, and exporting one company-specific ChatGPT research prompt. All architecture and AI operations must directly support the quality, safety, traceability, or usability of that prompt.**

Upload company information, confirm what the system understood, answer a few material questions, and receive one professional ChatGPT market/social-content research prompt — then STOP.

## MVP scope

1. CSV company ingestion  
2. Company understanding with fact / assumption / unknown labels  
3. Adaptive interview (usually 4–5 questions, max 7)  
4. Editable research brief  
5. Copy-ready eight-section research prompt  

**Out of MVP:** research execution, topic generation, scripts, video prompts, auth, database.

## Four outcomes

Accuracy · Specificity · Research Depth · Repeatability

## Setup

```bash
npm install
```

Ensure `.env.local` includes at least:

```env
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5.6-terra
OPENAI_REASONING_EFFORT=medium
```

Copy MCP example for Cursor (optional):

```bash
copy .cursor\mcp.json.example .cursor\mcp.json
```

## Run

```bash
npm run dev
```

`dev` runs `doctor` first, then starts Next.js. If health checks fail, the server does not start.

Escape hatch when you only need a hot reload (skip doctor):

```bash
npm run dev:fast
```

Production-style start after `npm run build`:

```bash
npm run start:safe
```

Open [http://localhost:3000](http://localhost:3000). Use **Use sample ZYNAVA CSV** or upload your own `.csv`.

## Verify

```bash
npm run verify
```

Fast pre-commit heuristic:

```bash
npm run precommit:fast
```

## Architecture (three planes)

| Plane | Role |
|-------|------|
| Product | State machine UI ending at `PROMPT_EXPORTED` |
| AI Control | Contracts, context compiler, prompts, ops registry, traces, evals |
| Engineering Intelligence | `project-knowledge/`, Guardian, APS, read-only `rpb_*` MCP, CI |

Canonical docs: [`project-knowledge/`](project-knowledge/) · Agent entry: [`AGENTS.md`](AGENTS.md) · Hardening prompt: [`docs/ai/CURSOR_FOUNDATION_HARDENING_PROMPT.md`](docs/ai/CURSOR_FOUNDATION_HARDENING_PROMPT.md) · MCP profiles: [`docs/ai/mcp-profiles.yaml`](docs/ai/mcp-profiles.yaml)

## Key trees

- `src/features/research-prompt-builder` — product feature  
- `src/ai` — contracts, context compiler, operations, traces  
- `src/config` — typed policies  
- `project-knowledge/` — live RPB truth  
- `agent-prompt-system/` — Cursor agent OS (lean)  
- `mcp/` — host stdio Project Intelligence MCP  
- `agent-learning/` — candidates requiring human approval  
- `Reference/` — advisory only (never project truth)

## Privacy

Uploaded files are processed in memory for the active request path. Raw CSV/document text is not stored in `localStorage`. Do not upload secrets or personal data.
