import { defineConfig, devices } from "@playwright/test";

/** Live smoke config: reuses the owner's already-running `npm run dev` on :3000. */
export default defineConfig({
  testDir: "./e2e",
  testMatch: "owner-smoke-live.spec.ts",
  timeout: 15 * 60_000,
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    permissions: ["clipboard-read", "clipboard-write"],
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
