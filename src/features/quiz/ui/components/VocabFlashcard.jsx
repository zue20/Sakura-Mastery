import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { COLORS, FONTS } from '../../../dashboard/theme';
import { useTextToSpeech } from '../../../../hooks/useTextToSpeech';
import DeviceWarningBanner from '../../../../components/DeviceWarningBanner';
import PronunciationGuide from '../../../../components/PronunciationGuide';
import { isIOSDevice, getIOSMajorVersion } from '../../../../utils/deviceDetection';

const CARD_WIDTH = 340;
const CARD_HEIGHT = 360; // was 320 — extra room so the romaji line doesn't crowd "Tap to flip"

function getAudioBannerMessage(error) {
  if (!error) return null;
  if (isIOSDevice()) {
    const v = getIOSMajorVersion();
    if (v && v <= 15) return 'Audio blocked on iOS 15. Tap here to enable sound.';
    return 'Audio blocked on this device. Tap here to enable sound.';
  }
  return 'Audio playback failed. Tap here to try again.';
}

export default function VocabFlashcard({ front, back, imageUrl, audio, isFlipped, onFlip, questionId }) {
  const rotation = useSharedValue(isFlipped ? 180 : 0);
  const hasAutoPlayedRef = useRef(false);
  const { speak, retry, error } = useTextToSpeech();

  useEffect(() => {
    rotation.value = withTiming(isFlipped ? 180 : 0, { duration: 400 });
    if (!isFlipped) {
      hasAutoPlayedRef.current = false;
    }
  }, [isFlipped]);

  // The tap handler IS the user gesture — flip state and speech both
  // originate here, synchronously, so speak() stays inside the gesture
  // chain that iOS Safari requires.
  const handleCardPress = useCallback(() => {
    const nextIsFlipped = !isFlipped;
    onFlip(nextIsFlipped);

    if (nextIsFlipped && audio?.text && !hasAutoPlayedRef.current) {
      hasAutoPlayedRef.current = true;
      speak(audio.text, { lang: audio.lang });
    }
  }, [isFlipped, onFlip, audio, speak]);

  const frontStyle = useAnimatedStyle(() => {
    const rotateY = `${rotation.value}deg`;
    const opacity = interpolate(rotation.value, [0, 90, 91, 180], [1, 1, 0, 0]);
    return { transform: [{ perspective: 1000 }, { rotateY }], opacity };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotateY = `${rotation.value + 180}deg`;
    const opacity = interpolate(rotation.value, [0, 89, 90, 180], [0, 0, 1, 1]);
    return { transform: [{ perspective: 1000 }, { rotateY }], opacity };
  });

  const bannerMessage = getAudioBannerMessage(error);

  return (
    <View style={styles.outerWrap}>
      <Pressable onPress={handleCardPress} style={styles.cardWrap}>
        <Animated.View style={[styles.face, frontStyle]}>
          <Text style={styles.label}>Vocabulary</Text>
          {!!imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />}
          <Text style={styles.frontText}>{front}</Text>
          <View style={styles.romajiWrap}>
            <PronunciationGuide text={front} lang={audio?.lang ?? 'ja-JP'} variant="compact" />
          </View>
          <Text style={styles.tapHint}>Tap to flip</Text>
        </Animated.View>
        <Animated.View style={[styles.face, styles.faceBack, backStyle]}>
          <Text style={styles.backText}>{back}</Text>
          <Text style={styles.tapHint}>Tap to flip back</Text>
        </Animated.View>
      </Pressable>
      <DeviceWarningBanner message={bannerMessage} onPress={retry} actionLabel="Tap to retry" />
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrap: { width: CARD_WIDTH, alignItems: 'center' },
  cardWrap: { width: CARD_WIDTH, height: CARD_HEIGHT },
  face: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.paperStrong,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 40, // extra clearance above the absolutely-positioned tapHint
    gap: 10,
    backfaceVisibility: 'hidden',
    shadowColor: '#3A2C33',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 5,
  },
  faceBack: { backgroundColor: COLORS.blush },
  label: {
    fontFamily: FONTS.body,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  image: { width: 160, height: 160, marginBottom: 4, borderRadius: 14 }, // was 180x180 — slightly smaller to make room
  frontText: { fontFamily: FONTS.display, fontSize: 26, color: COLORS.deep, textAlign: 'center' },
  romajiWrap: {
    marginTop: 2,
    marginBottom: 6,
  },
  backText: { fontFamily: FONTS.body, fontSize: 18, fontWeight: '700', color: COLORS.plum, textAlign: 'center' },
  tapHint: { position: 'absolute', bottom: 14, fontFamily: FONTS.body, fontSize: 11, color: COLORS.inkSoft },
});