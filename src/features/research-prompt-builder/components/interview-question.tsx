"use client";

import { StandardQuestionView } from "@/features/research-prompt-builder/components/interview-question/standard-question-view";
import { StrategicDirectionView } from "@/features/research-prompt-builder/components/interview-question/strategic-direction-view";
import type { ViewProps } from "@/features/research-prompt-builder/components/interview-question/types";

export { INTERVIEW_SHORT_FORM } from "@/features/research-prompt-builder/components/interview-shared";

export function InterviewQuestionView(props: ViewProps) {
  if (props.question.questionKind === "strategic_direction") {
    return <StrategicDirectionView {...props} />;
  }
  return <StandardQuestionView {...props} />;
}
