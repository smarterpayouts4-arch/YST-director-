import { expandYouTubeShortsProduction } from "@/features/social-media/youtube-shorts/services/expand-production";
import { toCiApiError } from "@/features/content-intelligence/library/services/api-error";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await expandYouTubeShortsProduction({
      packet: body.ingestedAtom,
      approvedStoryboard: body.approvedStoryboard,
      projectId: body.projectId,
      artifactId: body.artifactId,
      topicPacketId: body.topicPacketId,
      stage: body.stage,
    });
    return Response.json(result);
  } catch (error) {
    return toCiApiError(error, "OPENAI_ERROR");
  }
}
