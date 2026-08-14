import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonRequest, codedError } from "./helpers";

vi.mock(
  "@/features/content-intelligence/library/services/extract-content-intelligence",
  () => ({ extractContentIntelligence: vi.fn() }),
);

import { POST } from "@/app/api/content-intelligence/extract/route";
import { extractContentIntelligence } from "@/features/content-intelligence/library/services/extract-content-intelligence";

const mockedExtract = vi.mocked(extractContentIntelligence);

beforeEach(() => {
  mockedExtract.mockReset();
});

describe("POST /api/content-intelligence/extract", () => {
  it("returns extraction run and curated items", async () => {
    mockedExtract.mockResolvedValue({
      extractionRun: {
        runId: "run_1",
        artifactId: "art_1",
        operationId: "extract-content-intelligence",
        model: "gpt-test",
        promptVersion: "ci-librarian-1.0.0",
        extractedAt: "2026-08-11T12:00:00.000Z",
        validationResult: {
          ok: true,
          issues: [],
          itemCount: 1,
          quoteMismatchCount: 0,
        },
      },
      items: [
        {
          itemId: "item_1",
          artifactId: "art_1",
          extractionRunId: "run_1",
          kind: "fact",
          statement: "A fact",
          provenance: "Body",
          origin: "extracted",
          reviewStatus: "accepted",
          confidence: "medium",
          evidenceQuote: "A fact",
          quoteCleared: false,
          sourceRefs: [],
          tags: [],
          isHypothesis: false,
          capturedAt: "2026-08-11T12:00:00.000Z",
        },
      ],
    });

    const res = await POST(
      jsonRequest({
        researchText: "Research body",
        artifactId: "art_1",
        projectId: "proj_1",
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.extractionRun.runId).toBe("run_1");
    expect(body.items).toHaveLength(1);
  });

  it("maps model invalid to 400", async () => {
    mockedExtract.mockRejectedValue(
      codedError("Structured output failed validation.", "MODEL_OUTPUT_INVALID"),
    );
    const res = await POST(
      jsonRequest({ researchText: "x", artifactId: "art_1" }),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("MODEL_OUTPUT_INVALID");
  });
});
