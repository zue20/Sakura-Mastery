import React from 'react';
import { Pressable, Text, StyleSheet, Platform } from 'react-native';
import { COLORS, FONTS } from '../../../dashboard/theme';

export default function WordChip({ label, onPress, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.chip,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { backgroundColor: COLORS.blush, borderWidth: 1, borderColor: 'rgba(198,93,123,0.3)', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 18, ...Platform.select({ web: { cursor: 'pointer', userSelect: 'none' } }) },
  disabled: { opacity: 0.55, ...Platform.select({ web: { cursor: 'not-allowed' } }) },
  pressed: { opacity: 0.65, transform: [{ scale: 0.97 }] },
  text: { fontFamily: FONTS.body, fontSize: 16, fontWeight: '700', color: COLORS.plum },
});