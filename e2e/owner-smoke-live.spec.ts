import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/**
 * Live owner smoke test — hits real OpenAI APIs (no route mocks).
 * Run against an already-running `npm run dev` on :3000:
 *
 *   $env:SMOKE_LIVE=1; npx playwright test e2e/owner-smoke-live.spec.ts --config=playwright.smoke.config.ts
 */
test.setTimeout(15 * 60_000);

test("owner smoke: ZYNAVA sample through export", async ({ page, context }) => {
  test.skip(!process.env.SMOKE_LIVE, "Set SMOKE_LIVE=1 to run the live owner smoke test.");

  const evidenceDir = path.join("docs", "audits", "artifacts");
  fs.mkdirSync(evidenceDir, { recursive: true });
  const startedAt = Date.now();
  const timings: Record<string, number> = {};
  const notes: string[] = [];
  const questions: string[] = [];
  let mark = Date.now();

  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("http://localhost:3000/");
  await expect(
    page.getByRole("heading", { name: "Upload your company information" }),
  ).toBeVisible();

  // Stage 1 — sample CSV + analysis
  mark = Date.now();
  await page.getByRole("button", { name: "Use sample ZYNAVA CSV" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Confirm the facts",
    }),
  ).toBeVisible({ timeout: 180_000 });
  timings.analyzeCompanyMs = Date.now() - mark;

  const understandingSummary = await page
    .locator("p")
    .filter({ hasText: /ZYNAVA|supplement|Review what we found/i })
    .first()
    .innerText()
    .catch(() => "(summary not captured)");

  // Stage 2 — sequential Looks right through five strategy sections.
  const continueBtn = page.getByRole("button", {
    name: "Everything looks right. Continue",
  });
  await expect(page.getByTestId("profile-progress")).toHaveText(
    "0 of 5 reviewed",
  );
  for (let i = 0; i < 5; i += 1) {
    const openTopic = page.locator(
      '[data-testid="profile-topic"][data-state="open"]',
    );
    await expect(openTopic).toHaveCount(1);
    await page.getByRole("button", { name: "Looks right", exact: true }).click();
  }
  await expect(page.getByTestId("profile-progress")).toHaveText(
    "5 of 5 reviewed",
  );
  await expect(continueBtn).toBeEnabled({ timeout: 10_000 });

  mark = Date.now();
  await continueBtn.click();

  // Stage 3 — answer up to 7 interview questions (or until brief)
  for (let q = 0; q < 7; q += 1) {
    const briefHeading = page.getByRole("heading", {
      name: "Approve the research brief",
    });
    const saveAnswer = page.getByRole("button", { name: "Save answer & continue" });
    const buildBrief = page.getByRole("button", { name: "Build research brief" });

    await Promise.race([
      briefHeading.waitFor({ state: "visible", timeout: 180_000 }).catch(() => null),
      saveAnswer.waitFor({ state: "visible", timeout: 180_000 }).catch(() => null),
      buildBrief.waitFor({ state: "visible", timeout: 180_000 }).catch(() => null),
    ]);

    if (await briefHeading.isVisible().catch(() => false)) {
      timings[`interviewToBriefMs_after_q${q}`] = Date.now() - mark;
      break;
    }

    // Recoverable path: interview API failed but UI offers manual brief build.
    if (await buildBrief.isVisible().catch(() => false)) {
      const err =
        (await page.locator("p.text-red-700, p[role='alert'], main p").allInnerTexts())
          .join("\n")
          .slice(0, 800) || "interview failed without visible question";
      // Prefer recovering into brief generation for smoke evidence rather than hanging.
      notes.push(`interview_error_then_build_brief: ${err}`);
      await buildBrief.click();
      await briefHeading.waitFor({ state: "visible", timeout: 180_000 });
      timings.interviewRecoveredViaBuildBriefMs = Date.now() - mark;
      break;
    }

    if (!(await saveAnswer.isVisible().catch(() => false))) {
      throw new Error(
        `Neither question, brief, nor build-brief appeared after question ${q}. Body: ${(await page.locator("main").innerText()).slice(0, 600)}`,
      );
    }

    const qText = (await page.locator("h1").first().innerText()).trim();
    questions.push(qText);

    // Optional supporting doc on first question only
    if (q === 0) {
      const supportPath = path.resolve("tmp-smoke-support.txt");
      if (fs.existsSync(supportPath)) {
        const fileInput = page.locator('input[type="file"]').last();
        await fileInput.setInputFiles(supportPath).catch(() => null);
        // Wait briefly for extraction; ignore failure and continue
        await page.waitForTimeout(8_000);
      }
    }

    await page.getByRole("button", { name: "Save answer & continue" }).click();
  }

  await expect(
    page.getByRole("heading", { name: "Approve the research brief" }),
  ).toBeVisible({ timeout: 180_000 });
  if (!timings.interviewToBriefMs_after_q0) {
    timings.interviewCompleteMs = Date.now() - mark;
  }

  // Light owner edit on brief
  const companyTruth = page.locator("textarea").first();
  const currentTruth = await companyTruth.inputValue();
  await companyTruth.fill(`${currentTruth} Owner note: prioritize comparison education.`);

  mark = Date.now();
  await page.getByRole("button", { name: "Generate research prompt" }).click();
  await expect(page.locator("pre")).toBeVisible({ timeout: 240_000 });
  timings.generatePromptMs = Date.now() - mark;

  const title = await page.locator("h1").first().innerText();
  const formatted = await page.locator("pre").innerText();
  const metaLine = await page
    .locator("p")
    .filter({ hasText: /Generated|Prompt|Profile/i })
    .first()
    .innerText()
    .catch(() => "");

  await page.getByRole("button", { name: "Copy prompt" }).click();
  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toContain("## 1. ROLE AND EXPERTISE");

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download Markdown" }).click(),
  ]);
  const downloadPath = path.join(evidenceDir, await download.suggestedFilename());
  await download.saveAs(downloadPath);

  // Refresh / restore
  await page.reload();
  await expect(page.locator("pre")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/Project: zynava-company.csv/i)).toBeVisible();

  // Reset
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(
    page.getByRole("heading", { name: "Upload your company information" }),
  ).toBeVisible();

  const evidence = {
    smokeId: "OWNER_SMOKE_TEST_01",
    startedAt: new Date(startedAt).toISOString(),
    finishedAt: new Date().toISOString(),
    totalMs: Date.now() - startedAt,
    model: "gpt-5.6-terra",
    companyFixture: "public/samples/zynava-company.csv",
    understandingSummary,
    questions,
    questionCount: questions.length,
    notes,
    title,
    metaLine,
    timings,
    downloadPath,
    clipboardChars: clipboard.length,
    formattedPrompt: formatted,
    checks: {
      copyWorked: clipboard.includes("## 5. RESEARCH QUESTIONS"),
      downloadSaved: fs.existsSync(downloadPath),
      hasStopLine: /return the completed research output only/i.test(formatted),
      hasCompetitor: /competitor/i.test(formatted),
      hasRedTeam: /disconfirm|red-?team|contradict/i.test(formatted),
      hasPillars: /3 content pillars|three content pillars/i.test(formatted),
    },
  };

  fs.writeFileSync(
    path.join(evidenceDir, "owner-smoke-01.json"),
    JSON.stringify(evidence, null, 2),
    "utf8",
  );
  fs.writeFileSync(
    path.join(evidenceDir, "owner-smoke-01-prompt.md"),
    formatted,
    "utf8",
  );
});
