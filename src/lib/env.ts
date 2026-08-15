import { z } from "zod";

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().min(1).default("gpt-5.6-terra"),
  /** Topic Engine only (directions + topics). Librarian/RPB keep OPENAI_MODEL. */
  TOPIC_ENGINE_MODEL: z.string().min(1).default("gpt-5.6-sol"),
  /** YouTube Shorts storyboard only. Do not reuse TOPIC_ENGINE_MODEL. */
  YOUTUBE_SHORTS_MODEL: z.string().min(1).default("gpt-5.6-terra"),
  OPENAI_REASONING_EFFORT: z
    .enum(["none", "low", "medium", "high", "xhigh", "max"])
    .default("medium"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Research Prompt Builder"),
  MAX_CSV_BYTES: z.coerce.number().int().positive().default(5_242_880),
  MAX_CSV_ROWS: z.coerce.number().int().positive().default(2500),
  MAX_CSV_COLUMNS: z.coerce.number().int().positive().default(100),
  MAX_SUPPORTING_FILE_BYTES: z.coerce.number().int().positive().default(10_485_760),
  MAX_SUPPORTING_FILES_PER_QUESTION: z.coerce.number().int().positive().default(3),
  OPENAI_TIMEOUT_MS: z.coerce.number().int().positive().default(120_000),
  OPENAI_MAX_RETRIES: z.coerce.number().int().min(0).max(5).default(2),
});

export type AppEnv = z.infer<typeof envSchema>;

let cached: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cached) return cached;
  const parsed = envSchema.safeParse({
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    TOPIC_ENGINE_MODEL: process.env.TOPIC_ENGINE_MODEL,
    YOUTUBE_SHORTS_MODEL: process.env.YOUTUBE_SHORTS_MODEL,
    OPENAI_REASONING_EFFORT: process.env.OPENAI_REASONING_EFFORT,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    MAX_CSV_BYTES: process.env.MAX_CSV_BYTES,
    MAX_CSV_ROWS: process.env.MAX_CSV_ROWS,
    MAX_CSV_COLUMNS: process.env.MAX_CSV_COLUMNS,
    MAX_SUPPORTING_FILE_BYTES: process.env.MAX_SUPPORTING_FILE_BYTES,
    MAX_SUPPORTING_FILES_PER_QUESTION: process.env.MAX_SUPPORTING_FILES_PER_QUESTION,
    OPENAI_TIMEOUT_MS: process.env.OPENAI_TIMEOUT_MS,
    OPENAI_MAX_RETRIES: process.env.OPENAI_MAX_RETRIES,
  });
  if (!parsed.success) {
    throw new Error(`Invalid environment: ${parsed.error.message}`);
  }
  cached = parsed.data;
  return cached;
}

export function requireOpenAIKey(): string {
  const key = getEnv().OPENAI_API_KEY;
  if (!key) {
    throw new Error(
      "OPENAI_API_KEY is missing. Add it to .env.local before analyzing a company.",
    );
  }
  return key;
}
