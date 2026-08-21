import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS, FONTS } from '../../../dashboard/theme';
import { getStrokeOrderFor } from '../../data/kanaStrokeOrder';

const STEP_SIZE = 64;

function StrokeStep({ strokes, stepIndex }) {
  
  const priorStrokes = strokes.slice(0, stepIndex - 1);
  const thisStroke = strokes[stepIndex - 1];

  return (
    <View style={styles.stepWrap}>
      <Svg width={STEP_SIZE} height={STEP_SIZE} viewBox="0 0 100 100">
        {priorStrokes.map((d, i) => (
          <Path
            key={`prior-${i}`}
            d={d}
            stroke="rgba(198,93,123,0.18)"
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
          />
        ))}
        {thisStroke && (
          <Path
            d={thisStroke}
            stroke={COLORS.pink}
            strokeWidth={7}
            fill="none"
            strokeLinecap="round"
          />
        )}
      </Svg>
      <Text style={styles.stepNumber}>{stepIndex}</Text>
    </View>
  );
}


export default function StrokeOrderReference({ character }) {
  const strokes = getStrokeOrderFor(character);
  if (!strokes || strokes.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Stroke order</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stripContent}>
        {strokes.map((_, i) => (
          <StrokeStep key={i} strokes={strokes} stepIndex={i + 1} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginTop: 12 },
  label: { fontFamily: FONTS.body, fontSize: 11, fontWeight: '700', color: COLORS.inkSoft, textTransform: 'uppercase', marginBottom: 6 },
  stripContent: { flexDirection: 'row', gap: 10, paddingHorizontal: 4 },
  stepWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.2)',
    padding: 4,
  },
  stepNumber: { fontFamily: FONTS.body, fontSize: 10, fontWeight: '700', color: COLORS.plum, marginTop: 2 },
});
