# Interview UX — Working File

**Authority:** working notes (not canon)  
**Status:** active design scratchpad  
**Updated:** 2026-08-06  
**Fixture:** `Reference/product-specs/fixtures/zynava-company.csv`  
**Live sample (app):** `public/samples/zynava-company.csv` (same content)

Use this file for the next design pass on the adaptive interview. Do not treat it as `project-knowledge/` truth until decisions are promoted.

---

## 1. Design fixture — ZYNAVA

Approved company CSV for first design / smoke scenarios.

| Field | Value (summary) |
|-------|-----------------|
| company_name | ZYNAVA |
| industry | Dietary supplements / AI-powered search and price comparison |
| offer | Free search, compare, plan builder, and educational AI advisor |
| customer_problem | More options than ever yet shoppers feel more confused |
| likely_audience | US adults researching supplements (new and form-aware buyers) |
| website_action | Start Saving / Explore Options / Get Started |
| geography | United States online (Tampa, FL address) |
| restrictions | Not medical advice; do not diagnose, treat, cure, or dose |

Copy path for designers / demos:

```text
Reference/product-specs/fixtures/zynava-company.csv
```

---

## 2. Was the interview supposed to be a chat window?

### Verdict: **No — not in approved RPB product specs.** (Verified)

There is **no** product-spec, wireframe, or FEATURE note that defines the owner interview as a chat thread, speak/voice UI, or message bubbles.

What *is* specified (and matches the mockup you shared more closely than a chat):

**Source:** `Reference/product-specs/research-prompt-builder-mvp.md` — Screen 3 Adaptive Interview + layout wireframe

```text
STRATEGIC QUESTION N OF M
Large question heading
Owner answer textarea
[ suggested answer ] [ upload supporting doc ]
Save & continue
```

Canonical live feature note (`project-knowledge/FEATURES/interview.md`) says: one question on screen, ethical TARI, information gain — not chat.

### Where “chat” *does* appear (do not confuse)

| Location | What it means |
|----------|----------------|
| Exported ChatGPT research prompt | Product deliverable, not interview UI |
| `Reference/agent-systems/*` | Agent/model chat rooms for *developer* agents |
| MarketMonth archives | Voice/render for short video — out of MVP |
| Ethical TARI concept | Trigger → Action → Reward → Investment interview *pattern*, still one-question form |

### If chat/speak is the desired direction

That would be a **new product decision**, not restoring a lost spec. Capture the decision here, then promote into `project-knowledge/UX.md` + FEATURES before building.

Open questions for us:

- [ ] Chat = conversational messages, or still one strategic question with a chat-like chrome?
- [ ] Speak = browser speech-to-text into the answer box, or full voice conversation?
- [ ] Keep suggested-answer + upload tabs inside chat, or replace them?

---

## 3. Do we need all interview questions?

### Canon (advisory MVP spec)

From `Reference/product-specs/research-prompt-builder-mvp.md` §9:

- Goal: **fewest questions** needed to prevent a materially wrong research assignment
- Default: **4–5 core**, max **2 conditional**, hard max **7**
- Interview can finish **before five** when decisions are resolved
- Five underlying decisions (language varies by industry):
  1. Customer moment  
  2. Viewer reward  
  3. Natural business bridge  
  4. Trust boundaries  
  5. Assumption to challenge  

### Live product note

`project-knowledge/FEATURES/interview.md`: information gain over questionnaire length.

### ZYNAVA implication (working hypothesis)

CSV already supplies audience, problem, offer, geography, claim risk, restrictions. Interview should **not** re-ask “who is your primary audience?” as if blank — it should resolve gaps the CSV cannot:

| Decision | Likely still needed for ZYNAVA? |
|----------|----------------------------------|
| Customer moment | Yes — CSV has problem, not the content “moment” |
| Viewer reward | Yes — not in CSV |
| Business bridge | Partial — website_action exists; may refine |
| Trust boundaries | Partial — restriction/claim_risk exist; confirm/expand |
| Challenge assumption | Yes — research must stress-test beliefs |

**Working recommendation:** keep the **five decision categories**, do **not** force five surface questions every run. For rich CSVs like ZYNAVA, expect **fewer** questions when categories are already covered by confirmed profile + suggested answers the owner accepts. UI “N of 5” is a progress hint, not a contract to ask five every time.

---

## 4. Mockup vs current app vs spec

| Element | MVP spec wireframe | Mockup (shared) | Current `interview-question.tsx` |
|---------|--------------------|-----------------|----------------------------------|
| One question + textarea | Yes | Yes | Yes |
| Suggested answer + insert | Yes | Yes (“Insert answer”) | Prefill + Suggestion / Clear (live) |
| Upload supporting doc | Yes | Yes (tab) | Yes (collapsed Add file) |
| Left progress rail | Yes | Yes | Stage rail (app shell) |
| Right “WHAT WE KNOW” / brief panels | Not in wireframe | Yes | No |
| Rich text toolbar / 500 char | Not in spec | Yes | Plain textarea |
| Chat / speak | No | No | No |

---

## 5. Primary references for the redesign

1. `Reference/product-specs/research-prompt-builder-mvp.md` — Screen 3 + §9 interview architecture  
2. `Reference/concepts/ethical-tari-interview-ux.md`  
3. `Reference/product-specs/system-flow.txt`  
4. `project-knowledge/FEATURES/interview.md`  
5. `src/features/research-prompt-builder/components/interview-question.tsx`  
6. Fixture: `Reference/product-specs/fixtures/zynava-company.csv`

---

## 6. Decisions log (fill as we go)

| Date | Decision | Owner | Promoted to canon? |
|------|----------|-------|--------------------|
| 2026-08-06 | ZYNAVA CSV staged as design fixture under Reference | — | N/A (fixture) |
| | Chat/speak interview — TBD | | |
| | Question count policy for rich CSVs — TBD | | |
