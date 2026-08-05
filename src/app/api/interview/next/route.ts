import { generateNextQuestion } from "@/features/research-prompt-builder/services/generate-next-question";
import { toApiError } from "@/features/research-prompt-builder/services/api-error";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await generateNextQuestion({
      confirmedProfile: body.confirmedProfile,
      previousQuestions: body.previousQuestions ?? [],
      previousAnswers: body.previousAnswers ?? [],
      unresolvedUnknowns: body.unresolvedUnknowns ?? [],
    });
    return Response.json(result);
  } catch (error) {
    return toApiError(error, "OPENAI_ERROR");
  }
}
