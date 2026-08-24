import { useReducer, useCallback, useMemo, useEffect } from 'react';

export const QuestionType = {
  DRAG_DROP: 'dragdrop',
  MULTIPLE_CHOICE: 'multipleChoice',
  KANJI_WRITE: 'kanjiWrite',
  KANA_WRITE: 'kanaWrite',
  SPEAKING: 'speaking',
};

export const QuizStatus = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export const AnswerState = {
  UNANSWERED: 'unanswered',
  CORRECT: 'correct',
  INCORRECT: 'incorrect',
};

export const QuizPhase = {
  LOADING: 'loading',
  ERROR: 'error',
  EMPTY: 'empty',
  READY: 'ready',
};

function checkAnswer(question, workingAnswer) {
  if (!workingAnswer) return false;

  if (question.type === QuestionType.DRAG_DROP) {
    if (!Array.isArray(workingAnswer)) return false;
    if (workingAnswer.length !== question.correctOrder.length) return false;
    return workingAnswer.every((word, i) => word === question.correctOrder[i]);
  }

  if (question.type === QuestionType.MULTIPLE_CHOICE) {
    return workingAnswer === question.correctOptionId;
  }

  if (question.type === QuestionType.KANJI_WRITE) {
    // Hanzi Writer's quiz() mode grades stroke-by-stroke internally and only
    // fires onComplete once every stroke has been traced and accepted, so
    // reaching `completed: true` is itself the pass condition.
    return workingAnswer?.completed === true;
  }

  if (question.type === QuestionType.KANA_WRITE) {
    // Kana has no Hanzi Writer stroke data (CDN only covers kanji/hanzi), so
    // this falls back to the old freehand-canvas check: did they draw
    // something covering enough of the box, with roughly the right number
    // of strokes for this character.
    if (!workingAnswer?.attempted) return false;
    const expected = question.data?.strokeCount;
    if (!expected) return true;
    const drawn = workingAnswer.strokeCount ?? 0;
    return Math.abs(drawn - expected) <= 1;
  }

    if (question.type === QuestionType.SPEAKING) {
    
    if (workingAnswer?.accuracy === null) return true;
    return (workingAnswer?.accuracy ?? 0) >= 70;
  }

  return false;
}

function createInitialState(questions) {
  const safeQuestions = Array.isArray(questions) ? questions : [];
  const questionsById = {};
  safeQuestions.forEach((q) => { questionsById[q.id] = q; });

  return {
    questionsById,
    totalCount: safeQuestions.length,
    // No `isRetry` field — regular quizzes never re-queue a missed
    // question. Each question is asked exactly once.
    queue: safeQuestions.map((q) => ({ id: q.id })),
    answers: {},
    results: {},
    solvedIds: [],
    missedIds: [],
    awaitingContinue: false,
    status: safeQuestions.length ? QuizStatus.IN_PROGRESS : QuizStatus.COMPLETED,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ANSWER':
      return { ...state, answers: { ...state.answers, [action.questionId]: action.value } };

    case 'LOAD_QUESTIONS':
      return createInitialState(action.questions);

    case 'SUBMIT': {
      const entry = state.queue[0];
      if (!entry || state.awaitingContinue) return state;

      const question = state.questionsById[entry.id];
      const workingAnswer = state.answers[entry.id];
      const isCorrect = action.forced ? false : checkAnswer(question, workingAnswer);
      const results = { ...state.results, [entry.id]: isCorrect ? AnswerState.CORRECT : AnswerState.INCORRECT };

      if (isCorrect) {
        const solvedIds = state.solvedIds.includes(entry.id) ? state.solvedIds : [...state.solvedIds, entry.id];
        return { ...state, results, solvedIds, awaitingContinue: true };
      }

      const missedIds = state.missedIds.includes(entry.id) ? state.missedIds : [...state.missedIds, entry.id];
      return { ...state, results, missedIds, awaitingContinue: true, lastWasIncorrect: true };
    }

    case 'CONTINUE': {
      if (!state.awaitingContinue) return state;
      const entry = state.queue[0];
      if (!entry) return state;

      const queue = state.queue.slice(1);
      const answers = { ...state.answers };
      delete answers[entry.id];

      return {
        ...state,
        queue,
        answers,
        awaitingContinue: false,
        status: queue.length === 0 ? QuizStatus.COMPLETED : state.status,
      };
    }

    case 'FAIL':
      return { ...state, status: QuizStatus.FAILED, awaitingContinue: false };

    case 'UNFAIL':
      return state.status === QuizStatus.FAILED
        ? { ...state, status: QuizStatus.IN_PROGRESS }
        : state;

    default:
      return state;
  }
}

export function useQuizQuestions(questions) {
  const [state, dispatch] = useReducer(reducer, questions, createInitialState);

  useEffect(() => {
    if (Array.isArray(questions)) {
      dispatch({ type: 'LOAD_QUESTIONS', questions });
    }
  }, [questions]);

  const phase = useMemo(() => {
    if (questions === undefined) return QuizPhase.LOADING;
    if (!Array.isArray(questions)) return QuizPhase.ERROR;
    if (questions.length === 0) return QuizPhase.EMPTY;
    return QuizPhase.READY;
  }, [questions]);

  const currentEntry = state.queue[0] ?? null;
  const currentQuestion = currentEntry ? state.questionsById[currentEntry.id] : null;
  const currentResult = currentEntry ? (state.results[currentEntry.id] ?? AnswerState.UNANSWERED) : null;
  const workingAnswer = currentEntry ? state.answers[currentEntry.id] : undefined;

  const progress = useMemo(() => {
    const consumed = state.totalCount - state.queue.length;
    return {
      current: Math.min(consumed + 1, state.totalCount),
      total: state.totalCount,
      percent: state.totalCount ? Math.round((consumed / state.totalCount) * 100) : 0,
    };
  }, [state.queue.length, state.totalCount]);

  const summary = useMemo(() => ({
    total: state.totalCount,
    mistakes: state.missedIds.length,
  }), [state.totalCount, state.missedIds]);

  const canSubmit = useMemo(() => {
    if (!currentQuestion) return false;
    if (currentQuestion.type === QuestionType.DRAG_DROP) {
      return (workingAnswer?.length ?? 0) === currentQuestion.correctOrder.length;
    }
    if (currentQuestion.type === QuestionType.KANJI_WRITE) {
      // Require full completion (Hanzi Writer's onComplete), not just a
      // first stroke — otherwise "Check Answer" unlocks mid-trace, before
      // the character is actually finished.
      return !!workingAnswer?.completed;
    }
    if (currentQuestion.type === QuestionType.KANA_WRITE) {
      // No completion signal available for kana (freehand canvas) — same
      // gating as the old canvas: enabled once something's been drawn.
      return !!workingAnswer?.attempted;
    }
    if (currentQuestion.type === QuestionType.SPEAKING) {
      return !!workingAnswer?.attempted;
    }
    return !!workingAnswer;
  }, [currentQuestion, workingAnswer]);

  const setAnswer = useCallback((value) => {
    if (!currentEntry) return;
    dispatch({ type: 'SET_ANSWER', questionId: currentEntry.id, value });
  }, [currentEntry]);

  const submit = useCallback((forced = false) => {
    if (!currentQuestion) return null;
    const workingAnswerNow = currentEntry ? state.answers[currentEntry.id] : undefined;
    const wasCorrect = forced ? false : checkAnswer(currentQuestion, workingAnswerNow);
    dispatch({ type: 'SUBMIT', forced });
    return wasCorrect;
  }, [currentQuestion, currentEntry, state.answers]);

  const continueNext = useCallback(() => dispatch({ type: 'CONTINUE' }), []);
  const fail = useCallback(() => dispatch({ type: 'FAIL' }), []);
  const unfail = useCallback(() => dispatch({ type: 'UNFAIL' }), []);

  return {
    phase,
    status: state.status,
    currentQuestion,
    workingAnswer,
    currentResult,
    awaitingContinue: state.awaitingContinue,
    progress,
    summary,
    canSubmit,
    setAnswer,
    submit,
    continueNext,
    fail,
    unfail,
  };
}