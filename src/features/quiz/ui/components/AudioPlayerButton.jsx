import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Pressable, Text, StyleSheet, Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { COLORS, FONTS } from '../../../dashboard/theme';

const SAFETY_TIMEOUT_MS = 8000;
const CANCEL_SPEAK_GAP_MS = 50; // works around a Safari bug where cancel()+speak() in the same tick silently drops the utterance

export default function AudioPlayerButton({ text, lang = 'ja-JP', size = 'default' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const safetyTimeoutRef = useRef(null);
  const gapTimeoutRef = useRef(null);

  const clearTimers = useCallback(() => {
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
    if (gapTimeoutRef.current) {
      clearTimeout(gapTimeoutRef.current);
      gapTimeoutRef.current = null;
    }
  }, []);

  const stopAndReset = useCallback(() => {
    clearTimers();
    setIsPlaying(false);
  }, [clearTimers]);

  const stopPlayback = useCallback(() => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } else {
      Speech.stop();
    }
  }, []);

  useEffect(() => {
    return () => {
      stopPlayback();
      clearTimers();
    };
  }, [text, stopPlayback, clearTimers]);

  const handlePress = useCallback(() => {
    if (!text) return;

    setErrorMessage(null);
    stopPlayback();
    clearTimers();
    setIsPlaying(true);

    safetyTimeoutRef.current = setTimeout(() => {
      stopAndReset();
    }, SAFETY_TIMEOUT_MS);

    // --- Web path (including Safari desktop/iOS) ---
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        setErrorMessage('Audio is not supported in this browser.');
        stopAndReset();
        return;
      }

      // Small gap after cancel() before speak() — this specific delay is
      // what actually fixes the Safari "silent drop" bug. It's still
      // considered part of the same user gesture by WebKit as long as
      // it's short and there's no network/await in between.
      gapTimeoutRef.current = setTimeout(() => {
        const utterance = new window.SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.85;
        utterance.volume = 1.0;
        utterance.pitch = 1.0;

        utterance.onend = stopAndReset;
        utterance.onerror = (event) => {
          // Safari fires 'interrupted'/'canceled' harmlessly when a new
          // utterance preempts an old one — don't show those as errors.
          if (event.error !== 'interrupted' && event.error !== 'canceled') {
            setErrorMessage(
              event.error === 'not-allowed'
                ? 'Tap the button again to enable audio.'
                : 'Audio playback failed. Please try again.'
            );
          }
          stopAndReset();
        };

        window.speechSynthesis.speak(utterance);
      }, CANCEL_SPEAK_GAP_MS);
      return;
    }

    // --- Native path (iOS/Android app builds via Expo) ---
    Speech.speak(text, {
      language: lang,
      rate: 0.85,
      volume: 1.0,
      pitch: 1.0,
      onDone: stopAndReset,
      onStopped: stopAndReset,
      onError: () => {
        setErrorMessage('Audio playback failed. Please try again.');
        stopAndReset();
      },
    });
  }, [text, lang, stopPlayback, clearTimers, stopAndReset]);

  const isCompactSize = size === 'compact';

  return (
    <>
      <Pressable
        onPress={handlePress}
        style={[styles.btn, isCompactSize && styles.btnCompact, isPlaying && styles.btnPlaying]}
        accessibilityRole="button"
        accessibilityLabel="Play audio"
      >
        <Text style={[styles.icon, isCompactSize && styles.iconCompact]}>
          {isPlaying ? '🔊' : '🔈'}
        </Text>
      </Pressable>
      {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.blush,
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCompact: { width: 40, height: 40, borderRadius: 20 },
  btnPlaying: { backgroundColor: COLORS.pink },
  icon: { fontSize: 22 },
  iconCompact: { fontSize: 17 },
  errorText: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 6,
  },
});