import { useState, useCallback, useEffect, useMemo } from 'react';
import { questionsService } from '../../../api/questionsService';
import { logAction } from '../../../api/activityService';

export function useAdminQuestions(filters = {}) {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const moduleType = filters.moduleType;
  const level = filters.level;

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await questionsService.getAll({ moduleType, level });
      setQuestions(results);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [moduleType, level]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addQuestion = useCallback(async (questionData) => {
    const created = await questionsService.create(questionData);
    logAction({ action: 'question_created', targetType: 'question', targetLabel: questionData.prompt });
    await refresh();
    return created;
  }, [refresh]);

  const updateQuestion = useCallback(async (id, updates) => {
    const updated = await questionsService.update(id, updates);
    logAction({ action: 'question_updated', targetType: 'question', targetLabel: updates.prompt });
    await refresh();
    return updated;
  }, [refresh]);

  const deleteQuestion = useCallback(async (id) => {
    await questionsService.delete(id);
    logAction({ action: 'question_deleted', targetType: 'question', targetLabel: id });
    await refresh();
    return true;
  }, [refresh]);

  const stats = useMemo(() => ({
    total: questions.length,
    byModuleType: questions.reduce((acc, q) => {
      acc[q.moduleType] = (acc[q.moduleType] || 0) + 1;
      return acc;
    }, {}),
  }), [questions]);

  return {
    questions,
    isLoading,
    error,
    stats,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    refresh,
  };
}