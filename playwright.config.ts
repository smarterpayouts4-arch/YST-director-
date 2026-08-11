import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

// Dedicated port so E2E never collides with a developer's running dev server.
const E2E_PORT = 3100;

/**
 * E2E verifies UI orchestration of the five-stage journey with all model APIs
 * mocked (no real OpenAI calls). CI runs the production server (build first);
 * local runs reuse the dev server when present.
 */
export default defineConfig({
  testDir: "./e2e",
  // Live smoke has its own config (playwright.smoke.config.ts) and must not
  // run under the mocked suite even if SMOKE_LIVE happens to be set.
  testIgnore: ["**/owner-smoke-live.spec.ts"],
  timeout: 60_000,
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://localhost:${E2E_PORT}`,
    trace: "on-first-retry",
    permissions: ["clipboard-read", "clipboard-write"],
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: isCI
      ? `npm run start -- --port ${E2E_PORT}`
      : `npm run dev:fast -- --port ${E2E_PORT}`,
    url: `http://localhost:${E2E_PORT}`,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
