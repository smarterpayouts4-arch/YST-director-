# AI Control — operation map

Pointer table only. Executable truth: [`operations/registry.ts`](operations/registry.ts) (`AiOperationId` derived from registry keys) + doctor/tests. Product meaning: `project-knowledge/`. Generated [`runtime-prompts.json`](../../project-knowledge/generated/maps/runtime-prompts.json) is documentation-only inventory — not a second ops registry.

UI/client helpers may share deterministic helpers for UX; **server services authorize** important transitions (e.g. `canCompleteInterview` on interview next + brief build).

| Operation | Service | Context | Prompt | Schema | Eval |
|-----------|---------|---------|--------|--------|------|
| `analyze-company` | [`analyze-company.ts`](../features/research-prompt-builder/services/analyze-company.ts) | [`assemble-company-analysis-context`](context/assemble-company-analysis-context.ts) | [`company-analyst.ts`](../features/research-prompt-builder/prompts/company-analyst.ts) | `company_understanding` | [`company-analyst-contract.test.ts`](../../tests/evals/company-analyst-contract.test.ts) |
| `generate-next-question` | [`generate-next-question.ts`](../features/research-prompt-builder/services/generate-next-question.ts) | [`assemble-interview-context`](context/assemble-interview-context.ts) | [`next-question.ts`](../features/research-prompt-builder/prompts/next-question.ts) | `next_interview_question` | [`next-question-contract.test.ts`](../../tests/evals/next-question-contract.test.ts) |
| `extract-supporting-context` | [`extract-supporting-context.ts`](../features/research-prompt-builder/services/extract-supporting-context.ts) | none | [`supporting-context.ts`](../features/research-prompt-builder/prompts/supporting-context.ts) | `supporting_context` | [`supporting-context-contract.test.ts`](../../tests/evals/supporting-context-contract.test.ts) |
| `build-research-brief` | [`build-research-brief.ts`](../features/research-prompt-builder/services/build-research-brief.ts) | [`assemble-brief-context`](context/assemble-brief-context.ts) | [`research-brief.ts`](../features/research-prompt-builder/prompts/research-brief.ts) | `research_brief` | [`research-brief-contract.test.ts`](../../tests/evals/research-brief-contract.test.ts) |
| `compile-research-prompt` | [`generate-research-prompt.ts`](../features/research-prompt-builder/services/generate-research-prompt.ts) | [`assemble-prompt-context`](context/assemble-prompt-context.ts) | [`research-prompt.ts`](../features/research-prompt-builder/prompts/research-prompt.ts) | `final_research_prompt` | [`prompt-contract.eval.test.ts`](../../tests/evals/prompt-contract.eval.test.ts) |
| `extract-content-intelligence` | [`extract-content-intelligence.ts`](../features/content-intelligence/library/services/extract-content-intelligence.ts) | none | [`extract-content-intelligence.ts`](../features/content-intelligence/library/prompts/extract-content-intelligence.ts) | `content_intelligence_extract` | [`content-intelligence-contract.test.ts`](../../tests/evals/content-intelligence-contract.test.ts) |
| `repair-invalid-output` (nested) | Shared gateway + RPB repair adapter | — | [`repair-output.ts`](../features/research-prompt-builder/prompts/repair-output.ts) | parent schema | [`repair-output-contract.test.ts`](../../tests/evals/repair-output-contract.test.ts) |

**Structured output gateway (feature-neutral):** [`structured-output/parse-structured-output.ts`](structured-output/parse-structured-output.ts) — OpenAI parse, traces, optional repair transport. Features inject `primaryPromptVersion` + optional repair builder.  
**RPB adapter:** [`structured-openai.ts`](../features/research-prompt-builder/services/structured-openai.ts) — RPB version + RPB repair only. Content Intelligence must not import the RPB adapter.

Repair policy: [`operations/repair-policy.ts`](operations/repair-policy.ts). Model config: [`../lib/openai.ts`](../lib/openai.ts) + env (no parallel model-policy module).
