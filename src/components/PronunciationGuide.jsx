import React, { useCallback, useEffect, useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../features/dashboard/theme';
import { kanaToRomaji, hasKanji } from '../utils/kanaToRomaji';
import { toHiraganaReading } from '../utils/kanjiReading';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import DeviceWarningBanner from './DeviceWarningBanner';
import { isIOSDevice, getIOSMajorVersion } from '../utils/deviceDetection';

function getAudioBannerMessage(error) {
  if (!error) return null;
  if (isIOSDevice()) {
    const v = getIOSMajorVersion();
    if (v && v <= 15) return 'Audio blocked on iOS 15. Tap here to enable sound.';
    return 'Audio blocked on this device. Tap here to enable sound.';
  }
  return 'Audio playback failed. Tap here to try again.';
}

export default function PronunciationGuide({
  text,
  lang = 'ja-JP',
  showListenButton = true,
  variant = 'card',
}) {
  const { speak, retry, isSpeaking, error } = useTextToSpeech();
  const [romaji, setRomaji] = useState(null);
  const requestIdRef = useRef(0);

  const handleListen = useCallback(() => {
    if (!text) return;
    speak(text, { lang });
  }, [text, lang, speak]);

  useEffect(() => {
    if (!text) {
      setRomaji(null);
      return undefined;
    }

    const requestId = ++requestIdRef.current;

    if (!hasKanji(text)) {
      // Kana-only — no dictionary lookup needed, resolve immediately.
      setRomaji(kanaToRomaji(text));
      return undefined;
    }

    // Contains kanji — resolve the reading first. Clear any stale
    // romaji from a previous phrase while this one loads.
    setRomaji(null);
    toHiraganaReading(text).then((hiragana) => {
      // Ignore this result if `text` changed again before it resolved.
      if (requestId !== requestIdRef.current) return;
      setRomaji(kanaToRomaji(hiragana)); // null if the fallback still has kanji in it
    });

    return undefined;
  }, [text]);

  if (!text || !romaji) return null;

  if (variant === 'compact') {
    return <Text style={styles.compactRomaji}>{romaji}</Text>;
  }

  const bannerMessage = getAudioBannerMessage(error);

  return (
    <View style={styles.container}>
      {showListenButton && (
        <Pressable onPress={handleListen} style={styles.listenBtn} accessibilityRole="button" accessibilityLabel="Listen to pronunciation">
          <Text style={styles.listenIcon}>{isSpeaking ? '🔊' : '🔈'}</Text>
          <Text style={styles.listenLabel}>{isSpeaking ? 'Playing…' : 'Listen'}</Text>
        </Pressable>
      )}

      <Text style={styles.kanaText}>{text}</Text>
      <Text style={styles.romajiText}>{romaji}</Text>

      {showListenButton && <DeviceWarningBanner message={bannerMessage} onPress={retry} actionLabel="Tap to retry" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'rgba(198,93,123,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.18)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginTop: 10,
    marginBottom: 10,
    gap: 4,
  },
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.blush,
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.3)',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  listenIcon: { fontSize: 14 },
  listenLabel: { fontFamily: FONTS.body, fontSize: 12, fontWeight: '700', color: COLORS.plum },
  kanaText: {
    fontFamily: FONTS.display,
    fontSize: 24,
    color: COLORS.deep,
    textAlign: 'center',
  },
  romajiText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.plum,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  compactRomaji: {
    fontFamily: FONTS.body,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.inkSoft,
    textAlign: 'center',
    marginTop: -4,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
});