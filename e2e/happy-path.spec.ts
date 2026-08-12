import { expect, test } from "@playwright/test";
import { makeCompanyUnderstanding } from "../tests/fixtures/api/company-understanding";
import {
  makeInterviewQuestion,
  makeStrategicDirectionQuestion,
} from "../tests/fixtures/api/interview-question";
import { makeResearchBrief } from "../tests/fixtures/api/research-brief";
import {
  makeFinalPrompt,
  makeFormattedPrompt,
} from "../tests/fixtures/api/final-prompt";

/**
 * Full mocked owner journey:
 * upload CSV → sequential profile review → answer interview → approve brief
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
          rowCount: 14,
          retainedRowCount: 14,
          warnings: [],
          wasTruncated: false,
        },
        companyUnderstanding: makeCompanyUnderstanding(),
        promptVersion: "1.0.0",
      },
    });
  });

  await page.route("**/api/interview/next", async (route) => {
    const body = route.request().postDataJSON() as {
      previousQuestions?: unknown[];
    };
    const priorCount = Array.isArray(body.previousQuestions)
      ? body.previousQuestions.length
      : 0;
    // Length-based (not call-count) so Change → re-save regenerates Q2 correctly.
    // Must cover remaining cores (viewer_reward, business_bridge) before done —
    // client canCompleteInterview rejects early completion.
    if (priorCount === 0) {
      await route.fulfill({
        json: { done: false, question: makeStrategicDirectionQuestion() },
      });
    } else if (priorCount === 1) {
      await route.fulfill({
        json: {
          done: false,
          question: makeInterviewQuestion({
            questionId: "q2",
            sequenceNumber: 2,
            questionKind: "standard",
            decisionCategory: "customer_moment",
          }),
        },
      });
    } else if (priorCount === 2) {
      await route.fulfill({
        json: {
          done: false,
          question: makeInterviewQuestion({
            questionId: "q3",
            sequenceNumber: 3,
            questionKind: "standard",
            decisionCategory: "viewer_reward",
            question:
              "What should a viewer walk away able to do after one short piece of content?",
            suggestedAnswer:
              "Compare two common supplement forms with one plain checklist and leave with a safer next click.",
            whyThisMatters:
              "Viewer reward decides whether the research prompt optimizes for clarity or entertainment.",
            resolvesBriefFields: ["viewerReward"],
          }),
        },
      });
    } else if (priorCount === 3) {
      await route.fulfill({
        json: {
          done: false,
          question: makeInterviewQuestion({
            questionId: "q4",
            sequenceNumber: 4,
            questionKind: "standard",
            decisionCategory: "business_bridge",
            question:
              "How should helpful content connect to a legitimate next business step without feeling like a hard sell?",
            suggestedAnswer:
              "End with a soft bridge: invite the viewer to a comparison guide or product page only after the checklist helps them decide.",
            whyThisMatters:
              "Business bridge keeps research honest about conversion without inventing medical claims.",
            resolvesBriefFields: ["businessBridge"],
          }),
        },
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

  // Stage 2: sequential strategy confirmation — five sections.
  await expect(
    page.getByRole("heading", {
      name: "Here’s what we understand",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Who we’re helping").first(),
  ).toBeVisible();
  await expect(page.getByText(/US adult shoppers researching supplements/i)).toBeVisible();

  // Old technical UI / 10-topic census must be gone.
  await expect(page.getByText("Total fields")).toHaveCount(0);
  await expect(page.getByText("Rejected")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Confirm category" }),
  ).toHaveCount(0);
  await expect(page.getByRole("option", { name: "Needs review" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "That’s correct", exact: true })).toHaveCount(0);
  await expect(page.getByTestId("profile-progress")).toHaveText("0 of 5 reviewed");

  const topics = page.getByTestId("profile-topic");
  await expect(topics).toHaveCount(5);
  await expect(topics.first()).toHaveAttribute("data-state", "open");
  await expect(topics.first()).toHaveAttribute("data-topic-id", "who_we_help");
  await expect(
    page.getByRole("button", { name: "Looks right", exact: true }),
  ).toHaveCount(1);

  // Continue stays hidden until all five sections are reviewed.
  const continueButton = page.getByRole("button", {
    name: "Everything looks right. Continue",
  });
  await expect(continueButton).toHaveCount(0);
  for (let i = 0; i < 5; i += 1) {
    const openTopic = page.locator('[data-testid="profile-topic"][data-state="open"]');
    await expect(openTopic).toHaveCount(1);
    const openId = await openTopic.getAttribute("data-topic-id");
    if (openId === "company_and_offer") {
      await expect(page.getByText("ZYNAVA").first()).toBeVisible();
    }
    if (openId === "limits_and_notes") {
      await expect(page.getByText("Optional notes")).toBeVisible();
    }
    await page.getByRole("button", { name: "Looks right", exact: true }).click();
  }
  await expect(page.getByTestId("profile-progress")).toHaveText("5 of 5 reviewed");
  await expect(continueButton).toBeVisible();
  await continueButton.click();

  // Stage 3a: strategic direction cards (still Decide — same workspace).
  await expect(page.getByText("Decide", { exact: true }).first()).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Which strategic directions should the research investigate for this business?",
    }),
  ).toBeVisible();
  await expect(page.getByText("Why this may fit.")).toHaveCount(3);
  await expect(page.getByText("Research should test.")).toHaveCount(3);
  await page.getByRole("button", { name: "Explore all" }).click();
  await page.getByRole("button", { name: "Save answer & continue" }).click();

  // Stage 3b: next decision on the same Decide screen with a trail back to Q1.
  await expect(page.getByLabel("Decisions so far")).toBeVisible();
  await expect(page.getByRole("button", { name: "Change" })).toBeVisible();
  await expect(page.getByText("Next decision")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Which shopper decision should ZYNAVA intercept first: choosing between forms of the same supplement before purchase?",
    }),
  ).toBeVisible();

  // Change returns to strategic cards without leaving Decide; later turn is dropped.
  await page.getByRole("button", { name: "Change" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Which strategic directions should the research investigate for this business?",
    }),
  ).toBeVisible();
  await expect(page.getByLabel("Decisions so far")).toHaveCount(0);
  await page.getByRole("button", { name: "Explore all" }).click();
  await page.getByRole("button", { name: "Save answer & continue" }).click();

  await expect(
    page.getByRole("heading", {
      name: "Which shopper decision should ZYNAVA intercept first: choosing between forms of the same supplement before purchase?",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Save answer & continue" }).click();

  // Remaining cores required by canCompleteInterview before brief.
  await expect(
    page.getByRole("heading", {
      name: "What should a viewer walk away able to do after one short piece of content?",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Save answer & continue" }).click();

  await expect(
    page.getByRole("heading", {
      name: "How should helpful content connect to a legitimate next business step without feeling like a hard sell?",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Save answer & continue" }).click();

  // Stage 4: brief arrives; approve and generate.
  await expect(
    page.getByRole("heading", { name: "Approve the research brief" }),
  ).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: "Generate research prompt" }).click();

  // Stage 5: transformation payoff, then full prompt behind View full prompt.
  await expect(
    page.getByRole("heading", { name: "Your research assignment is ready" }),
  ).toBeVisible();
  await expect(page.getByText("Built from")).toBeVisible();
  await expect(page.getByText("It will investigate")).toBeVisible();
  await page.getByRole("button", { name: "View full prompt" }).click();
  const formatted = page.locator("pre");
  await expect(formatted).toContainText("EXECUTE THIS RESEARCH NOW.");
  await expect(formatted).toContainText("## 1. ROLE AND EXPERTISE");
  await expect(formatted).toContainText("## 8. QUALITY CHECK BEFORE SUBMISSION");
  await expect(formatted).toContainText("Return the completed research output only.");
  await expect(formatted).toContainText("Do not ask follow-up questions.");

  await page.getByRole("button", { name: "Copy research prompt" }).click();
  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard.startsWith("EXECUTE THIS RESEARCH NOW.")).toBe(true);
  expect(clipboard).toContain("## 5. RESEARCH QUESTIONS");
  expect(clipboard).not.toMatch(/48,?000/);
});
