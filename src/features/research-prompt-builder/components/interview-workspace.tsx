"use client";

import { InterviewQuestionView } from "@/features/research-prompt-builder/components/interview-question";
import { forDisplay } from "@/features/research-prompt-builder/components/interview-shared";
import type {
  InterviewAnswer,
  InterviewQuestion,
  SupportingContext,
} from "@/features/research-prompt-builder/types";

function trailSummary(question: InterviewQuestion, answer: InterviewAnswer): string {
  if (question.questionKind === "strategic_direction") {
    const titles = question.strategicSuggestions
      .filter((card) => answer.selectedSuggestionIds.includes(card.suggestionId))
      .map((card) => card.title);
    if (answer.customDirection?.trim()) {
      titles.push(answer.customDirection.trim());
    }
    if (titles.length === 0) return forDisplay(answer.answerText).slice(0, 120);
    return titles.join(" · ");
  }
  const text = forDisplay(answer.answerText);
  return text.length > 140 ? `${text.slice(0, 139).trimEnd()}…` : text;
}

function trailLabel(question: InterviewQuestion): string {
  if (question.questionKind === "strategic_direction") return "Strategic directions";
  return `Decision ${question.sequenceNumber}`;
}

type Props = {
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  currentQuestionIndex: number;
  currentQuestion: InterviewQuestion;
  seedAnswer?: InterviewAnswer | null;
  busy: boolean;
  error?: string | null;
  locked?: boolean;
  statusMessage?: string | null;
  onRetry?: () => void;
  canBuildBrief?: boolean;
  onBuildBrief?: () => void;
  onSave: (answer: InterviewAnswer) => void;
  onExtract: (file: File) => Promise<SupportingContext & { extractedCharCount?: number }>;
  onReopen: (questionIndex: number) => void;
};

export function InterviewWorkspace({
  questions,
  answers,
  currentQuestionIndex,
  currentQuestion,
  seedAnswer = null,
  busy,
  error,
  locked = false,
  statusMessage,
  onRetry,
  canBuildBrief,
  onBuildBrief,
  onSave,
  onExtract,
  onReopen,
}: Props) {
  const trail = questions.slice(0, currentQuestionIndex).flatMap((question, index) => {
    const answer = answers.find((a) => a.questionId === question.questionId);
    if (!answer) return [];
    return [{ question, answer, index }];
  });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
          Decide
        </p>
        <p className="text-sm text-stone-600">
          One continuous focus-building step. Earlier decisions stay here so you can change
          them without leaving Decide.
        </p>
      </header>

      {trail.length > 0 ? (
        <section aria-label="Decisions so far" className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
            Locked so far
          </p>
          <ol className="space-y-2">
            {trail.map(({ question, answer, index }) => (
              <li
                key={question.questionId}
                className="flex items-start justify-between gap-3 border-b border-stone-200 pb-2"
              >
                <div className="min-w-0 space-y-1">
                  <p className="text-xs font-medium text-stone-500">
                    {trailLabel(question)}
                  </p>
                  <p className="text-sm leading-snug text-stone-800">
                    {trailSummary(question, answer)}
                  </p>
                </div>
                <button
                  type="button"
                  className="shrink-0 text-xs font-medium text-stone-600 underline-offset-2 hover:text-stone-900 hover:underline disabled:opacity-50"
                  disabled={busy}
                  onClick={() => onReopen(index)}
                >
                  Change
                </button>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section aria-label="Current decision" className="space-y-3">
        {trail.length > 0 ? (
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
            Next decision
          </p>
        ) : null}
        <InterviewQuestionView
          key={`${currentQuestion.questionId}:${seedAnswer?.answeredAt ?? "fresh"}`}
          question={currentQuestion}
          seedAnswer={seedAnswer}
          busy={busy}
          error={error}
          locked={locked}
          statusMessage={statusMessage}
          onRetry={onRetry}
          canBuildBrief={canBuildBrief}
          onBuildBrief={onBuildBrief}
          onSave={onSave}
          onExtract={onExtract}
        />
      </section>
    </div>
  );
}
