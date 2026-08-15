import { generateYouTubeShortsStoryboard } from "@/features/social-media/youtube-shorts/services/generate-storyboard";
import { toCiApiError } from "@/features/content-intelligence/library/services/api-error";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await generateYouTubeShortsStoryboard({
      packet: body.ingestedAtom,
      projectId: body.projectId,
      artifactId: body.artifactId,
      topicPacketId: body.topicPacketId,
    });
    return Response.json(result);
  } catch (error) {
    return toCiApiError(error, "OPENAI_ERROR");
  }
}
