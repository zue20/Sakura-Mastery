// src/features/quiz/components/quiz-types/QuestionRenderer.jsx
import React from 'react';
import MultipleChoiceQuiz from '../../ui/components/MultipleChoiceQuiz';
import CanvasWritingQuiz from '../../ui/components/CanvasWritingQuiz';
import { WRITING_TYPES } from '../../utils/filterQuestionsByMode';

export default function QuestionRenderer({
  question,
  workingAnswer,
  onChange,
  disabled,
  revealCorrect,
  isCompact,
}) {
  if (!question) return null;

  const isWriting = WRITING_TYPES.includes(question.type);

  if (isWriting) {
    return (
      <CanvasWritingQuiz
        question={question}
        workingAnswer={workingAnswer}
        onChange={onChange}
        disabled={disabled}
      />
    );
  }

  return (
    <MultipleChoiceQuiz
      question={question}
      workingAnswer={workingAnswer}
      onChange={onChange}
      disabled={disabled}
      revealCorrect={revealCorrect}
      isCompact={isCompact}
    />
  );
}