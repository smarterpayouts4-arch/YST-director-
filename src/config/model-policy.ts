import { getEnv } from "@/lib/env";

export type ModelPolicy = {
  model: string;
  reasoningEffort: string;
  timeoutMs: number;
  maxRetries: number;
  storeCompletions: false;
};

export function getModelPolicy(): ModelPolicy {
  const env = getEnv();
  return {
    model: env.OPENAI_MODEL,
    reasoningEffort: env.OPENAI_REASONING_EFFORT,
    timeoutMs: env.OPENAI_TIMEOUT_MS,
    maxRetries: env.OPENAI_MAX_RETRIES,
    storeCompletions: false,
  };
}
