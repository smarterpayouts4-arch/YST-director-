import "server-only";

import { randomUUID } from "node:crypto";
import { redactDeep } from "@/ai/context/redact";
import { parseStructuredOutput } from "@/ai/structured-output/parse-structured-output";
import {
  PublishedLibraryDtoSchema,
  type PublishedLibraryDto,
} from "@/features/content-intelligence/contracts/published-library";
import { buildProposeDirectionsPrompt } from "@/features/content-intelligence/topics/prompts/propose-directions";
import { TOPICS_RUNTIME_PROMPT_VERSION } from "@/features/content-intelligence/topics/prompts/prompt-version";
import { buildTopicsRepairPrompt } from "@/features/content-intelligence/topics/prompts/repair-output";
import { TopicDirectionsDraftSchema } from "@/features/content-intelligence/topics/schemas/direction";
import type { TopicDirection } from "@/features/content-intelligence/topics/schemas/direction";
import {
  formatDirectionGroundingIssueForRepair,
  validateDraftDirectionGrounding,
} from "@/features/content-intelligence/topics/services/topic-grounding";
import { curateDirections } from "@/features/content-intelligence/topics/services/validate-grounding";
import { getTopicEngineModel } from "@/lib/openai";

export type ProposeDirectionsDiagnostics = {
  draftCount: number;
  keptCount: number;
  droppedCount: number;
  /** Capped curator drop reasons (no raw model output). */
  droppedReasons?: string[];
  promptVersion: string;
  model: string;
};

const MAX_DIRECTION_DROP_REASONS = 6;

export async function proposeTopicDirections(input: {
  publishedLibrary: PublishedLibraryDto;
  artifactId: string;
  projectId?: string;
}): Promise<{
  directions: TopicDirection[];
  dropped: string[];
  diagnostics: ProposeDirectionsDiagnostics;
}> {
  const dtoParse = PublishedLibraryDtoSchema.safeParse(input.publishedLibrary);
  if (!dtoParse.success) {
    throw Object.assign(new Error("PublishedLibraryDto is invalid."), {
      code: "INVALID_INPUT" as const,
    });
  }
  const dto = dtoParse.data;
  if (dto.items.length < 1) {
    throw Object.assign(new Error("PublishedLibraryDto has no items."), {
      code: "INVALID_INPUT" as const,
    });
  }
  if (dto.items.some((i) => i.artifactId !== input.artifactId)) {
    throw Object.assign(
      new Error("PublishedLibraryDto does not match the requested artifact."),
      { code: "INVALID_INPUT" as const },
    );
  }

  const redacted = redactDeep({ publishedLibrary: dto });
  const prompt = buildProposeDirectionsPrompt({
    publishedLibrary: redacted.value.publishedLibrary as PublishedLibraryDto,
  });

  const model = getTopicEngineModel();
  const draft = await parseStructuredOutput({
    operation: "propose-topic-directions",
    schemaName: "topic_directions",
    schema: TopicDirectionsDraftSchema,
    instructions: prompt.instructions,
    input: prompt.input,
    primaryPromptVersion: TOPICS_RUNTIME_PROMPT_VERSION,
    model,
    repair: { buildPrompt: buildTopicsRepairPrompt },
    validate: (value) => {
      const issues = validateDraftDirectionGrounding(value.directions, dto);
      return issues.map(formatDirectionGroundingIssueForRepair);
    },
    projectId: input.projectId ?? dto.projectId,
    inputSchemaVersion: "1.0.0",
    outputSchemaVersion: "1.1.0",
    charBudgetUsed: prompt.input.length,
    truncationWarningCount: 0,
    meta: {
      redactionCount: redacted.redactions.length,
    },
  });

  const draftCount = draft.directions.length;
  const curated = curateDirections({
    draft,
    dto,
    idFactory: () => `terr_${randomUUID()}`,
  });

  const diagnostics: ProposeDirectionsDiagnostics = {
    draftCount,
    keptCount: curated.directions.length,
    droppedCount: curated.dropped.length,
    droppedReasons: curated.dropped.slice(0, MAX_DIRECTION_DROP_REASONS),
    promptVersion: TOPICS_RUNTIME_PROMPT_VERSION,
    model,
  };

  if (curated.directions.length < 1) {
    throw Object.assign(
      new Error(
        "No grounded directions could be formed from this intelligence. Return to Librarian or enrich research.",
      ),
      { code: "MODEL_OUTPUT_INVALID" as const, diagnostics },
    );
  }

  return {
    directions: curated.directions,
    dropped: curated.dropped,
    diagnostics,
  };
}
