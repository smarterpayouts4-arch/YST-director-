import "server-only";

import OpenAI from "openai";
import { getEnv, requireOpenAIKey } from "@/lib/env";

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (client) return client;
  const env = getEnv();
  client = new OpenAI({
    apiKey: requireOpenAIKey(),
    timeout: env.OPENAI_TIMEOUT_MS,
    maxRetries: env.OPENAI_MAX_RETRIES,
  });
  return client;
}

export function getOpenAIModel(): string {
  return getEnv().OPENAI_MODEL;
}

/** Topic Engine directions + topics only. Does not affect Librarian/RPB. */
export function getTopicEngineModel(): string {
  return getEnv().TOPIC_ENGINE_MODEL;
}

export function getReasoningEffort(): string {
  return getEnv().OPENAI_REASONING_EFFORT;
}
