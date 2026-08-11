# Stage flow decision (Step 7) — deferred

**Decision: keep the five-stage flow for now.**

Collapse of the interview into a conditional step and demotion of the brief page to an export-summary are **blocked** until calibration measurement shows most archetypes need zero or one question after Page 3 strategic directions.

Reasons to wait:

1. Interview answers still reach the export only through the brief (`assemblePromptContext` takes profile + brief).
2. Per-field `fieldProvenance` just landed; collapsing before measuring provenance correctness would hide bias.
3. Canon amendment for evidence-satisfiable CORE is proposed in `INTERVIEW_CORE_EVIDENCE_AMENDMENT.md` and not yet human-approved into `FEATURES/interview.md`.
4. `.cursor/rules/no-code-debt.mdc` forbids a parallel brief renderer on the export screen while the full brief page still exists.

When measurement justifies collapse: one change that deletes the brief page, adds the export summary, migrates storage, and updates canon — not a flag-gated dual path.
