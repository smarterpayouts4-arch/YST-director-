import { getUploadPolicy } from "@/config/upload-policy";

export function getUploadLimits() {
  const policy = getUploadPolicy();
  return {
    maxCsvBytes: policy.maxCsvBytes,
    maxCsvRows: policy.maxCsvRows,
    maxCsvColumns: policy.maxCsvColumns,
    maxSupportingFileBytes: policy.maxSupportingFileBytes,
    maxSupportingFilesPerQuestion: policy.maxSupportingFilesPerQuestion,
    maxCellChars: policy.maxCellChars,
  };
}
