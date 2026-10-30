import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

const ROSE = '#C65D7B';

export default function AdminCard({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const glass = Platform.select({
  web: { backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' },
  default: {},
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    padding: 18,
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    ...glass,
  },
});