import type { TopicPacket } from "@/features/content-intelligence/contracts/topic-packet";

export const YOUTUBE_SHORTS_PROJECTION_KEYS = [
  "audience",
  "confidence",
  "customerMoment",
  "decisionQuestion",
  "desiredTakeaway",
  "evidenceQuotes",
  "hypothesisDependencies",
  "limitations",
  "opportunity",
  "premise",
  "restrictions",
  "supportingInsights",
  "tension",
  "title",
  "unresolvedAssumptions",
  "whyItMatters",
] as const;

export type YouTubeShortsProjectionKey =
  (typeof YOUTUBE_SHORTS_PROJECTION_KEYS)[number];

export type YouTubeShortsProjection = Pick<
  TopicPacket,
  YouTubeShortsProjectionKey
>;

export function projectTopicPacketToYouTubeShortsInput(
  packet: TopicPacket,
): YouTubeShortsProjection {
  return {
    audience: packet.audience,
    confidence: packet.confidence,
    customerMoment: packet.customerMoment,
    decisionQuestion: packet.decisionQuestion,
    desiredTakeaway: packet.desiredTakeaway,
    evidenceQuotes: packet.evidenceQuotes,
    hypothesisDependencies: packet.hypothesisDependencies,
    limitations: packet.limitations,
    opportunity: packet.opportunity,
    premise: packet.premise,
    restrictions: packet.restrictions,
    supportingInsights: packet.supportingInsights,
    tension: packet.tension,
    title: packet.title,
    unresolvedAssumptions: packet.unresolvedAssumptions,
    whyItMatters: packet.whyItMatters,
  };
}
