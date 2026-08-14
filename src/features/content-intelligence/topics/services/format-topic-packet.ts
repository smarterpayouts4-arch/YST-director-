import type { TopicPacket } from "@/features/content-intelligence/contracts/topic-packet";

/** Pretty-print Canonical Topic Packet JSON for copy/download handoff. */
export function formatTopicPacketJson(packet: TopicPacket): string {
  return `${JSON.stringify(packet, null, 2)}\n`;
}

function bulletList(items: string[]): string {
  if (items.length === 0) return "_None_\n";
  return `${items.map((item) => `- ${item}`).join("\n")}\n`;
}

/**
 * Human-readable strategic brief for pasting into external tools
 * until channel apps exist. No hooks, scripts, or platform fields.
 */
export function formatTopicPacketMarkdown(packet: TopicPacket): string {
  const lines: string[] = [
    `# ${packet.title}`,
    "",
    "## Premise",
    packet.premise,
    "",
    "## Audience",
    packet.audience,
    "",
    "## Customer moment",
    packet.customerMoment,
    "",
    "## Strategic question",
    packet.decisionQuestion,
    "",
    "## Core tension",
    packet.tension,
    "",
    "## Opportunity",
    packet.opportunity,
    "",
    "## Why it matters",
    packet.whyItMatters,
    "",
    "## Key takeaway",
    packet.desiredTakeaway,
    "",
    "## What this content should teach",
    bulletList(packet.supportingInsights).trimEnd(),
    "",
    "## Evidence quotes",
    bulletList(packet.evidenceQuotes).trimEnd(),
    "",
    "## Sources / provenance",
    "These references show where the governed supporting material came from. They do not authorize additional claims beyond the evidence carried in this packet.",
    "",
    bulletList(packet.sourceRefs).trimEnd(),
    "",
    "## Restrictions",
    "JSON field `doNotClaim` is a compatibility mirror of this list — not a second safety system. Prefer these restrictions as the safety source of truth.",
    "",
    bulletList(packet.restrictions).trimEnd(),
    "",
    "## Limitations",
    bulletList(packet.limitations).trimEnd(),
    "",
    "## Hypothesis dependencies",
    bulletList(packet.hypothesisDependencies).trimEnd(),
    "",
    "## Unresolved assumptions",
    bulletList(packet.unresolvedAssumptions).trimEnd(),
    "",
    "## Packet identity",
    `- topicPacketId: ${packet.topicPacketId}`,
    `- topicId: ${packet.topicId}`,
    `- territoryId: ${packet.territoryId}`,
    `- libraryId: ${packet.libraryId}`,
    `- artifactId: ${packet.artifactId}`,
    `- createdAt: ${packet.createdAt}`,
    `- Confidence: ${packet.confidence}`,
    "Topic-selection confidence; not a measure of overall research certainty or permission to strengthen claims.",
    "",
  ];

  return `${lines.join("\n")}\n`;
}
