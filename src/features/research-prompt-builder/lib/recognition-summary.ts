import type { ClassifiedField, CompanyUnderstanding } from "@/features/research-prompt-builder/schemas";

export type RecognitionBucketId =
  | "supported_by_file"
  | "worth_checking"
  | "research_should_investigate";

export type RecognitionItem = {
  bucket: RecognitionBucketId;
  text: string;
};

const BUCKET_CAPS: Record<RecognitionBucketId, number> = {
  supported_by_file: 3,
  worth_checking: 2,
  research_should_investigate: 3,
};

function pick(fields: ClassifiedField[], max: number): string[] {
  return fields
    .map((f) => f.value.trim())
    .filter(Boolean)
    .slice(0, max);
}

/**
 * Select 5–8 highest-value recognition items. Does not dump every generated field.
 * Schema names stay internal; UI labels are epistemic.
 */
export function selectRecognitionItems(
  understanding: CompanyUnderstanding,
): RecognitionItem[] {
  const items: RecognitionItem[] = [];
  for (const text of pick(understanding.confirmedFacts, BUCKET_CAPS.supported_by_file)) {
    items.push({ bucket: "supported_by_file", text });
  }
  for (const text of pick(
    understanding.workingAssumptions,
    BUCKET_CAPS.worth_checking,
  )) {
    items.push({ bucket: "worth_checking", text });
  }
  for (const text of pick(
    understanding.importantUnknowns,
    BUCKET_CAPS.research_should_investigate,
  )) {
    items.push({ bucket: "research_should_investigate", text });
  }
  return items;
}

export const RECOGNITION_BUCKET_LABELS: Record<RecognitionBucketId, string> = {
  supported_by_file: "Supported by your file",
  worth_checking: "Likely, but worth checking",
  research_should_investigate: "Questions the research should investigate",
};

/** Quiet epistemic label for per-field classification (no raw confidence numbers). */
export function classificationLabel(
  classification: ClassifiedField["classification"],
): string {
  switch (classification) {
    case "observed_fact":
      return "Supported by your file";
    case "working_assumption":
      return "Likely, but worth checking";
    case "important_unknown":
      return "Still open";
    default:
      return "Worth checking";
  }
}
