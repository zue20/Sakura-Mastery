import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ADMIN_COLORS as COLORS, ADMIN_FONTS as FONTS } from '../../theme';
import { TRACKED_MODULES, TARGET_PER_MODULE } from '../../constants';

const ROSE = '#C65D7B';

export default function LevelProgressRow({ label, data }) {
  const target = TRACKED_MODULES.length * TARGET_PER_MODULE;
  const pct = Math.min(100, Math.round((data.total / target) * 100));

  return (
    <View style={styles.row}>
      <View style={styles.headerRow}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>{label}</Text>
        </View>
        <Text style={styles.count}>
          {data.total} / {target} <Text style={styles.pct}>· {pct}%</Text>
        </Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>

      <View style={styles.chipsRow}>
        {TRACKED_MODULES.map((mod) => {
          const count = data.byModule[mod] || 0;
          const isEmpty = count === 0;
          return (
            <View key={mod} style={[styles.chip, isEmpty && styles.chipEmpty]}>
              <Text style={[styles.chipText, isEmpty && styles.chipTextEmpty]}>
                {mod}: {count}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelBadge: {
    paddingVertical: 3,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: ROSE,
  },
  levelBadgeText: { fontFamily: FONTS.body, fontSize: 12, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.4 },
  count: { fontFamily: FONTS.body, fontSize: 12, fontWeight: '600', color: COLORS.text },
  pct: { color: COLORS.textMuted, fontWeight: '500' },

  track: { height: 10, borderRadius: 999, backgroundColor: 'rgba(198,93,123,0.14)', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: ROSE, borderRadius: 999 },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  chip: {
    paddingVertical: 4,
    paddingHorizontal: 11,
    borderRadius: 999,
    backgroundColor: 'rgba(198,93,123,0.12)',
  },
  chipEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.3)',
    borderStyle: 'dashed',
  },
  chipText: { fontFamily: FONTS.body, fontSize: 11, fontWeight: '600', color: ROSE },
  chipTextEmpty: { color: COLORS.textMuted },
});