"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { StageRail } from "@/features/research-prompt-builder/components/stage-rail";
import { IngestionDropzone } from "@/features/research-prompt-builder/components/ingestion-dropzone";
import { CompanyUnderstandingView } from "@/features/research-prompt-builder/components/company-understanding";
import { InterviewQuestionView } from "@/features/research-prompt-builder/components/interview-question";
import { ResearchBriefEditor } from "@/features/research-prompt-builder/components/research-brief-editor";
import { FinalPromptViewer } from "@/features/research-prompt-builder/components/final-prompt-viewer";
import { useResearchPromptProject } from "@/features/research-prompt-builder/hooks/use-research-prompt-project";
import type {
  ConfirmedCompanyProfile,
  InterviewAnswer,
  SupportingContext,
} from "@/features/research-prompt-builder/types";

async function readError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data?.error?.message || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

export function AppShell() {
  const { state, dispatch, hydrated, reset } = useResearchPromptProject();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingQuestion, setAwaitingQuestion] = useState(false);

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const unanswered =
    currentQuestion && !state.answers.some((a) => a.questionId === currentQuestion.questionId);

  const why = useMemo(() => {
    if (state.currentStage === "interview" && currentQuestion) {
      return currentQuestion.whyThisMatters;
    }
    if (state.currentStage === "understanding") {
      return "Owner confirmation prevents invented strategy from entering the research prompt.";
    }
    if (state.currentStage === "brief") {
      return "The brief is the contract for the final prompt. Edit anything that feels wrong.";
    }
    if (state.currentStage === "prompt") {
      return "Copy this into ChatGPT or another capable research model.";
    }
    return undefined;
  }, [state.currentStage, currentQuestion]);

  const analyze = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/company/understand", { method: "POST", body: form });
      if (!res.ok) throw new Error(await readError(res));
      const data = await res.json();
      dispatch({
        type: "INGESTION_SUCCESS",
        meta: {
          ...data.evidencePacketMeta,
          fileHash: data.evidencePacketMeta.fileHash,
          importedAt: data.evidencePacketMeta.importedAt,
        },
        understanding: data.companyUnderstanding,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setBusy(false);
    }
  };

  const useSample = async () => {
    const res = await fetch("/samples/zynava-company.csv");
    const blob = await res.blob();
    const file = new File([blob], "zynava-company.csv", { type: "text/csv" });
    await analyze(file);
  };

  const fetchNextQuestion = async (
    profile: ConfirmedCompanyProfile,
    answers: InterviewAnswer[] = state.answers,
    questions = state.questions,
  ) => {
    setBusy(true);
    setError(null);
    setAwaitingQuestion(true);
    try {
      const unresolvedUnknowns = Object.entries(profile.fields)
        .filter(([, field]) => field.status === "unresolved")
        .map(([key, field]) => `${key}: ${field.value}`);

      const res = await fetch("/api/interview/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmedProfile: profile,
          previousQuestions: questions,
          previousAnswers: answers,
          unresolvedUnknowns,
        }),
      });
      if (!res.ok) throw new Error(await readError(res));
      const data = await res.json();
      if (data.done) {
        dispatch({ type: "INTERVIEW_COMPLETE" });
        await createBrief(profile, questions, answers);
      } else {
        dispatch({ type: "ADD_QUESTION", question: data.question });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Interview failed");
    } finally {
      setBusy(false);
      setAwaitingQuestion(false);
    }
  };

  const createBrief = async (
    profile = state.confirmedProfile!,
    questions = state.questions,
    answers = state.answers,
  ) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/research-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmedProfile: profile,
          questions,
          answers,
        }),
      });
      if (!res.ok) throw new Error(await readError(res));
      const data = await res.json();
      dispatch({ type: "SET_BRIEF", brief: data.researchBrief });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Brief generation failed");
    } finally {
      setBusy(false);
    }
  };

  const generatePrompt = async () => {
    if (!state.confirmedProfile || !state.researchBrief) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/research-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmedProfile: state.confirmedProfile,
          researchBrief: state.researchBrief,
        }),
      });
      if (!res.ok) throw new Error(await readError(res));
      const data = await res.json();
      dispatch({
        type: "SET_FINAL_PROMPT",
        prompt: data.structuredPrompt,
        formattedPrompt: data.formattedPrompt,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prompt generation failed");
    } finally {
      setBusy(false);
    }
  };

  if (!hydrated) {
    return <div className="p-8 text-stone-600">Restoring project…</div>;
  }

  return (
    <div className="min-h-screen md:flex">
      <StageRail
        stage={state.currentStage}
        whyThisMatters={why}
        questionProgress={
          state.currentStage === "interview" && currentQuestion
            ? `Question ${currentQuestion.sequenceNumber}`
            : undefined
        }
      />
      <main className="relative flex-1 px-5 py-6 md:px-10 md:py-10">
        <div className="mb-8 flex items-center justify-between gap-3">
          <p className="text-sm text-stone-500">
            {state.ingestion.fileName
              ? `Project: ${state.ingestion.fileName}`
              : "New research prompt project"}
          </p>
          <Button variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
        </div>

        {state.currentStage === "ingestion" ? (
          <IngestionDropzone
            busy={busy}
            error={error}
            onAnalyze={analyze}
            onUseSample={useSample}
          />
        ) : null}

        {state.currentStage === "understanding" && state.companyUnderstanding ? (
          <CompanyUnderstandingView
            understanding={state.companyUnderstanding}
            warnings={state.ingestion.meta?.warnings}
            onConfirm={async (profile) => {
              dispatch({ type: "SET_CONFIRMED_PROFILE", profile });
              await fetchNextQuestion(profile, [], []);
            }}
          />
        ) : null}

        {state.currentStage === "interview" ? (
          unanswered && currentQuestion ? (
            <InterviewQuestionView
              question={currentQuestion}
              totalHint={`${currentQuestion.sequenceNumber} of up to 7`}
              busy={busy}
              error={error}
              onExtract={async (file) => {
                const form = new FormData();
                form.append("file", file);
                form.append("questionId", currentQuestion.questionId);
                form.append("question", currentQuestion.question);
                const res = await fetch("/api/documents/extract", {
                  method: "POST",
                  body: form,
                });
                if (!res.ok) throw new Error(await readError(res));
                const data = await res.json();
                return {
                  ...(data.supportingContext as SupportingContext),
                  extractedCharCount: data.extractedCharCount,
                };
              }}
              onSave={async (answer) => {
                const nextAnswers = [
                  ...state.answers.filter((a) => a.questionId !== answer.questionId),
                  answer,
                ];
                dispatch({ type: "SAVE_ANSWER", answer });
                if (!state.confirmedProfile) return;
                await fetchNextQuestion(
                  state.confirmedProfile,
                  nextAnswers,
                  state.questions,
                );
              }}
            />
          ) : (
            <div className="space-y-4">
              <p className="text-stone-700">
                {awaitingQuestion || busy
                  ? "Preparing the next question…"
                  : "Interview complete. Building your research brief…"}
              </p>
              {error ? <p className="text-sm text-red-700">{error}</p> : null}
              {!busy && state.confirmedProfile ? (
                <Button onClick={() => createBrief()}>Build research brief</Button>
              ) : null}
            </div>
          )
        ) : null}

        {state.currentStage === "brief" ? (
          state.researchBrief ? (
            <ResearchBriefEditor
              brief={state.researchBrief}
              busy={busy}
              error={error}
              onChange={(brief) => dispatch({ type: "EDIT_BRIEF", brief })}
              onGenerate={generatePrompt}
            />
          ) : (
            <div className="space-y-4">
              <p className="text-stone-700">
                {busy ? "Building your research brief…" : "Research brief is not ready yet."}
              </p>
              {error ? <p className="text-sm text-red-700">{error}</p> : null}
              {!busy ? <Button onClick={() => createBrief()}>Build research brief</Button> : null}
            </div>
          )
        ) : null}

        {state.currentStage === "prompt" && state.finalPrompt && state.formattedPrompt ? (
          <FinalPromptViewer
            prompt={state.finalPrompt}
            formatted={state.formattedPrompt}
            busy={busy}
            error={error}
            onRegenerate={generatePrompt}
          />
        ) : null}
      </main>
    </div>
  );
}
