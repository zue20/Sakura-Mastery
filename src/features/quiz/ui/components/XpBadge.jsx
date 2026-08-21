import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../../dashboard/theme';

export default function XpBadge({ xp }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>✨ {xp} XP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { backgroundColor: 'rgba(216,162,90,0.18)', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
  text: { fontFamily: FONTS.body, fontSize: 12, fontWeight: '700', color: COLORS.gold },
});