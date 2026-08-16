import "server-only";

import { redactDeep } from "@/ai/context/redact";
import { parseStructuredOutput } from "@/ai/structured-output/parse-structured-output";
import { TopicPacketSchema } from "@/features/content-intelligence/contracts/topic-packet";
import { resolveAtomIdentity } from "@/features/content-intelligence/contracts/resolve-atom-identity";
import { projectTopicPacketToYouTubeShortsInput } from "@/features/social-media/youtube-shorts/contracts/project-topic-packet";
import { buildGenerateStoryboardPrompt } from "@/features/social-media/youtube-shorts/prompts/generate-storyboard";
import { SHORTS_RUNTIME_PROMPT_VERSION } from "@/features/social-media/youtube-shorts/prompts/prompt-version";
import { buildShortsRepairPrompt } from "@/features/social-media/youtube-shorts/prompts/repair-output";
import {
  YouTubeShortsStoryboardModelSchema,
  YouTubeShortsStoryboardSchema,
  validateGeneratedStoryboard,
  type YouTubeShortsStoryboard,
} from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-storyboard";
import { getYouTubeShortsModel } from "@/lib/openai";

export async function generateYouTubeShortsStoryboard(input: {
  packet: unknown;
  projectId?: string;
  artifactId?: string;
  topicPacketId?: string;
}): Promise<{
  storyboard: YouTubeShortsStoryboard;
  promptVersion: string;
}> {
  const packetParse = TopicPacketSchema.safeParse(input.packet);
  if (!packetParse.success) {
    throw Object.assign(new Error("Invalid Atom. Shorts cannot generate a storyboard."), {
      code: "INVALID_INPUT" as const,
    });
  }
  const packet = packetParse.data;

  if (input.topicPacketId && input.topicPacketId !== packet.topicPacketId) {
    throw Object.assign(new Error("topicPacketId does not match this Atom."), {
      code: "INVALID_INPUT" as const,
    });
  }

  const identity = resolveAtomIdentity({
    packet,
    queryProjectId: input.projectId,
    queryArtifactId: input.artifactId,
  });
  if (!identity.ok) {
    throw Object.assign(
      new Error(
        identity.reason === "missing_projectId"
          ? "This Atom is missing a project id."
          : "Atom identity does not match this Shorts request.",
      ),
      { code: "INVALID_INPUT" as const },
    );
  }

  const projection = projectTopicPacketToYouTubeShortsInput(packet);
  const redacted = redactDeep(projection);
  const prompt = buildGenerateStoryboardPrompt({
    projection: redacted.value as typeof projection,
  });

  const storyboard = await parseStructuredOutput({
    operation: "generate-shorts-storyboard",
    schemaName: "youtube_shorts_storyboard",
    schema: YouTubeShortsStoryboardModelSchema,
    instructions: prompt.instructions,
    input: prompt.input,
    primaryPromptVersion: SHORTS_RUNTIME_PROMPT_VERSION,
    model: getYouTubeShortsModel(),
    repair: {
      buildPrompt: buildShortsRepairPrompt,
      context: { projection: redacted.value },
    },
    validate: (value) =>
      validateGeneratedStoryboard(value, {
        tension: packet.tension,
        desiredTakeaway: packet.desiredTakeaway,
        decisionQuestion: packet.decisionQuestion,
        premise: packet.premise,
        whyItMatters: packet.whyItMatters,
        opportunity: packet.opportunity,
        supportingInsights: packet.supportingInsights,
        evidenceQuotes: packet.evidenceQuotes,
      }),
    projectId: identity.projectId,
    inputSchemaVersion: "1.0.0",
    outputSchemaVersion: "1.0.0",
    charBudgetUsed: prompt.input.length,
    truncationWarningCount: 0,
    meta: { redactionCount: redacted.redactions.length },
  });

  const parsed = YouTubeShortsStoryboardSchema.safeParse(storyboard);
  if (!parsed.success) {
    throw Object.assign(new Error("Storyboard did not contain exactly 7 numbered scenes."), {
      code: "MODEL_OUTPUT_INVALID" as const,
    });
  }

  return {
    storyboard: parsed.data,
    promptVersion: SHORTS_RUNTIME_PROMPT_VERSION,
  };
}
