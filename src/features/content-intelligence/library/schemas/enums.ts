import { z } from "zod";

export const IntelligenceKindSchema = z.enum([
  "fact",
  "audience",
  "moment",
  "tension",
  "opportunity",
  "demand",
  "competitor",
  "restriction",
  "unresolved",
  "limitation",
  "other",
]);

export const ItemOriginSchema = z.enum([
  "extracted",
  "owner_edited",
  "owner_added",
]);

export const ReviewStatusSchema = z.enum([
  "needs_review",
  "accepted",
  "rejected",
]);

export const ConfidenceSchema = z.enum(["low", "medium", "high"]);

export type IntelligenceKind = z.infer<typeof IntelligenceKindSchema>;
export type ItemOrigin = z.infer<typeof ItemOriginSchema>;
export type ReviewStatus = z.infer<typeof ReviewStatusSchema>;
export type Confidence = z.infer<typeof ConfidenceSchema>;
