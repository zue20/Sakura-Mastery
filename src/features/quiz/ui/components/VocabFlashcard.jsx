import React, { useRef, useCallback, useEffect } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import * as Speech from 'expo-speech';
import { COLORS, FONTS } from '../../../dashboard/theme';

const CARD_WIDTH = 340;
const CARD_HEIGHT = 320;
const CANCEL_SPEAK_GAP_MS = 50; // Safari drops speak() if it fires in the same tick as cancel()

export default function VocabFlashcard({ front, back, imageUrl, audio, isFlipped, onFlip, questionId }) {
  const rotation = useSharedValue(isFlipped ? 180 : 0);
  const hasAutoPlayedRef = useRef(false);
  const gapTimeoutRef = useRef(null);

  // Only handles the flip ANIMATION now — speech was moved out of here
  // and into handleCardPress below, since firing speak() from inside a
  // useEffect (triggered by state change, not a direct tap) breaks the
  // "user gesture" chain that Safari/iOS requires for speechSynthesis.
  useEffect(() => {
    rotation.value = withTiming(isFlipped ? 180 : 0, { duration: 400 });
    if (!isFlipped) {
      hasAutoPlayedRef.current = false;
    }
  }, [isFlipped]);

  useEffect(() => {
    return () => {
      if (gapTimeoutRef.current) clearTimeout(gapTimeoutRef.current);
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
      } else {
        Speech.stop();
      }
    };
  }, []);

  const speakNow = useCallback((text, lang) => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;

      window.speechSynthesis.cancel();
      if (gapTimeoutRef.current) clearTimeout(gapTimeoutRef.current);

      gapTimeoutRef.current = setTimeout(() => {
        const utterance = new window.SpeechSynthesisUtterance(text);
        utterance.lang = lang ?? 'ja-JP';
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
      }, CANCEL_SPEAK_GAP_MS);
      return;
    }

    Speech.stop();
    Speech.speak(text, { language: lang ?? 'ja-JP', rate: 0.85 });
  }, []);

  // The actual tap handler — this is the real user gesture. Flip state
  // update AND speech both originate from here directly, synchronously,
  // rather than speech being a side-effect of state changing.
  const handleCardPress = useCallback(() => {
    const nextIsFlipped = !isFlipped;
    onFlip(nextIsFlipped);

    if (nextIsFlipped && audio?.text && !hasAutoPlayedRef.current) {
      hasAutoPlayedRef.current = true;
      speakNow(audio.text, audio.lang);
    }
  }, [isFlipped, onFlip, audio, speakNow]);

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

  return (
    <View style={styles.outerWrap}>
      <Pressable onPress={handleCardPress} style={styles.cardWrap}>
        <Animated.View style={[styles.face, frontStyle]}>
          <Text style={styles.label}>Vocabulary</Text>
          {!!imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />}
          <Text style={styles.frontText}>{front}</Text>
          <Text style={styles.tapHint}>Tap to flip</Text>
        </Animated.View>
        <Animated.View style={[styles.face, styles.faceBack, backStyle]}>
          <Text style={styles.backText}>{back}</Text>
          <Text style={styles.tapHint}>Tap to flip back</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrap: { width: CARD_WIDTH, height: CARD_HEIGHT },
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
  image: { width: 180, height: 180, marginBottom: 6, borderRadius: 14 },
  frontText: { fontFamily: FONTS.display, fontSize: 26, color: COLORS.deep, textAlign: 'center' },
  backText: { fontFamily: FONTS.body, fontSize: 18, fontWeight: '700', color: COLORS.plum, textAlign: 'center' },
  tapHint: { position: 'absolute', bottom: 12, fontFamily: FONTS.body, fontSize: 11, color: COLORS.inkSoft },
});