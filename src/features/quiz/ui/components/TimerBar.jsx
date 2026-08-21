import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../../dashboard/theme';

export default function TimerBar({ secondsLeft, timePerQuestion }) {
  const percent = Math.max(0, Math.round((secondsLeft / timePerQuestion) * 100));
  const isUrgent = secondsLeft <= 5;

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }, isUrgent && styles.fillUrgent]} />
      </View>
      <Text style={[styles.label, isUrgent && styles.labelUrgent]}>⏱ {secondsLeft}s</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  track: { height: 6, borderRadius: 3, backgroundColor: 'rgba(198,93,123,0.12)', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: COLORS.gold, borderRadius: 3 },
  fillUrgent: { backgroundColor: COLORS.error },
  label: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.inkSoft, textAlign: 'right', marginTop: 2 },
  labelUrgent: { color: COLORS.error, fontWeight: '700' },
});