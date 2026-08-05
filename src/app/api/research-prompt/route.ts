import { generateResearchPrompt } from "@/features/research-prompt-builder/services/generate-research-prompt";
import { toApiError } from "@/features/research-prompt-builder/services/api-error";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await generateResearchPrompt({
      confirmedProfile: body.confirmedProfile,
      researchBrief: body.researchBrief,
    });
    return Response.json(result);
  } catch (error) {
    return toApiError(error, "OPENAI_ERROR");
  }
}
