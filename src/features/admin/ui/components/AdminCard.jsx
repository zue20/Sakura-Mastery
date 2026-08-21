import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ADMIN_COLORS } from '../../theme';

export default function AdminCard({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: ADMIN_COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
    padding: 16,
  },
});