import { useEffect, useState } from 'react';
import { getMyRole } from '../../../api/profilesService';
import { useAuthContext } from '../../../context/AuthContext';

export default function useIsAdmin() {
  const { state } = useAuthContext();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (!state.isAuthenticated) {
      setRole(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    getMyRole().then((r) => {
      if (!cancelled) {
        setRole(r);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [state.isAuthenticated, state.user?.id]);

  return { role, isAdmin: role === 'admin', loading };
}