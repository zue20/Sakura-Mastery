import React from 'react';
import { Text, StyleSheet } from 'react-native';
import AdminCard from './AdminCard';
import { ADMIN_COLORS, ADMIN_FONTS } from '../../theme';

export default function KpiCard({ emoji, label, value }) {
  return (
    <AdminCard style={styles.card}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </AdminCard>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 140, alignItems: 'flex-start', gap: 4 },
  emoji: { fontSize: 20, marginBottom: 4 },
  value: { fontFamily: ADMIN_FONTS.display, fontSize: 24, fontWeight: '700', color: ADMIN_COLORS.text },
  label: { fontFamily: ADMIN_FONTS.body, fontSize: 12, color: ADMIN_COLORS.textMuted },
});