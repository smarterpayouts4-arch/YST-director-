# PROMPT_CONTRACT — Exported Research Prompt

Canonical contract for the **exported** ChatGPT research prompt. Runtime developer prompts are separate (`src/features/research-prompt-builder/prompts/`).

**Contract version:** 1.1.0 (anchored research controls Live in code + lint)

## Eight required sections

The deterministic formatter must emit headings in this order:

1. `## 1. ROLE AND EXPERTISE`
2. `## 2. COMPANY CONTEXT`
3. `## 3. OWNER-CONFIRMED DECISIONS`
4. `## 4. WORKING HYPOTHESES`
5. `## 5. RESEARCH QUESTIONS`
6. `## 6. EVIDENCE AND RED-TEAM REQUIREMENTS`
7. `## 7. REQUIRED REPORT STRUCTURE`
8. `## 8. QUALITY CHECK BEFORE SUBMISSION`

The model must not control heading order.

## IR provenance labels

Every material claim in understanding, brief, and prompt pipelines must carry an information-record (IR) provenance label:

| Label | Meaning |
|-------|---------|
| `observed_fact` | Directly supported by uploaded evidence |
| `owner_decision` | Explicitly confirmed or corrected by the owner |
| `working_hypothesis` | Plausible but unproven; must be tested |
| `research_question` | Open question the exported prompt must investigate |
| `restriction` | Claim, compliance, or brand restriction to preserve |
| `important_unknown` | Material gap; do not invent |
| `inference` | Reasonable inference — not a verified fact |

Rejected owner fields must not appear downstream as facts.

## 9/10 quality checklist (gate)

Section 8 must include a checklist. The prompt is export-ready only when **at least 9 of 10** items pass:

1. All eight section headings present in order
2. Company name present and specific
3. Owner-confirmed decisions preserved
4. Disconfirming-evidence / red-team requirement present
5. Competitor classification guidance present
6. Scores demand, business relevance, authority, feasibility, and risk
7. Three content pillars and six **opportunity-shaped** experiments requested
8. Source / citation / evidence-quality requirements present
9. No raw CSV dump, secrets, or runtime developer prompt leakage
10. Restrictions and unknowns remain labeled (not silently dropped)

Failing more than one item → repair failed sections (final compile allows up to **two** repair attempts), then block export if still invalid after post-lint.

## Opportunity-first experiments (section 7)

Keep exactly **3 content pillars × 2 experiments** (6 total). Treat each experiment as a selectable, evidence-backed **content opportunity**, not merely a measurement plan.

**Invariant:** The opportunity comes first. Measurement validates the opportunity; it does not define it.

Per experiment, the exported prompt must require establishing: topic (subject being explored); audience moment (concrete evidence-supported decision situation); tension (observed or explicitly hypothesized; do not infer severity beyond the evidence); planted question (curiosity mechanism created by the tension — not a restatement of topic); viewer reward; evidence basis (what supports the opportunity; observed vs hypothesis); confidence (High/Medium/Low, why that level, and what would materially change it); restrictions (contextual; shared OK — do not force artificial uniqueness); one commercial bridge after value (**or** `none warranted`; a commercial bridge may itself be framed as a testable hypothesis); then success criteria and failure criteria. Do **not** require a second duplicative per-experiment CTA field when both would describe the same post-value action.

**Report-level (distinct jobs):** one primary platform and one strategic CTA / call-to-action hypothesis derived from the research — including none/weak when evidence does not support a conversion path. Report-level CTA must not dictate commercial motion before research earns it.

**Six experiments does not imply six distinct customer problems.** If evidence supports fewer distinct tensions, vary the decision moment, planted question, evidence angle, viewer reward, or comparison frame — do not invent misconceptions to fill slots.

Deterministic lint protects three coarse families inside section 7 (audience/opportunity, viewer-value/provenance, measurement). It must not require magic headings such as `Audience Moment:` or a separate “Content Opportunities” report section. Product still **ends at research-prompt export** — the app does not ingest ChatGPT research results.

## Prompt Contract 1.1 — anchored research controls

Inside sections 6 and 7, require company-instantiated controls (phrase presence alone is insufficient — lint requires distinctive company anchors co-located with each control):

1. **Hypothesis-blind discovery** — neutral scan of this company's category, audience language, search behavior, competitor positioning, and recurring decision problems *before* evaluating supplied hypotheses; no preferential treatment for supplied hypotheses.
2. **Quotation discipline** — direct customer quotes only when the exact words appear in a cited source; otherwise label as a paraphrased language pattern; never manufacture representative quotations.
3. **Evidence hierarchy** — quantity is not quality; many weak commercial sources must not outweigh one strong primary or authoritative source; explain disagreements rather than averaging them.
4. **Demand triangulation** — multi-signal demand (search, recurring questions, marketplace behavior, research/survey evidence, competitor investment, community discussion, commercial intent). A content gap alone is not demand; search volume alone is not business opportunity.
5. **Confidence plus falsifier** — every major conclusion carries High / Medium / Low confidence and states what additional evidence would most likely change it.
6. **Surprising findings** — report up to 3–5 material findings that contradict, complicate, or substantially expand the supplied assumptions. Do not manufacture surprising findings to satisfy a quota. If fewer than three are genuinely supported, report fewer and explain why. Each finding must name the supplied assumption id it affects.

### Schema ceilings (not targets)

- `evidenceAndRedTeamRequirements` max: **9,000**
- `requiredReportStructure` max: **11,000**

Compiler guidance remains qualitative (concise, information-dense). Numeric density bands are calibration telemetry the model never sees.

### Version stamps

These are **different concepts** — do not force one number to mean both:

- `RUNTIME_PROMPT_VERSION` (`rpb-runtime-1.4.0`) = executable model instruction bundle stamped into runtime prompts/traces
- Exported IR `PROMPT_VERSION` / final-research-prompt `schemaVersion` (**1.1.0**) = exported product contract
- Other IR contracts remain schemaVersion **1.0.0**

## Narrative quality (advisory)

Prefer audience-first tension, distinct educational lens, and crisp DoD (pillars, opportunity-shaped experiments, primary platform, report-level CTA hypothesis or none/weak, per-experiment commercial bridge or none warranted, success/failure). See `Reference/concepts/` — advisory only.
