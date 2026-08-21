import { useState, useEffect, useCallback } from 'react';
import { getAllSettings, updateSetting } from '../../../api/settingsService';

export default function useAdminSettings() {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAllSettings();
      setSettings(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = useCallback(async (key, value) => {
    setIsSaving(true);
    try {
      await updateSetting(key, value);
      setSettings((prev) => ({ ...prev, [key]: value }));
    } finally {
      setIsSaving(false);
    }
  }, []);

  return { settings, isLoading, error, isSaving, save, refresh };
}