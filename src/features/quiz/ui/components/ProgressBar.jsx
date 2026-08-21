import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../../dashboard/theme';

export default function ProgressBar({ current, total, percent }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>
      <Text style={styles.label}>{current} / {total}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, maxWidth: 160 },
  track: { height: 8, borderRadius: 4, backgroundColor: 'rgba(198,93,123,0.15)', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: COLORS.pink, borderRadius: 4 },
  label: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.inkSoft, textAlign: 'right', marginTop: 2 },
});