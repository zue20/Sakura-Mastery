import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

export default function OfflineIndicator({ isOnline }) {
  return (
    <View style={styles.wrap} accessibilityRole="text">
      <View style={[styles.dot, { backgroundColor: isOnline ? COLORS.online : COLORS.offline }]} />
      <Text style={styles.text}>
        {isOnline ? '🟢 Connected' : '📡 Offline Mode (Local Play)'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#efc6d7',
    borderWidth: 1,
    borderColor: 'rgba(91,58,76,0.1)',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { fontSize: 12, color: COLORS.ink },
});