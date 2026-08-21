import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
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

export default function VocabFlashcard({ front, back, imageUrl, audio, isFlipped, onFlip, questionId }) {
  const rotation = useSharedValue(isFlipped ? 180 : 0);
  const hasAutoPlayed = useRef(false);

  useEffect(() => {
    rotation.value = withTiming(isFlipped ? 180 : 0, { duration: 400 });

    if (isFlipped && audio?.text && !hasAutoPlayed.current) {
      hasAutoPlayed.current = true;
      Speech.speak(audio.text, { language: audio.lang ?? 'ja-JP', rate: 0.85 });
    }
    if (!isFlipped) {
      hasAutoPlayed.current = false;
    }
  }, [isFlipped]);

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
      <Pressable onPress={() => onFlip(!isFlipped)} style={styles.cardWrap}>
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