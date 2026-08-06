export type FeaturePolicy = {
  enableSupportingDocuments: boolean;
  enableSampleCsv: boolean;
  enablePromptDownload: boolean;
  enableInterviewConditionals: boolean;
  maxCoreQuestions: number;
  maxConditionalQuestions: number;
  maxTotalQuestions: number;
  /** Product stops after one copy-ready research prompt. */
  stopAfterPromptExport: true;
};

export function getFeaturePolicy(): FeaturePolicy {
  return {
    enableSupportingDocuments: true,
    enableSampleCsv: true,
    enablePromptDownload: true,
    enableInterviewConditionals: true,
    maxCoreQuestions: 5,
    maxConditionalQuestions: 2,
    maxTotalQuestions: 7,
    stopAfterPromptExport: true,
  };
}
