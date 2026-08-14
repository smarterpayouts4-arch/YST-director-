import "server-only";

import { randomUUID } from "node:crypto";
import { redactDeep } from "@/ai/context/redact";
import { parseStructuredOutput } from "@/ai/structured-output/parse-structured-output";
import {
  PublishedLibraryDtoSchema,
  type PublishedLibraryDto,
} from "@/features/content-intelligence/contracts/published-library";
import { buildProposeTopicsPrompt } from "@/features/content-intelligence/topics/prompts/propose-topics";
import { TOPICS_RUNTIME_PROMPT_VERSION } from "@/features/content-intelligence/topics/prompts/prompt-version";
import { buildTopicsRepairPrompt } from "@/features/content-intelligence/topics/prompts/repair-output";
import {
  TopicDirectionSchema,
  type TopicDirection,
} from "@/features/content-intelligence/topics/schemas/direction";
import { TopicOpportunitiesDraftSchema } from "@/features/content-intelligence/topics/schemas/topic-opportunity";
import type { TopicOpportunity } from "@/features/content-intelligence/topics/schemas/topic-opportunity";
import {
  formatGroundingIssueForRepair,
  MAX_TOPIC_GROUNDING_DIAGNOSTICS,
  validateDraftTopicGrounding,
} from "@/features/content-intelligence/topics/services/topic-grounding";
import { curateTopics } from "@/features/content-intelligence/topics/services/validate-grounding";
import { getTopicEngineModel } from "@/lib/openai";

export async function proposeTopicOpportunities(input: {
  publishedLibrary: PublishedLibraryDto;
  direction: TopicDirection;
  artifactId: string;
  projectId?: string;
}): Promise<{ topics: TopicOpportunity[]; dropped: string[] }> {
  const dtoParse = PublishedLibraryDtoSchema.safeParse(input.publishedLibrary);
  const dirParse = TopicDirectionSchema.safeParse(input.direction);
  if (!dtoParse.success || !dirParse.success) {
    throw Object.assign(new Error("Invalid Topic Engine input."), {
      code: "INVALID_INPUT" as const,
    });
  }
  const dto = dtoParse.data;
  const direction = dirParse.data;

  if (dto.items.some((i) => i.artifactId !== input.artifactId)) {
    throw Object.assign(
      new Error("PublishedLibraryDto does not match the requested artifact."),
      { code: "INVALID_INPUT" as const },
    );
  }

  const redacted = redactDeep({ publishedLibrary: dto, direction });
  const prompt = buildProposeTopicsPrompt({
    publishedLibrary: redacted.value.publishedLibrary as PublishedLibraryDto,
    direction: redacted.value.direction as TopicDirection,
  });

  const draft = await parseStructuredOutput({
    operation: "propose-topic-opportunities",
    schemaName: "topic_opportunities",
    schema: TopicOpportunitiesDraftSchema,
    instructions: prompt.instructions,
    input: prompt.input,
    primaryPromptVersion: TOPICS_RUNTIME_PROMPT_VERSION,
    model: getTopicEngineModel(),
    repair: { buildPrompt: buildTopicsRepairPrompt },
    validate: (value) => {
      const issues = validateDraftTopicGrounding(value.topics, dto);
      return issues.map(formatGroundingIssueForRepair);
    },
    projectId: input.projectId ?? dto.projectId,
    inputSchemaVersion: "1.0.0",
    outputSchemaVersion: "1.0.0",
    charBudgetUsed: prompt.input.length,
    truncationWarningCount: 0,
    meta: { redactionCount: redacted.redactions.length },
  });

  const curated = curateTopics({
    draft,
    dto,
    territoryId: direction.territoryId,
    idFactory: () => `topic_${randomUUID()}`,
  });

  if (curated.topics.length !== 6) {
    const detail = curated.dropped
      .slice(0, MAX_TOPIC_GROUNDING_DIAGNOSTICS)
      .join(" · ");
    throw Object.assign(
      new Error(
        [
          `Expected 6 grounded topics; got ${curated.topics.length}.`,
          detail || "Try again or pick another direction.",
        ]
          .filter(Boolean)
          .join(" "),
      ),
      { code: "MODEL_OUTPUT_INVALID" as const, dropped: curated.dropped },
    );
  }

  return curated;
}
