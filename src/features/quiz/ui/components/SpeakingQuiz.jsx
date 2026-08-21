import React from 'react';
import PracticeMode from './PracticeMode';
import QuizMode from './QuizMode';

export default function SpeakingQuiz({ question, workingAnswer, onChange, disabled, mode }) {
  if (mode === 'quiz') {
    return (
      <QuizMode
        question={question}
        workingAnswer={workingAnswer}
        onChange={onChange}
        disabled={disabled}
      />
    );
  }
  return <PracticeMode question={question} />;
}