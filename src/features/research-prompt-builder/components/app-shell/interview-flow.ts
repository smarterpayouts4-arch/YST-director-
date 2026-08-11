"use client";

import { useEffect, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import {
  fetchSampleCompanyCsv,
  postCompanyUnderstand,
  postDocumentExtract,
  postInterviewNext,
  postResearchBrief,
  postResearchPrompt,
} from "@/features/research-prompt-builder/components/app-shell/api-actions";
import type { ProjectAction } from "@/features/research-prompt-builder/state/project-reducer";
import type {
  ConfirmedCompanyProfile,
  InterviewAnswer,
  InterviewQuestion,
  ResearchPromptProject,
  SupportingContext,
} from "@/features/research-prompt-builder/types";
import { canCompleteInterview } from "@/features/research-prompt-builder/lib/can-complete-interview";

type FlowDeps = {
  state: ResearchPromptProject;
  dispatch: Dispatch<ProjectAction>;
  busy: boolean;
  awaitingQuestion: boolean;
  setBusy: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setAwaitingQuestion: Dispatch<SetStateAction<boolean>>;
  setSeedAnswer: Dispatch<SetStateAction<InterviewAnswer | null>>;
  interviewGenRef: MutableRefObject<number>;
  autoResumeDoneRef: MutableRefObject<boolean>;
  hydrated: boolean;
  restoredFromStorage: boolean;
  needsNextQuestion: boolean;
};

export function useInterviewFlow(deps: FlowDeps) {
  const {
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
  } = deps;

  const createBrief = async (
    profile = state.confirmedProfile!,
    questions = state.questions,
    answers = state.answers,
    gen = interviewGenRef.current,
  ) => {
    setBusy(true);
    setError(null);
    try {
      const data = await postResearchBrief({
        confirmedProfile: profile,
        questions,
        answers,
      });
      if (gen !== interviewGenRef.current) return;
      dispatch({ type: "SET_BRIEF", brief: data.researchBrief });
    } catch (err) {
      if (gen !== interviewGenRef.current) return;
      dispatch({
        type: "SET_FAILURE",
        state: "MODEL_OUTPUT_INVALID",
        code: "MODEL_OUTPUT_INVALID",
      });
      setError(err instanceof Error ? err.message : "Brief generation failed");
    } finally {
      if (gen === interviewGenRef.current) {
        setBusy(false);
      }
    }
  };

  const fetchNextQuestion = async (
    profile: ConfirmedCompanyProfile,
    answers: InterviewAnswer[] = state.answers,
    questions: InterviewQuestion[] = state.questions,
  ) => {
    const gen = ++interviewGenRef.current;
    setBusy(true);
    setError(null);
    setAwaitingQuestion(true);
    try {
      const unresolvedUnknowns = Object.entries(profile.fields)
        .filter(([, field]) => field.status === "unresolved")
        .map(([key, field]) => `${key}: ${field.value}`);

      const data = await postInterviewNext({
        confirmedProfile: profile,
        previousQuestions: questions,
        previousAnswers: answers,
        unresolvedUnknowns,
      });
      if (gen !== interviewGenRef.current) return;
      if (data.done) {
        const allowed = canCompleteInterview({
          confirmedProfile: profile,
          previousQuestions: questions,
          previousAnswers: answers,
        });
        if (!allowed.ok) {
          throw new Error(
            `Interview cannot complete while core decisions are unresolved: ${allowed.unresolvedCoreCategories.join(", ")}.`,
          );
        }
        dispatch({ type: "INTERVIEW_COMPLETE" });
        await createBrief(profile, questions, answers, gen);
      } else {
        dispatch({ type: "ADD_QUESTION", question: data.question });
      }
    } catch (err) {
      if (gen !== interviewGenRef.current) return;
      dispatch({
        type: "SET_FAILURE",
        state: "MODEL_OUTPUT_INVALID",
        code: "MODEL_OUTPUT_INVALID",
      });
      setError(err instanceof Error ? err.message : "Interview failed");
    } finally {
      if (gen === interviewGenRef.current) {
        setBusy(false);
        setAwaitingQuestion(false);
      }
    }
  };

  const analyze = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const data = await postCompanyUnderstand(file);
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
      dispatch({
        type: "SET_FAILURE",
        state: "INGESTION_FAILED",
        code: "INGESTION_FAILED",
      });
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setBusy(false);
    }
  };

  const useSample = async () => {
    const file = await fetchSampleCompanyCsv();
    await analyze(file);
  };

  const retryNextQuestion = () => {
    if (!state.confirmedProfile) return;
    dispatch({ type: "SET_STAGE", stage: "INTERVIEWING" });
    void fetchNextQuestion(state.confirmedProfile, state.answers, state.questions);
  };

  const reopenQuestion = (questionIndex: number) => {
    const question = state.questions[questionIndex];
    if (!question || busy || awaitingQuestion) return;
    const prior = state.answers.find((a) => a.questionId === question.questionId) ?? null;
    interviewGenRef.current += 1;
    setError(null);
    setAwaitingQuestion(false);
    setBusy(false);
    setSeedAnswer(prior);
    dispatch({ type: "REOPEN_QUESTION", questionIndex });
  };

  const generatePrompt = async () => {
    if (!state.confirmedProfile || !state.researchBrief) return;
    setBusy(true);
    setError(null);
    dispatch({ type: "BEGIN_PROMPT_GENERATION" });
    try {
      const data = await postResearchPrompt({
        confirmedProfile: state.confirmedProfile,
        researchBrief: state.researchBrief,
      });
      dispatch({
        type: "SET_FINAL_PROMPT",
        prompt: data.structuredPrompt,
        formattedPrompt: data.formattedPrompt,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Prompt generation failed";
      const failure =
        /PROMPT_VALIDATION_FAILED|Prompt contract/i.test(message)
          ? ("PROMPT_VALIDATION_FAILED" as const)
          : ("MODEL_OUTPUT_INVALID" as const);
      dispatch({ type: "SET_FAILURE", state: failure, code: failure });
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const extractSupporting = async (
    file: File,
    question: InterviewQuestion,
  ): Promise<SupportingContext & { extractedCharCount?: number }> => {
    try {
      return await postDocumentExtract({
        file,
        questionId: question.questionId,
        question: question.question,
      });
    } catch (err) {
      dispatch({
        type: "SET_FAILURE",
        state: "DOCUMENT_EXTRACTION_FAILED",
        code: "DOCUMENT_EXTRACTION_FAILED",
      });
      throw err;
    }
  };

  // After restore from localStorage: if interview is stuck waiting for the next question, resume once.
  useEffect(() => {
    if (!hydrated || !restoredFromStorage || autoResumeDoneRef.current) return;
    if (!needsNextQuestion || !state.confirmedProfile) return;
    if (busy || awaitingQuestion) return;
    autoResumeDoneRef.current = true;
    if (
      state.currentStage === "MODEL_OUTPUT_INVALID" ||
      state.currentStage === "DOCUMENT_EXTRACTION_FAILED"
    ) {
      dispatch({ type: "SET_STAGE", stage: "INTERVIEWING" });
    }
    void fetchNextQuestion(state.confirmedProfile, state.answers, state.questions);
    // Intentionally run once after storage hydrate into a stuck interview gap.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot resume
  }, [hydrated, restoredFromStorage, needsNextQuestion, state.confirmedProfile]);

  return {
    analyze,
    useSample,
    fetchNextQuestion,
    createBrief,
    retryNextQuestion,
    reopenQuestion,
    generatePrompt,
    extractSupporting,
  };
}
