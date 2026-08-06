# Owner Smoke Test 01 — ZYNAVA Sample Journey

Date: 2026-08-06  
Branch at test time: local `main` @ `61100ea` + uncommitted interview schema fix  
Method: live Playwright owner smoke (`e2e/owner-smoke-live.spec.ts`) against `npm run dev` on `:3000`  
OpenAI: real API (intentional owner smoke, not CI)

## Verdict

**PASS with one critical defect found and fixed during the run.**

The end-to-end product path works with the sample ZYNAVA CSV after fixing an OpenAI structured-output schema bug that blocked interview question generation.

## Environment

| Item | Value |
|------|-------|
| Model | `gpt-5.6-terra` |
| Company fixture | `public/samples/zynava-company.csv` |
| Supporting doc | `tmp-smoke-support.txt` (uploaded on Q1) |
| Total wall time | ~136s (2.3 min) |
| Prompt version / meta | Final title: `ZYNAVA US Supplement-Comparison Content Market Research Prompt` |
| Artifacts | `docs/audits/artifacts/owner-smoke-01.json`, `owner-smoke-01-prompt.md`, downloaded `.md` |

## Journey checklist

| Step | Result | Notes |
|------|--------|-------|
| CSV upload / sample analysis | Pass | ~12–15s; facts/assumptions/restrictions labeled |
| Owner confirm / correct / reject | Pass | All material fields confirmed; audience had prior correction text; last claim field rejected in UI flow |
| Suggested-answer insertion | Pass | Used on every interview question |
| Adaptive questions (4–5) | Pass | **5 questions** generated |
| Supporting-document upload | Pass | `/api/documents/extract` ~11.5s on Q1 |
| Research brief generate + edit | Pass | Brief built; owner note appended to company truth |
| Final master prompt | Pass | Required repair once (`repaired: true`), ~58s |
| Copy | Pass | Clipboard contained eight-section prompt |
| Markdown download | Pass | Saved under `docs/audits/artifacts/` |
| Refresh / restore | Pass | Prompt and project filename restored from localStorage |
| Reset | Pass | Returned to ingestion |

## Timing (approx.)

| Stage | Duration |
|-------|----------|
| Analyze company | ~12.4s |
| Interview (5 Q + answers + extract) | ~53.8s |
| Research brief | ~17s (server) |
| Compile research prompt | ~58.4s (1 repair) |
| **Total smoke wall clock** | **~136s** |

## Defect found during smoke

**Blocker:** `POST /api/interview/next` returned 500 with:

> Zod field at `#/definitions/next_interview_question/properties/completionReason` uses `.optional()` without `.nullable()` which is not supported by the API.

**Fix applied locally:** `NextQuestionResponseSchema` in `generate-next-question.ts` now uses `.nullable()` for `completionReason` and `question` (OpenAI structured-output requirement). After the fix, interview calls returned 200.

This fix was **not** part of merged PR #1; it is queued for the prompt-quality calibration branch.

## Questions generated

1. Which shopper decision should ZYNAVA most want its educational content to intercept first: choosing between forms of the same supplement before purchase?
2. What is the one clear takeaway you want a shopper comparing forms of the same supplement to leave with?
3. Should ZYNAVA’s educational content primarily invite viewers to start a guided comparison for the supplement category they are already considering?
4. Should ZYNAVA set its core trust boundary as: explain what forms and label details are, but never say which form a person should choose for a symptom, condition, or dosage need?
5. Should ZYNAVA make “a supplement form is one important comparison point, not a shortcut to the right choice” its central educational stance?

**Owner edits required:** minimal — suggested answers used; one brief company-truth append (`Owner note: prioritize comparison education.`).

## Master prompt quality scores (1–10)

| Dimension | Score | Evidence |
|-----------|------:|----------|
| Company specificity | 9 | Named ZYNAVA, US online comparison experience, form-led education |
| Niche relevance | 9 | Pre-purchase form/label comparison for supplements |
| Factual discipline | 9 | Explicit owner-confirmed vs hypothesis vs restriction labels |
| Audience-first framing | 9 | Opens on shopper decision moment, not company promo |
| Research depth | 8.5 | Ten sharp research questions; opportunity scoring required |
| Competitor classification | 9 | Direct / adjacent / aspirational required with definitions |
| Contradictory-evidence requirements | 9 | Dedicated disconfirming-evidence + red-team / go-no-go |
| Report structure | 9 | Eleven-part report + 3 pillars × 2 experiments |
| Usability in ChatGPT | 8.5 | Long (~16.7k chars) but paste-ready with clear STOP line |
| **Overall quality** | **8.8** | Strong first live export; ready for multi-fixture calibration |

## UX / friction notes

1. Confirming ~12 understanding fields one-by-one is slow for owners (bulk confirm would help).
2. Interview questions were tightly clustered on “form comparison” — good specificity, mild redundancy risk across fixtures.
3. Final prompt compilation needed one structured-output repair (~58s) — acceptable but worth watching.
4. Cursor browser automation was awkward for this flow; live Playwright against `dev` was the reliable smoke harness.
5. Local MCP: `.cursor/mcp.json` written with RPB MCP + Context7 only. Owner still must restart Cursor and disable Docker-gateway write / gateway-control tools in Settings → MCP.

## MCP owner actions status

| Action | Status |
|--------|--------|
| Copy `.cursor/mcp.json.example` → `.cursor/mcp.json` | Done (gitignored) |
| Keep Context7 | In example / local config |
| Disable GitHub write / Docker gateway control | **Owner must toggle in Cursor UI after restart** |
| Keep Playwright / Perplexity on demand | Owner setting |
| Disable YouTube / future research MCP | Already out of project example |
| Review RepoBrain necessity | Recommend disable for this project; RPB MCP covers project intelligence |
| Confirm `rpb_*` tools appear | **Requires Cursor restart** |

## Next

1. Land the interview `.nullable()` fix on `feat/prompt-quality-calibration`.
2. Run 3–5 additional business fixtures.
3. Improve prompts / context assembly / evals from repeated weaknesses.
4. Rerun `npm run verify`.

## Evidence labels

- **Verified:** PR #1 merged; local main @ `61100ea`; `npm run verify` green; live ZYNAVA smoke pass after schema fix; copy/download/refresh/reset.
- **Partially verified:** Cursor MCP lockdown (config written; UI toggles need owner restart).
- **Assumed:** Prompt quality scores are reviewer judgment against the exported Markdown artifact.
