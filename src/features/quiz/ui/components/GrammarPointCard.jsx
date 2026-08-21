import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { COLORS, FONTS } from '../../../dashboard/theme';

const CARD_WIDTH = 320;
const MIN_CARD_HEIGHT = 220; // floor only — card grows taller if content needs it

export default function GrammarPointCard({ front, back, answer, explanation, translation, isFlipped, onFlip, questionId }) {
  const rotation = useSharedValue(isFlipped ? 180 : 0);
 
  React.useEffect(() => {
    rotation.value = withTiming(isFlipped ? 180 : 0, { duration: 400 });
  }, [isFlipped]);

  // Only animate rotation/opacity — height is no longer part of the
  // transform, so each face is free to size itself to its own content.
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

  // Only one face renders at a time in the layout (the other is
  // display:'none'), so the card's height always matches whichever
  // face is currently showing — this is what actually kills the overlap.
  return (
    <View style={styles.outerWrap}>
      <Pressable onPress={() => onFlip(!isFlipped)} style={styles.cardWrap}>
        <Animated.View style={[styles.face, frontStyle, isFlipped && styles.hidden]}>
          <Text style={styles.label}>Fill in the blank</Text>
          <Text style={styles.sentence}>{front}</Text>
          <View style={styles.spacer} />
          <Text style={styles.tapHint}>Tap to reveal</Text>
        </Animated.View>

        <Animated.View style={[styles.face, styles.faceBack, backStyle, !isFlipped && styles.hidden]}>
          <Text style={styles.sentence}>{back}</Text>

          <View style={styles.answerPill}>
            <Text style={styles.answerText}>{answer}</Text>
          </View>

          {!!translation && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Meaning</Text>
              <Text style={styles.translation}>{translation}</Text>
            </View>
          )}

          {!!explanation && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Grammar Note</Text>
              <Text style={styles.explanation}>{explanation}</Text>
            </View>
          )}

          <Text style={styles.tapHint}>Tap to flip back</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrap: { width: CARD_WIDTH },
  cardWrap: { width: CARD_WIDTH },

  // No more position:'absolute' stacking both faces on top of each
  // other — instead only the active face is in the layout at all,
  // so height follows content naturally like a real Anki card.
  hidden: { display: 'none' },

  face: {
    width: '100%',
    minHeight: MIN_CARD_HEIGHT,
    backgroundColor: COLORS.paperStrong,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.3)',
    alignItems: 'center',
    padding: 22,
    gap: 12,
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
  sentence: {
    fontFamily: FONTS.display,
    fontSize: 22,
    color: COLORS.deep,
    textAlign: 'center',
    lineHeight: 30,
  },

  spacer: { flexGrow: 1 },

  answerPill: {
    backgroundColor: 'rgba(127,169,138,0.2)',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 14,
  },
  answerText: { fontFamily: FONTS.body, fontSize: 14, fontWeight: '700', color: COLORS.success },

  // Each section is its own clearly separated block — mirrors how
  // Anki templates stack front/back/extra fields as distinct rows,
  // never layered on top of each other.
  section: {
    width: '100%',
    alignItems: 'center',
    gap: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(198,93,123,0.15)',
  },
  sectionLabel: {
    fontFamily: FONTS.body,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  translation: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft, textAlign: 'center' },
  explanation: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.inkSoft,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 17,
  },

  // No longer absolute — sits at the natural end of the column with
  // its own spacing, so it can never land on top of other text.
  tapHint: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.inkSoft,
    marginTop: 6,
  },
});