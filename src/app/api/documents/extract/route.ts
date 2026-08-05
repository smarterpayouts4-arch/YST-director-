import { extractSupportingContext } from "@/features/research-prompt-builder/services/extract-supporting-context";
import { toApiError } from "@/features/research-prompt-builder/services/api-error";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const questionId = String(form.get("questionId") ?? "");
    const question = String(form.get("question") ?? "");

    if (!(file instanceof File) || !questionId || !question) {
      throw Object.assign(new Error("file, questionId, and question are required."), {
        code: "INVALID_INPUT" as const,
      });
    }

    const result = await extractSupportingContext({ file, questionId, question });
    return Response.json(result);
  } catch (error) {
    return toApiError(error, "DOCUMENT_EXTRACTION_FAILED");
  }
}
