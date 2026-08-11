import { readClientError } from "@/features/research-prompt-builder/components/app-shell/read-client-error";
import type { ResearchBrief } from "@/features/research-prompt-builder/schemas";
import type {
  ConfirmedCompanyProfile,
  InterviewAnswer,
  InterviewQuestion,
  SupportingContext,
} from "@/features/research-prompt-builder/types";

export async function postCompanyUnderstand(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/company/understand", { method: "POST", body: form });
  if (!res.ok) throw new Error(await readClientError(res));
  return res.json();
}

export async function fetchSampleCompanyCsv(): Promise<File> {
  const res = await fetch("/samples/zynava-company.csv");
  const blob = await res.blob();
  return new File([blob], "zynava-company.csv", { type: "text/csv" });
}

export async function postInterviewNext(input: {
  confirmedProfile: ConfirmedCompanyProfile;
  previousQuestions: InterviewQuestion[];
  previousAnswers: InterviewAnswer[];
  unresolvedUnknowns: string[];
}) {
  const res = await fetch("/api/interview/next", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readClientError(res));
  return res.json();
}

export async function postResearchBrief(input: {
  confirmedProfile: ConfirmedCompanyProfile;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
}) {
  const res = await fetch("/api/research-brief", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readClientError(res));
  return res.json();
}

export async function postResearchPrompt(input: {
  confirmedProfile: ConfirmedCompanyProfile;
  researchBrief: ResearchBrief;
}) {
  const res = await fetch("/api/research-prompt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readClientError(res));
  return res.json();
}

export async function postDocumentExtract(input: {
  file: File;
  questionId: string;
  question: string;
}): Promise<SupportingContext & { extractedCharCount?: number }> {
  const form = new FormData();
  form.append("file", input.file);
  form.append("questionId", input.questionId);
  form.append("question", input.question);
  const res = await fetch("/api/documents/extract", {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(await readClientError(res));
  const data = await res.json();
  return {
    ...(data.supportingContext as SupportingContext),
    extractedCharCount: data.extractedCharCount,
  };
}
