import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Countdown timer for a single question.
 * Pure timer concern only — knows nothing about hearts, XP, or questions.
 *
 * @param {Object} options
 * @param {number} options.duration - seconds per question
 * @param {boolean} options.isPaused - pause the countdown (e.g. while showing feedback)
 * @param {*} options.resetKey - change this value (e.g. question id) to restart the timer
 * @param {Function} options.onTimeout - called once when the timer hits 0
 */
export function useQuizTimer({ duration, isPaused, resetKey, onTimeout }) {
  const [secondsLeft, setSecondsLeft] = useState(duration);
  const intervalRef = useRef(null);
  const onTimeoutRef = useRef(onTimeout);
  const hasFiredRef = useRef(false);

  // Keep the latest callback without re-triggering the effect below
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

 
  useEffect(() => {
    hasFiredRef.current = false;
    setSecondsLeft(duration);
    clearInterval(intervalRef.current);

    if (isPaused) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          if (!hasFiredRef.current) {
            hasFiredRef.current = true;
            onTimeoutRef.current?.();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [resetKey, isPaused, duration]);

  const reset = useCallback(() => setSecondsLeft(duration), [duration]);

  return {
    secondsLeft,
    percentLeft: Math.max(0, Math.round((secondsLeft / duration) * 100)),
    isUrgent: secondsLeft <= 5,
    reset,
  };
}