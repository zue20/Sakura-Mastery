import { useEffect, useState } from 'react';
import { supabase } from '../../../api/supabaseClient';

export default function useAdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const [usersResult, questionsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('questions').select('level, module_type'),
      ]);

      if (cancelled) return;

      if (usersResult.error || questionsResult.error) {
        setError(usersResult.error?.message || questionsResult.error?.message);
        setLoading(false);
        return;
      }

      const questions = questionsResult.data || [];
      const byLevel = {};
      for (const q of questions) {
        byLevel[q.level] = (byLevel[q.level] || 0) + 1;
      }

      setStats({
        totalUsers: usersResult.count ?? 0,
        totalQuestions: questions.length,
        byLevel,
      });
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { stats, loading, error };
}