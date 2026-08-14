/** Shared supportingItemIds kind/id contract — Directions and Topics. */
export const SUPPORTING_ITEM_IDS_CONTRACT = [
  "supportingItemIds grounding contract:",
  "- Every supportingItemId MUST be a real itemId from the PublishedLibraryDto (see each item's itemId + kind).",
  "- For EACH Direction or Topic, supportingItemIds must collectively include opportunity OR tension (kind), AND audience OR moment (kind).",
  "- Fact/restriction/limitation IDs alone are not enough grounding.",
  "- Creator-intelligence substrate (Topics only): supportingItemIds are not mere grounding receipts. They become the Atom's creator intelligence substrate — select the smallest governed set that grounds AND teaches the Topic's core unresolved distinction / reasoning.",
  "- Teaching-support sufficiency (Topics only): when the DTO has ≥2 relevant non-hypothesis fact items that can teach the topic's promised content, supportingItemIds MUST include ≥2 of those facts. After that floor, add the fewest extra items only when needed to ground and teach the topic's core reasoning, contrast, or decision rule; if 2 facts already do that, stop at 2 teaching facts unless a non-fact item carries an essential distinction. Never pad with adjacent market, loyalty, platform, or reach stats; never invent facts.",
  "- Include non-fact items (competitor, opportunity, tension, demand) in supportingItemIds when those items carry an essential distinction, example, contrast, or decision rule the Topic depends on. Hypotheses, restrictions, and limitations do not count toward teaching-fact density; audience/moment satisfy framing grounding but are not teach-list carriers.",
  "- Relevance is judged from the topic brief + each item's governed statement — do not invent domain keywords or research.",
  "- Do not invent itemIds or research.",
].join("\n");
