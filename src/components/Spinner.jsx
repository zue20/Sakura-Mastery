import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../theme';

export default function Spinner({ label, fullscreen = false }) {
  return (
    <View style={[styles.container, fullscreen && styles.fullscreen]}>
      <ActivityIndicator size="large" color={COLORS.deep} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  fullscreen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  label: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.inkSoft,
    marginTop: SPACING.sm,
  },
});