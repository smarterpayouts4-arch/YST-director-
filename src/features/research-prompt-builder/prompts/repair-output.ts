export function buildRepairPrompt(input: {
  schemaName: string;
  validationErrors: string[];
  previousOutput: unknown;
}) {
  return {
    instructions:
      "Repair the previous structured output so it satisfies the schema and validation errors. Return only the corrected object.",
    input: JSON.stringify(
      {
        schemaName: input.schemaName,
        validationErrors: input.validationErrors,
        previousOutput: input.previousOutput,
      },
      null,
      2,
    ),
  };
}
