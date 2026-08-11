import "server-only";

import { z } from "zod";
import {
  parseStructuredOutput as parseStructuredOutputShared,
  type ParseStructuredOutputArgs,
} from "@/ai/structured-output/parse-structured-output";
import { buildRepairPrompt } from "@/features/research-prompt-builder/prompts/repair-output";
import type { CompanyAnchors } from "@/features/research-prompt-builder/lib/company-anchors";
import { RUNTIME_PROMPT_VERSION } from "@/features/research-prompt-builder/prompts/prompt-version";

/**
 * RPB adapter over the shared structured-output gateway.
 * Injects RPB prompt version + RPB repair builder (anchors / prompt-contract).
 * Content Intelligence must call the shared gateway directly — not this file.
 */

type RpbParseArgs<T extends z.ZodTypeAny> = Omit<
  ParseStructuredOutputArgs<T>,
  "primaryPromptVersion" | "repair"
> & {
  anchors?: CompanyAnchors;
};

export async function parseStructuredOutput<T extends z.ZodTypeAny>(
  args: RpbParseArgs<T>,
): Promise<z.infer<T>> {
  const { anchors, ...rest } = args;
  return parseStructuredOutputShared({
    ...rest,
    primaryPromptVersion: RUNTIME_PROMPT_VERSION,
    repair: {
      buildPrompt: ({ schemaName, validationErrors, previousOutput, context }) =>
        buildRepairPrompt({
          schemaName,
          validationErrors,
          previousOutput,
          anchors: context as CompanyAnchors | undefined,
        }),
      context: anchors,
    },
  });
}
