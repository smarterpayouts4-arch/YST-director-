import { analyzeCompanyFromCsv } from "@/features/research-prompt-builder/services/analyze-company";
import { toApiError } from "@/features/research-prompt-builder/services/api-error";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      throw Object.assign(new Error("A CSV file is required."), {
        code: "INVALID_INPUT" as const,
      });
    }

    const result = await analyzeCompanyFromCsv(file);
    return Response.json({
      evidencePacketMeta: result.evidencePacketMeta,
      companyUnderstanding: result.companyUnderstanding,
      promptVersion: result.promptVersion,
    });
  } catch (error) {
    return toApiError(error, "OPENAI_ERROR");
  }
}
