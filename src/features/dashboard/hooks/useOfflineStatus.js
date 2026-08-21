import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

// Cross-platform replacement for window.addEventListener('online'/'offline').
// Works on iOS, Android, and Expo Web.
export default function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });

    NetInfo.fetch().then((state) => {
      setIsOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });

    return () => unsubscribe();
  }, []);

  return isOnline;
}