import { useState, useEffect, useCallback } from 'react';
import { questionsService } from '../../../api/questionsService';

/**
 * Fetches questions for a given module/level directly from Supabase.
 * Returns undefined while loading, null on error, or the array when ready —
 * matching exactly what useQuizQuestions' QuizPhase system expects.
 */
export function useFetchQuestions({ moduleType, level }) {
  const [questions, setQuestions] = useState(undefined);

  const load = useCallback(async () => {
    setQuestions(undefined); // reset to loading state
    try {
      const data = await questionsService.getAll({ moduleType, level });
      setQuestions(data);
    } catch (err) {
      setQuestions(null); // triggers QuizPhase.ERROR
    }
  }, [moduleType, level]);

  useEffect(() => {
    if (moduleType && level) {
      load();
    }
  }, [load, moduleType, level]);

  return { questions, reload: load };
}