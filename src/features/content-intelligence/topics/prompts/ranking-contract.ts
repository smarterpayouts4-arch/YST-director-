/** Priority 1 = Recommended create-first (Directions and Topics). No separate recommended boolean. */
export const DIRECTIONS_RANKING_CONTRACT = [
  "Rank priority 1–N (N ≤ 3). Exactly one Direction has priority=1 — that is the Recommended lane to explore first.",
  "Priorities must be unique among returned Directions (1, then 2, then 3 as applicable).",
  "Provide confidence and a short rationale explaining why this lane differs from the others.",
].join("\n");

export const TOPICS_RANKING_CONTRACT = [
  "Rank priority 1–6. Exactly one topic at priority=1 — that is the Recommended canonical topic to create first.",
  "Choose priority 1 by: audience relevance + fit to the selected Direction/decisionQuestion + unresolved distinction strength + substantive discovery potential + tension clarity + decision usefulness/payoff + distinctiveness + cross-channel versatility + evidence strength, minus hypothesis/restriction burden.",
  "Do not rank primarily on clickability, virality, SEO potential, catchy phrasing, or strength of a possible short-form hook.",
  "Priorities must be unique (1 through 6).",
].join("\n");
