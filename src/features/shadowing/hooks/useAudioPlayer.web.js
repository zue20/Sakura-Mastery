import { useState, useRef, useCallback, useEffect } from 'react';

export function useAudioPlayer(uri) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rate, setRate] = useState(1);

  useEffect(() => {
    if (!uri) return;
    const audio = new Audio(uri);
    audio.playbackRate = rate;
    audio.ontimeupdate = () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    };
    audio.onended = () => {
      setIsPlaying(false);
      setProgress(0);
    };
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [uri]);

  const play = useCallback(() => {
    audioRef.current?.play();
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const setPlaybackRate = useCallback((newRate) => {
    setRate(newRate);
    if (audioRef.current) audioRef.current.playbackRate = newRate;
  }, []);

  return { isPlaying, progress, rate, play, pause, setPlaybackRate };
}