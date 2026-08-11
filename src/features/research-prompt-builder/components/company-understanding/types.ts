export type FieldDecision = {
  status: "confirmed" | "corrected" | "rejected" | "unresolved";
  value: string;
};
