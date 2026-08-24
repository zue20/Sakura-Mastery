// src/features/shadowing/ui/TTSAudioRow.web.js
import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../dashboard/theme';
import { useTextToSpeech } from '../../../hooks/useTextToSpeech';
import DeviceWarningBanner from '../../../components/DeviceWarningBanner';
import { isIOSDevice, getIOSMajorVersion } from '../../../utils/deviceDetection';

function getAudioBannerMessage(error) {
  if (!error) return null;
  if (isIOSDevice()) {
    const v = getIOSMajorVersion();
    if (v && v <= 15) return 'Audio blocked on iOS 15. Tap here to enable sound.';
    return 'Audio blocked on this device. Tap here to enable sound.';
  }
  return 'Audio playback failed. Tap here to try again.';
}

export function TTSAudioRow({ text, lang = 'ja-JP', showSpeedToggle = true }) {
  const [rate, setRate] = React.useState(1);
  const { speak, retry, isSpeaking, error } = useTextToSpeech();

  const play = useCallback(() => {
    speak(text, { lang, rate });
  }, [speak, text, lang, rate]);

  const toggleSpeed = () => setRate((r) => (r === 1 ? 0.75 : 1));

  const bannerMessage = getAudioBannerMessage(error);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Native audio</Text>
      <View style={styles.row}>
        <Pressable onPress={play} style={styles.playBtn}>
          <Text style={styles.playIcon}>{isSpeaking ? '❙❙' : '▶'}</Text>
        </Pressable>
        <Text style={styles.phraseText}>{text}</Text>
        {showSpeedToggle && (
          <Pressable onPress={toggleSpeed} style={styles.speedBtn}>
            <Text style={styles.speedText}>{rate === 1 ? '1.0x' : '0.75x'}</Text>
          </Pressable>
        )}
      </View>
      <DeviceWarningBanner message={bannerMessage} onPress={retry} actionLabel="Tap to retry" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontSize: 12, color: COLORS.textMuted, marginBottom: 6, ...FONTS.medium },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface2,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 10,
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { fontSize: 12, color: COLORS.accent },
  phraseText: { flex: 1, fontSize: 15, color: COLORS.text },
  speedBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: COLORS.surface1 },
  speedText: { fontSize: 12, color: COLORS.textSecondary, ...FONTS.medium },
});