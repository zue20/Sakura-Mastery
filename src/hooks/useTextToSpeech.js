import { useRef, useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

const SAFETY_TIMEOUT_MS = 8000;
const SILENT_FAILURE_CHECK_MS = 400;

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState(null);
  const safetyTimeoutRef = useRef(null);
  const checkTimeoutRef = useRef(null);
  const lastCallRef = useRef(null); // { text, opts } — for retry()

  const clearTimers = useCallback(() => {
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
      checkTimeoutRef.current = null;
    }
  }, []);

  const stopAndReset = useCallback(() => {
    clearTimers();
    setIsSpeaking(false);
  }, [clearTimers]);

  const cancel = useCallback(() => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } else {
      Speech.stop();
    }
    stopAndReset();
  }, [stopAndReset]);

  // The iOS speech engine can get permanently wedged if the tab is
  // backgrounded mid-utterance — cancel proactively rather than let it
  // wedge (the alternative is the user needing a full page refresh).
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return undefined;
    const onVisibilityChange = () => {
      if (document.hidden && window.speechSynthesis?.speaking) {
        window.speechSynthesis.cancel();
        stopAndReset();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [stopAndReset]);

  useEffect(() => () => cancel(), [cancel]);

  /**
   * Must be called directly from a user gesture handler (onPress, etc.)
   * — not from inside a promise chain, setTimeout, or async callback —
   * or iOS Safari will silently drop it.
   */
  const speak = useCallback(
    (text, opts = {}) => {
      if (!text) return;
      lastCallRef.current = { text, opts };

      const { lang = 'ja-JP', rate = 0.85, onEnd, onError } = opts;

      setError(null);
      clearTimers();

      const finish = (err) => {
        stopAndReset();
        if (err) {
          setError(err);
          onError && onError(err);
        } else {
          onEnd && onEnd();
        }
      };

      safetyTimeoutRef.current = setTimeout(() => finish(null), SAFETY_TIMEOUT_MS);

      if (Platform.OS !== 'web') {
        setIsSpeaking(true);
        Speech.stop();
        Speech.speak(text, {
          language: lang,
          rate,
          volume: 1.0,
          pitch: 1.0,
          onDone: () => finish(null),
          onStopped: () => finish(null),
          onError: () => finish('playback-failed'),
        });
        return;
      }

      if (typeof window === 'undefined' || !window.speechSynthesis) {
        finish('unsupported');
        return;
      }

      const synth = window.speechSynthesis;

      const doSpeak = () => {
        const utterance = new window.SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = rate;
        utterance.volume = 1.0;
        utterance.pitch = 1.0;
        utterance.onend = () => finish(null);
        utterance.onerror = (event) => {
          // Harmless — fired when a new utterance preempts an old one.
          if (event.error === 'interrupted' || event.error === 'canceled') return;
          finish(event.error === 'not-allowed' ? 'not-allowed' : 'playback-failed');
        };
        synth.speak(utterance);
        setIsSpeaking(true);

        // iOS occasionally accepts the call but never actually starts
        // speaking, with no error event fired at all — catch that.
        checkTimeoutRef.current = setTimeout(() => {
          if (!synth.speaking && !synth.pending) {
            finish('not-allowed');
          }
        }, SILENT_FAILURE_CHECK_MS);
      };

      if (synth.speaking || synth.pending) {
        synth.cancel();
        // queueMicrotask, NOT setTimeout: still separates cancel() from
        // speak() to dodge Safari's same-tick drop bug, but stays inside
        // the gesture's call stack so iOS doesn't reject speak() as
        // "not part of a user gesture."
        queueMicrotask(doSpeak);
      } else {
        doSpeak();
      }
    },
    [clearTimers, stopAndReset]
  );

  // Replays the last speak() call — wire this to a banner tap, which is
  // itself a fresh user gesture and can succeed on iOS even when the
  // original silent/blocked call failed.
  const retry = useCallback(() => {
    if (lastCallRef.current) {
      speak(lastCallRef.current.text, lastCallRef.current.opts);
    }
  }, [speak]);

  const isSupported =
    Platform.OS !== 'web' || (typeof window !== 'undefined' && !!window.speechSynthesis);

  return { speak, retry, cancel, isSpeaking, error, isSupported };
}