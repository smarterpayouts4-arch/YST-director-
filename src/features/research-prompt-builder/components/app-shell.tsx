"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useInterviewFlow } from "@/features/research-prompt-builder/components/app-shell/interview-flow";
import { stageWhy } from "@/features/research-prompt-builder/components/app-shell/stage-copy";
import {
  getInterviewStatus,
  getInterviewStatusMessage,
  interviewQuestionProgress,
} from "@/features/research-prompt-builder/components/app-shell/stage-status";
import { StageRail } from "@/features/research-prompt-builder/components/stage-rail";
import { IngestionDropzone } from "@/features/research-prompt-builder/components/ingestion-dropzone";
import { CompanyUnderstandingView } from "@/features/research-prompt-builder/components/company-understanding";
import { InterviewWorkspace } from "@/features/research-prompt-builder/components/interview-workspace";
import { ResearchBriefEditor } from "@/features/research-prompt-builder/components/research-brief-editor";
import { FinalPromptViewer } from "@/features/research-prompt-builder/components/final-prompt-viewer";
import { PromptCompileProgress } from "@/features/research-prompt-builder/components/prompt-compile-progress";
import { useResearchPromptProject } from "@/features/research-prompt-builder/hooks/use-research-prompt-project";
import { canCompleteInterview } from "@/features/research-prompt-builder/lib/can-complete-interview";
import { toAppStage } from "@/features/research-prompt-builder/state/workflow-states";
import type { InterviewAnswer } from "@/features/research-prompt-builder/types";

export function AppShell() {
  const {
    state,
    dispatch,
    hydrated,
    restoredFromStorage,
    reset: resetProject,
  } = useResearchPromptProject();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingQuestion, setAwaitingQuestion] = useState(false);
  const [seedAnswer, setSeedAnswer] = useState<InterviewAnswer | null>(null);
  const interviewGenRef = useRef(0);
  const autoResumeDoneRef = useRef(false);

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const unanswered =
    currentQuestion && !state.answers.some((a) => a.questionId === currentQuestion.questionId);
  const uiStage = toAppStage(state.currentStage, {
    hasUnderstanding: !!state.companyUnderstanding,
    hasConfirmedProfile: !!state.confirmedProfile,
    hasBrief: !!state.researchBrief,
    hasFinalPrompt: !!state.finalPrompt,
  });

  const interviewMayComplete =
    !!state.confirmedProfile &&
    canCompleteInterview({
      confirmedProfile: state.confirmedProfile,
      previousQuestions: state.questions,
      previousAnswers: state.answers,
    }).ok;

  const interviewIncomplete =
    uiStage === "interview" &&
    !!state.confirmedProfile &&
    (state.currentStage === "INTERVIEWING" ||
      state.currentStage === "MODEL_OUTPUT_INVALID" ||
      state.currentStage === "DOCUMENT_EXTRACTION_FAILED");

  const needsNextQuestion =
    interviewIncomplete &&
    (state.questions.length === 0 ||
      (!!currentQuestion &&
        state.answers.some((a) => a.questionId === currentQuestion.questionId)));

  const why = useMemo(() => stageWhy(uiStage), [uiStage]);

  const {
    analyze,
    useSample,
    fetchNextQuestion,
    createBrief,
    retryNextQuestion,
    reopenQuestion,
    generatePrompt,
    extractSupporting,
  } = useInterviewFlow({
    state,
    dispatch,
    busy,
    awaitingQuestion,
    setBusy,
    setError,
    setAwaitingQuestion,
    setSeedAnswer,
    interviewGenRef,
    autoResumeDoneRef,
    hydrated,
    restoredFromStorage,
    needsNextQuestion,
  });

  const reset = () => {
    interviewGenRef.current += 1;
    autoResumeDoneRef.current = false;
    setBusy(false);
    setError(null);
    setAwaitingQuestion(false);
    setSeedAnswer(null);
    resetProject();
  };

  if (!hydrated) {
    return <div className="p-8 text-stone-600">Restoring project…</div>;
  }

  const interviewStatus = getInterviewStatus({
    awaitingQuestion,
    busy,
    needsNextQuestion,
    error,
  });
  const interviewStatusMessage = getInterviewStatusMessage({
    interviewStatus,
    error,
    answerCount: state.answers.length,
    needsNextQuestion,
  });

  return (
    <div className="min-h-screen md:flex">
      <StageRail
        stage={uiStage}
        whyThisMatters={why}
        questionProgress={
          uiStage === "interview"
            ? interviewQuestionProgress(state.answers.length)
            : undefined
        }
      />
      <main className="relative flex-1 px-5 py-6 md:px-10 md:py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <p className="text-sm text-stone-500">
            {state.ingestion.fileName
              ? `Project: ${state.ingestion.fileName}`
              : uiStage === "understanding"
                ? "Company understanding"
                : "New research prompt project"}
          </p>
          <Button variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
        </div>

        {uiStage === "ingestion" ? (
          <IngestionDropzone
            busy={busy}
            error={error}
            onAnalyze={analyze}
            onUseSample={useSample}
          />
        ) : null}

        {uiStage === "understanding" && state.companyUnderstanding ? (
          <CompanyUnderstandingView
            understanding={state.companyUnderstanding}
            warnings={state.ingestion.meta?.warnings}
            onConfirm={async (profile) => {
              dispatch({ type: "SET_CONFIRMED_PROFILE", profile });
              await fetchNextQuestion(profile, [], []);
            }}
          />
        ) : null}

        {uiStage === "interview" ? (
          currentQuestion ? (
            <InterviewWorkspace
              questions={state.questions}
              answers={state.answers}
              currentQuestionIndex={state.currentQuestionIndex}
              currentQuestion={currentQuestion}
              seedAnswer={seedAnswer}
              busy={busy}
              locked={!unanswered}
              statusMessage={!unanswered ? interviewStatusMessage : null}
              error={error}
              onRetry={
                !unanswered && interviewStatus === "blocked" && state.confirmedProfile
                  ? retryNextQuestion
                  : undefined
              }
              canBuildBrief={!unanswered && interviewMayComplete}
              onBuildBrief={
                !unanswered && interviewMayComplete
                  ? () => {
                      dispatch({ type: "INTERVIEW_COMPLETE" });
                      void createBrief();
                    }
                  : undefined
              }
              onReopen={reopenQuestion}
              onExtract={(file) => extractSupporting(file, currentQuestion)}
              onSave={async (answer) => {
                setSeedAnswer(null);
                const nextAnswers = [
                  ...state.answers.filter((a) => a.questionId !== answer.questionId),
                  answer,
                ];
                const questionsForNext = state.questions.slice(
                  0,
                  state.currentQuestionIndex + 1,
                );
                dispatch({ type: "SAVE_ANSWER", answer });
                if (!state.confirmedProfile) return;
                if (
                  state.currentStage === "MODEL_OUTPUT_INVALID" ||
                  state.currentStage === "DOCUMENT_EXTRACTION_FAILED"
                ) {
                  dispatch({ type: "SET_STAGE", stage: "INTERVIEWING" });
                }
                await fetchNextQuestion(
                  state.confirmedProfile,
                  nextAnswers,
                  questionsForNext,
                );
              }}
            />
          ) : (
            <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <p className="text-base font-medium text-stone-900">
                {awaitingQuestion || busy
                  ? "Starting the interview…"
                  : "Couldn’t start the interview"}
              </p>
              <p className="text-sm text-stone-600">
                {awaitingQuestion || busy
                  ? "First question loading…"
                  : "Retry to continue from your confirmed facts."}
              </p>
              {error ? <p className="text-sm text-red-700">{error}</p> : null}
              {!busy && state.confirmedProfile ? (
                <div className="flex flex-wrap gap-2">
                  <Button onClick={retryNextQuestion}>Retry next question</Button>
                </div>
              ) : null}
            </div>
          )
        ) : null}

        {uiStage === "brief" ? (
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

        {uiStage === "prompt" && state.currentStage === "GENERATING_PROMPT" ? (
          <PromptCompileProgress error={error} />
        ) : null}

        {uiStage === "prompt" &&
        state.currentStage === "PROMPT_EXPORTED" &&
        state.finalPrompt &&
        state.formattedPrompt &&
        state.confirmedProfile &&
        state.researchBrief ? (
          <FinalPromptViewer
            prompt={state.finalPrompt}
            formatted={state.formattedPrompt}
            busy={busy}
            error={error}
            onRegenerate={generatePrompt}
            confirmedProfile={state.confirmedProfile}
            questions={state.questions}
            answers={state.answers}
            researchBrief={state.researchBrief}
          />
        ) : null}
      </main>
    </div>
  );
}
