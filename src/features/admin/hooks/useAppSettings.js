import { useEffect, useState } from 'react';
import { getAllSettings } from '../../../api/settingsService';

export default function useAppSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getAllSettings()
      .then((result) => {
        if (!cancelled) setSettings(result);
      })
      .catch((err) => {
        console.warn('useAppSettings failed:', err.message);
        if (!cancelled) setSettings({}); // fail open — don't block the app if settings can't load
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { settings, loading };
}