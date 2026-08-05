import { buildResearchBrief } from "@/features/research-prompt-builder/services/build-research-brief";
import { toApiError } from "@/features/research-prompt-builder/services/api-error";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const researchBrief = await buildResearchBrief({
      confirmedProfile: body.confirmedProfile,
      questions: body.questions ?? [],
      answers: body.answers ?? [],
    });
    return Response.json({ researchBrief });
  } catch (error) {
    return toApiError(error, "OPENAI_ERROR");
  }
}
