import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ADMIN_COLORS as COLORS, ADMIN_FONTS as FONTS } from '../../theme';
import { TRACKED_MODULES, TARGET_PER_MODULE } from '../../constants';

export default function LevelProgressRow({ label, data }) {
  const target = TRACKED_MODULES.length * TARGET_PER_MODULE;
  const pct = Math.min(100, Math.round((data.total / target) * 100));

  return (
    <View style={styles.row}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.count}>{data.total} / {target}</Text>
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
  row: { gap: 6 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontFamily: FONTS.body, fontSize: 13, fontWeight: '700', color: COLORS.text },
  count: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted },
  track: { height: 8, borderRadius: 999, backgroundColor: COLORS.accentSoft, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 999 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  chip: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, backgroundColor: COLORS.accentSoft },
  chipEmpty: { backgroundColor: 'rgba(0,0,0,0.05)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', borderStyle: 'dashed' },
  chipText: { fontFamily: FONTS.body, fontSize: 11, fontWeight: '600', color: COLORS.text },
  chipTextEmpty: { color: COLORS.textMuted },
});