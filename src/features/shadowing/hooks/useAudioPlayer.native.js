import { useState, useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';

export function useAudioPlayer(uri) {
  const soundRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rate, setRate] = useState(1);

  useEffect(() => {
    let isMounted = true;
    let sound;
    (async () => {
      if (!uri) return;
      const { sound: s } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false, rate, shouldCorrectPitch: true },
        (statusUpdate) => {
          if (!statusUpdate.isLoaded || !isMounted) return;
          setProgress(
            statusUpdate.durationMillis
              ? statusUpdate.positionMillis / statusUpdate.durationMillis
              : 0
          );
          setIsPlaying(statusUpdate.isPlaying);
          if (statusUpdate.didJustFinish) setProgress(0);
        }
      );
      sound = s;
      soundRef.current = s;
    })();
    return () => {
      isMounted = false;
      sound?.unloadAsync();
    };
  }, [uri]);

  const play = useCallback(() => soundRef.current?.playFromPositionAsync(0), []);
  const pause = useCallback(() => soundRef.current?.pauseAsync(), []);
  const setPlaybackRate = useCallback((newRate) => {
    setRate(newRate);
    soundRef.current?.setRateAsync(newRate, true); // true = correct pitch, no chipmunk effect
  }, []);

  return { isPlaying, progress, rate, play, pause, setPlaybackRate };
}