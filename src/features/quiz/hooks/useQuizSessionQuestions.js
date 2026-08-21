import { useMemo, useState, useCallback } from 'react';
import { useFetchQuestions } from './useFetchQuestions';
import { buildQuizSession, QUIZ_SESSION_CONFIG } from '../quizSessionBuilder';
import { filterForQuiz } from '../utils/filterQuestionsByMode';

const SPEAKING_MODULE_TYPE = 'speaking';
const SPEAKING_SESSION_SIZE = 10;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function useQuizSessionQuestions({ moduleType, level }) {
  const { questions: allQuestions, reload } = useFetchQuestions({ moduleType, level });
  const [seed, setSeed] = useState(0);
  const isSpeaking = moduleType === SPEAKING_MODULE_TYPE;

  const quizQuestions = useMemo(() => {
    if (!Array.isArray(allQuestions)) return allQuestions; // preserve undefined (loading) / null (error) sentinels

    if (isSpeaking) {
      return shuffle(allQuestions).slice(0, SPEAKING_SESSION_SIZE);
    }

    // Quiz mode is graded/timed and has no canvas — writing-practice
    // question types (kanjiWrite, kanaWrite) must never enter this pool.
    const quizEligible = filterForQuiz(allQuestions);
    return buildQuizSession(quizEligible, QUIZ_SESSION_CONFIG);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allQuestions, seed, isSpeaking]);

  // Draws a brand-new random session from the already-fetched pool — no refetch needed.
  const reshuffle = useCallback(() => setSeed((n) => n + 1), []);

  return { questions: quizQuestions, reload, reshuffle };
}