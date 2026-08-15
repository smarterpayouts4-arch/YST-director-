import "server-only";

import { redactDeep } from "@/ai/context/redact";
import { parseStructuredOutput } from "@/ai/structured-output/parse-structured-output";
import { TopicPacketSchema } from "@/features/content-intelligence/contracts/topic-packet";
import { resolveAtomIdentity } from "@/features/content-intelligence/contracts/resolve-atom-identity";
import { projectTopicPacketToYouTubeShortsInput } from "@/features/social-media/youtube-shorts/contracts/project-topic-packet";
import { buildExpandProductionPrompt } from "@/features/social-media/youtube-shorts/prompts/expand-production";
import { SHORTS_PRODUCTION_PROMPT_VERSION } from "@/features/social-media/youtube-shorts/prompts/prompt-version";
import { buildShortsRepairPrompt } from "@/features/social-media/youtube-shorts/prompts/repair-output";
import {
  YouTubeShortsProductionModelSchema,
  YouTubeShortsProductionSchema,
  validateProductionShape,
  type YouTubeShortsProduction,
} from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-production";
import {
  YouTubeShortsStoryboardSchema,
  type YouTubeShortsStoryboard,
} from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-storyboard";
import { getYouTubeShortsModel } from "@/lib/openai";

export async function expandYouTubeShortsProduction(input: {
  packet: unknown;
  approvedStoryboard: unknown;
  projectId?: string;
  artifactId?: string;
  topicPacketId?: string;
  stage?: string;
}): Promise<{
  production: YouTubeShortsProduction;
  promptVersion: string;
  generatedAt: string;
}> {
  if (input.stage !== "storyboard_approved") {
    throw Object.assign(
      new Error("Approve the storyboard before expanding production."),
      { code: "INVALID_INPUT" as const },
    );
  }

  const packetParse = TopicPacketSchema.safeParse(input.packet);
  if (!packetParse.success) {
    throw Object.assign(new Error("Invalid Atom. Shorts cannot expand production."), {
      code: "INVALID_INPUT" as const,
    });
  }
  const packet = packetParse.data;

  if (input.topicPacketId && input.topicPacketId !== packet.topicPacketId) {
    throw Object.assign(new Error("topicPacketId does not match this Atom."), {
      code: "INVALID_INPUT" as const,
    });
  }

  const boardParse = YouTubeShortsStoryboardSchema.safeParse(
    input.approvedStoryboard,
  );
  if (!boardParse.success) {
    throw Object.assign(new Error("Approved storyboard is invalid."), {
      code: "INVALID_INPUT" as const,
    });
  }
  const approvedStoryboard: YouTubeShortsStoryboard = boardParse.data;

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
  const redactedProjection = redactDeep(projection);
  const redactedBoard = redactDeep(approvedStoryboard);
  const prompt = buildExpandProductionPrompt({
    projection: redactedProjection.value as typeof projection,
    approvedStoryboard: redactedBoard.value as YouTubeShortsStoryboard,
  });

  const production = await parseStructuredOutput({
    operation: "expand-shorts-production",
    schemaName: "youtube_shorts_production",
    schema: YouTubeShortsProductionModelSchema,
    instructions: prompt.instructions,
    input: prompt.input,
    primaryPromptVersion: SHORTS_PRODUCTION_PROMPT_VERSION,
    model: getYouTubeShortsModel(),
    repair: { buildPrompt: buildShortsRepairPrompt },
    validate: (value) => validateProductionShape(value as YouTubeShortsProduction),
    projectId: identity.projectId,
    inputSchemaVersion: "1.0.0",
    outputSchemaVersion: "1.0.0",
    charBudgetUsed: prompt.input.length,
    truncationWarningCount: 0,
    meta: {
      redactionCount:
        redactedProjection.redactions.length + redactedBoard.redactions.length,
    },
  });

  const parsed = YouTubeShortsProductionSchema.safeParse(production);
  if (!parsed.success) {
    throw Object.assign(
      new Error("Production expansion did not contain a valid seven-scene board."),
      { code: "MODEL_OUTPUT_INVALID" as const },
    );
  }

  // Narration immutability: production schema has no narration keys; approved board unchanged.
  return {
    production: parsed.data,
    promptVersion: SHORTS_PRODUCTION_PROMPT_VERSION,
    generatedAt: new Date().toISOString(),
  };
}
