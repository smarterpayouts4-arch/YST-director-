import { expect, test } from "@playwright/test";
import { makeCompanyUnderstanding } from "../tests/fixtures/api/company-understanding";
import {
  makeInterviewQuestion,
} from "../tests/fixtures/api/interview-question";
import { makeResearchBrief } from "../tests/fixtures/api/research-brief";
import {
  makeFinalPrompt,
  makeFormattedPrompt,
} from "../tests/fixtures/api/final-prompt";

/**
 * Full mocked owner journey:
 * upload CSV → confirm understanding → answer interview → approve brief
 * → generate prompt → copy. All five model APIs are mocked with
 * schema-validated fixtures (see tests/fixtures/api/fixtures.schema.test.ts);
 * no real OpenAI calls are made.
 */
test("owner completes the full journey to an exported research prompt", async ({
  page,
}) => {
  await page.route("**/api/company/understand", async (route) => {
    await route.fulfill({
      json: {
        evidencePacketMeta: {
          fileName: "zynava-company.csv",
          fileHash: "e2e-hash",
          importedAt: new Date().toISOString(),
          rowCount: 12,
          retainedRowCount: 12,
          warnings: [],
          wasTruncated: false,
        },
        companyUnderstanding: makeCompanyUnderstanding(),
        promptVersion: "1.0.0",
      },
    });
  });

  let interviewCalls = 0;
  await page.route("**/api/interview/next", async (route) => {
    interviewCalls += 1;
    if (interviewCalls === 1) {
      await route.fulfill({
        json: { done: false, question: makeInterviewQuestion() },
      });
    } else {
      await route.fulfill({
        json: {
          done: true,
          completionReason: "Required strategic decisions are resolved.",
        },
      });
    }
  });

  await page.route("**/api/research-brief", async (route) => {
    await route.fulfill({ json: { researchBrief: makeResearchBrief() } });
  });

  await page.route("**/api/research-prompt", async (route) => {
    await route.fulfill({
      json: {
        structuredPrompt: makeFinalPrompt(),
        formattedPrompt: makeFormattedPrompt(),
        promptVersion: "1.0.0",
      },
    });
  });

  // Stage 1: ingestion via the bundled sample CSV.
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Upload your company information" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Use sample ZYNAVA CSV" }).click();

  // Stage 2: confirm every material field, then continue.
  await expect(
    page.getByRole("heading", { name: "Confirm what we understood" }),
  ).toBeVisible();
  const confirmButtons = page.getByRole("button", { name: "Confirm", exact: true });
  const count = await confirmButtons.count();
  for (let i = 0; i < count; i += 1) {
    await confirmButtons.nth(i).click();
  }
  const continueButton = page.getByRole("button", { name: "Continue to interview" });
  await expect(continueButton).toBeEnabled();
  await continueButton.click();

  // Stage 3: answer the single mocked interview question.
  await expect(
    page.getByRole("heading", {
      name: "When a customer calls you for the first time, what is usually happening in their home at that exact moment?",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Use this suggestion" }).click();
  await page.getByRole("button", { name: "Save answer & continue" }).click();

  // Stage 4: brief arrives; approve and generate.
  await expect(
    page.getByRole("heading", { name: "Approve the research brief" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Generate research prompt" }).click();

  // Stage 5: exported prompt with all eight contract sections.
  await expect(
    page.getByRole("heading", {
      name: "Bluebird Plumbing Co. — YouTube Strategy Research Prompt",
    }),
  ).toBeVisible();
  const formatted = page.locator("pre");
  await expect(formatted).toContainText("## 1. ROLE AND EXPERTISE");
  await expect(formatted).toContainText("## 8. QUALITY CHECK BEFORE SUBMISSION");
  await expect(formatted).toContainText(
    "Return the completed research output only; do not propose additional workflows.",
  );

  // Copy is the product's terminal action — the workflow stops here.
  await page.getByRole("button", { name: "Copy prompt" }).click();
  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toContain("## 5. RESEARCH QUESTIONS");
});
