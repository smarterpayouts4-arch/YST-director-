import { z } from "zod";
import { ConfidenceSchema } from "@/features/content-intelligence/library/schemas/enums";

/**
 * Canonical Topic Packet — ONE strategic handoff for all future channel systems.
 * No platform-specific fields, scripts, hooks, or CTAs.
 *
 * ## Channel-consumer contract (semantics; payload shape is stable)
 *
 * Claim surface for channel agents is `supportingInsights` + `evidenceQuotes`,
 * bounded by `restrictions` / `limitations` and uncertainty fields. Do not invent
 * additional claims from provenance metadata alone.
 *
 * - **`confidence`** — Topic-selection confidence for the chosen Topic Opportunity
 *   (`low` | `medium` | `high`). Not an aggregate of Librarian item confidences,
 *   not overall research certainty, and not permission to strengthen claims beyond
 *   the evidence carried in this packet.
 * - **`sourceRefs` / `provenanceNotes`** — Provenance: where governed supporting
 *   material came from. They do not authorize additional claims beyond
 *   `supportingInsights` and `evidenceQuotes`.
 * - **`restrictions`** — Safety SSOT (hard bans / do-nots from the governed library).
 * - **`doNotClaim`** — Compatibility mirror of `restrictions` (same strings). Prefer
 *   `restrictions` as the safety SSOT. Do **not** treat `doNotClaim` as a second
 *   independently derived safety layer; if both are read, they are the same list —
 *   do not merge as if two systems.
 */
export const TopicPacketSchema = z.object({
  topicPacketId: z.string().min(1).max(80),
  projectId: z.string().min(1).max(80).optional(),
  artifactId: z.string().min(1).max(80),
  libraryId: z.string().min(1).max(80),
  territoryId: z.string().min(1).max(80),
  topicId: z.string().min(1).max(80),
  version: z.literal(1),
  status: z.literal("selected"),
  createdAt: z.string().datetime(),
  title: z.string().min(1).max(160),
  premise: z.string().min(1).max(400),
  audience: z.string().min(1).max(400),
  customerMoment: z.string().min(1).max(400),
  tension: z.string().min(1).max(400),
  opportunity: z.string().min(1).max(400),
  decisionQuestion: z.string().min(1).max(240),
  desiredTakeaway: z.string().min(1).max(400),
  whyItMatters: z.string().min(1).max(400),
  /** Governed teaching claims channel agents may use (bounded by restrictions). */
  supportingInsights: z.array(z.string().min(1).max(2000)).max(8),
  supportingItemIds: z.array(z.string().min(1).max(80)).min(1).max(24),
  /**
   * Provenance only — where supporting material came from.
   * Not permission to invent claims beyond evidence in this packet.
   */
  sourceRefs: z.array(z.string().max(200)).max(24),
  /** Verbatim evidence quotes from selected support items (claim surface with insights). */
  evidenceQuotes: z.array(z.string().max(2000)).max(12),
  /** Section/theme provenance notes for contributing support items. */
  provenanceNotes: z.array(z.string().max(800)).max(24),
  /**
   * Topic-selection confidence (chosen Topic Opportunity), not research aggregate
   * and not permission to strengthen claims.
   */
  confidence: ConfidenceSchema,
  hypothesisDependencies: z.array(z.string().max(400)).max(8),
  unresolvedAssumptions: z.array(z.string().max(400)).max(8),
  /** Safety SSOT — hard bans / do-nots. Prefer this over `doNotClaim`. */
  restrictions: z.array(z.string().max(2000)).max(24),
  limitations: z.array(z.string().max(2000)).max(24),
  /**
   * Compatibility mirror of `restrictions` (same strings). Not a second safety system.
   */
  doNotClaim: z.array(z.string().max(2000)).max(24),
});

export type TopicPacket = z.infer<typeof TopicPacketSchema>;
