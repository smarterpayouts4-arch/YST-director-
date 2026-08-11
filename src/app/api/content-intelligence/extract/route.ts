import { extractContentIntelligence } from "@/features/content-intelligence/library/services/extract-content-intelligence";
import { toCiApiError } from "@/features/content-intelligence/library/services/api-error";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await extractContentIntelligence({
      researchText: body.researchText,
      artifactId: body.artifactId,
      projectId: body.projectId,
    });
    return Response.json(result);
  } catch (error) {
    if (
      typeof error === "object" &&
      error &&
      "name" in error &&
      (error as { name?: string }).name === "ZodError"
    ) {
      return toCiApiError(
        Object.assign(new Error("Invalid extract request."), {
          code: "INVALID_INPUT" as const,
        }),
        "INVALID_INPUT",
      );
    }
    return toCiApiError(error, "OPENAI_ERROR");
  }
}
