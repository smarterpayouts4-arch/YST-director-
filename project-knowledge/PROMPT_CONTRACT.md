# PROMPT_CONTRACT — Exported Research Prompt

Canonical contract for the **exported** ChatGPT research prompt. Runtime developer prompts are separate (`src/features/research-prompt-builder/prompts/`).

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
7. Three content pillars and six experiments requested
8. Source / citation / evidence-quality requirements present
9. No raw CSV dump, secrets, or runtime developer prompt leakage
10. Restrictions and unknowns remain labeled (not silently dropped)

Failing more than one item → repair failed sections once, then block export if still invalid.

## Narrative quality (advisory)

Prefer audience-first tension, distinct educational lens, and crisp DoD (pillars, experiments, platform, CTA, success/failure). See `Reference/concepts/` — advisory only.
