import { proposeTopicDirections } from "@/features/content-intelligence/topics/services/propose-directions";
import { toCiApiError } from "@/features/content-intelligence/library/services/api-error";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await proposeTopicDirections({
      publishedLibrary: body.publishedLibrary,
      artifactId: body.artifactId,
      projectId: body.projectId,
    });
    return Response.json(result);
  } catch (error) {
    return toCiApiError(error, "OPENAI_ERROR");
  }
}
