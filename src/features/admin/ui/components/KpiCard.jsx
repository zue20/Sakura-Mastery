import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdminCard from './AdminCard';
import { ADMIN_COLORS, ADMIN_FONTS } from '../../theme';

const ROSE = '#C65D7B';

// OverviewPanel still passes emojis; map them to line icons here.
// You can also pass an `icon` prop (an Ionicons name) to override.
const EMOJI_TO_ICON = {
  '👻': 'people',
  '⛅': 'albums',
  '🍀': 'leaf',
  '🍃': 'leaf-outline',
};

export default function KpiCard({ emoji, icon, label, value }) {
  const iconName = icon || EMOJI_TO_ICON[emoji] || 'stats-chart';

  return (
    <AdminCard style={styles.card}>
      <View style={styles.badge}>
        <Ionicons name={iconName} size={20} color={ROSE} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </AdminCard>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 160, alignItems: 'flex-start', gap: 4 },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(198,93,123,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: { fontFamily: ADMIN_FONTS.display, fontSize: 30, fontWeight: '700', color: ADMIN_COLORS.text, letterSpacing: 0.3 },
  label: { fontFamily: ADMIN_FONTS.body, fontSize: 12, fontWeight: '600', color: ADMIN_COLORS.textMuted, letterSpacing: 0.2 },
});