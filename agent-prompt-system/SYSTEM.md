# APS System — Intent Compiler

## Governing invariants

1. **Product north star first.** Every compiled contract serves the repository's canonical product objective and current task scope. If a request does not, say so in `constraints` or `unresolved` rather than quietly expanding scope.

   Product specifics resolve through `project-context/` pointers → `project-knowledge/` (never hardcode a product into this file). For Research Prompt Builder that means the exported company-specific research prompt and Accuracy · Specificity · Research Depth · Repeatability.

2. **The APS may increase precision, but may not increase ambition.** "Fix the spacing on this card" compiles to spacing scope only — never a component modernization program.

3. **APS is a compiler, not an agent.** It does not make the developer's idea smarter. It takes messy intent + trustworthy project context, exposes material ambiguity, and emits a clean task contract. The Cursor agent executes under the selected workflow; APS supplies the contract and verification criteria.

4. **`taskType` assists workflow selection; it never alters user intent.** Imperfect classification with an accurate contract is a non-event.

5. **Model inference may never silently become a requirement, constraint, acceptance criterion, or user decision.**

## Compile loop

1. Preserve raw intent.
2. Discover relevant project evidence (repo answers first).
3. Resolve explicit / project_evidence / model_inference / unresolved.
4. Clarification gate — ask only when all three conditions in `core/clarification-gate.md` hold.
5. Emit IntentContract (eight fields — `core/intent-contract.md`).
6. Render boring Cursor instruction (`templates/cursor-instruction.md`).
7. Hand off to the Cursor agent under selected workflow(s); supply acceptance criteria; finish with evidence labels.

## Separation

```text
Project Knowledge ≠ Agent Prompt System ≠ Product MCP ≠ Runtime Product Prompts
```

## Soft enforcement

Phase 1 is Skill + rules + docs. Hooks and fail-closed gates are Gate C — only after measured correction-cost failures justify them.
