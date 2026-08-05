# Research Prompt Builder

Upload company information, confirm what the system understood, answer a few material questions, and receive one professional ChatGPT market/social-content research prompt.

## MVP scope

1. CSV company ingestion  
2. Company understanding with fact / assumption / unknown labels  
3. Adaptive interview (usually 4–5 questions, max 7)  
4. Editable research brief  
5. Copy-ready eight-section research prompt  

Not included: research execution, topic generation, scripts, video prompts, auth, or database.

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

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Use **Use sample ZYNAVA CSV** or upload your own `.csv`.

## Verify

```bash
npm run typecheck
npm test
npm run build
```

## Architecture

- `src/app` — Next.js App Router pages and API routes  
- `src/features/research-prompt-builder` — schemas, ingestion, prompts, services, state, UI  
- `Reference/` — read-only archive of prior research and MarketMonth Agent OS materials  
- Runtime product prompts live under `src/features/.../prompts/` and are separate from any Agent OS docs  

## Privacy

Uploaded files are processed in memory for the active request path. Raw CSV/document text is not stored in `localStorage`. Do not upload secrets or personal data.
