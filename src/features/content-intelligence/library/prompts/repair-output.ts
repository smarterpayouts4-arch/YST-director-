import { LIBRARY_RUNTIME_PROMPT_VERSION } from "@/features/content-intelligence/library/prompts/prompt-version";
import type { AiSchemaName } from "@/ai/operations/schema-names";

/** CI-owned repair instructions — do not import RPB repair-output. */
export function buildLibrarianRepairPrompt(input: {
  schemaName: AiSchemaName;
  validationErrors: string[];
  previousOutput: unknown;
}): { instructions: string; input: string; promptVersion: string } {
  const instructions = [
    "Repair the previous structured output so it conforms to the schema and validation errors.",
    "Do not invent new intelligence. Prefer dropping unsupported items or setting null quotes.",
    "Do not change the Librarian task into topic generation or strategy advice.",
    `Prompt version: ${LIBRARY_RUNTIME_PROMPT_VERSION}`,
  ].join("\n");

  const payload = {
    schemaName: input.schemaName,
    validationErrors: input.validationErrors,
    previousOutput: input.previousOutput,
  };

  return {
    instructions,
    input: JSON.stringify(payload, null, 2),
    promptVersion: LIBRARY_RUNTIME_PROMPT_VERSION,
  };
}
