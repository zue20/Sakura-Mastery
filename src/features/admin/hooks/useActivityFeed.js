import { useState, useEffect, useCallback } from 'react';
import { getRecentActions } from '../../../api/activityService';
import { supabase } from '../../../api/supabaseClient';

export default function useActivityFeed() {
  const [actions, setActions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await getRecentActions();
      setActions(results);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const channel = supabase
      .channel('admin_actions_feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_actions' }, (payload) => {
        setActions((prev) => [payload.new, ...prev].slice(0, 30));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  return { actions, isLoading, error, refresh };
}