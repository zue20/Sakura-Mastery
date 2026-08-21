import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';
import { COLORS, FONTS } from '../../../dashboard/theme';

const SAFETY_TIMEOUT_MS = 8000;

export default function AudioPlayerButton({ text, lang = 'ja-JP', size = 'default' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const safetyTimeoutRef = useRef(null);

  const clearSafetyTimeout = useCallback(() => {
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
  }, []);

  const stopAndReset = useCallback(() => {
    clearSafetyTimeout();
    setIsPlaying(false);
  }, [clearSafetyTimeout]);

  useEffect(() => {
    return () => {
      Speech.stop();
      clearSafetyTimeout();
    };
  }, [text, clearSafetyTimeout]);

  const handlePress = useCallback(() => {
    if (!text) return;

    // iOS Safari can leave a previous utterance in a stuck/queued state —
    // always cancel before starting a new one, even on the very first tap.
    Speech.stop();
    clearSafetyTimeout();

    setIsPlaying(true);

    safetyTimeoutRef.current = setTimeout(() => {
      stopAndReset();
    }, SAFETY_TIMEOUT_MS);

    Speech.speak(text, {
      language: lang,
      rate: 0.85,
      volume: 1.0,
      pitch: 1.0,
      onDone: stopAndReset,
      onStopped: stopAndReset,
      onError: stopAndReset,
    });
  }, [text, lang, clearSafetyTimeout, stopAndReset]);

  const isCompactSize = size === 'compact';

  return (
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
});