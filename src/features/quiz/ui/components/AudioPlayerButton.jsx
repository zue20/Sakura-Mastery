import React, { useCallback } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../../dashboard/theme';
import { useTextToSpeech } from '../../../../hooks/useTextToSpeech';
import DeviceWarningBanner from '../../../../components/DeviceWarningBanner';
import { isIOSDevice, getIOSMajorVersion } from '../../../../utils/deviceDetection';

function getAudioBannerMessage(error) {
  if (!error) return null;
  if (isIOSDevice()) {
    const v = getIOSMajorVersion();
    if (v && v <= 15) return 'Audio blocked on iOS 15. Tap here to enable sound.';
    return 'Audio blocked on this device. Tap here to enable sound.';
  }
  return 'Audio playback failed. Tap here to try again.';
}

export default function AudioPlayerButton({ text, lang = 'ja-JP', size = 'default' }) {
  const { speak, retry, isSpeaking, error } = useTextToSpeech();

  const handlePress = useCallback(() => {
    if (!text) return;
    speak(text, { lang });
  }, [text, lang, speak]);

  const isCompactSize = size === 'compact';
  const bannerMessage = getAudioBannerMessage(error);

  return (
    <>
      <Pressable
        onPress={handlePress}
        style={[styles.btn, isCompactSize && styles.btnCompact, isSpeaking && styles.btnPlaying]}
        accessibilityRole="button"
        accessibilityLabel="Play audio"
      >
        <Text style={[styles.icon, isCompactSize && styles.iconCompact]}>
          {isSpeaking ? '🔊' : '🔈'}
        </Text>
      </Pressable>
      <DeviceWarningBanner message={bannerMessage} onPress={retry} actionLabel="Tap to retry" />
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
});