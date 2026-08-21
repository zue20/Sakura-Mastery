import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ADMIN_COLORS as COLORS, ADMIN_FONTS as FONTS } from '../../theme';

export default function FilterGroup({ label, options, value, onChange }) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pills}>
        {options.map((opt) => (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[styles.pill, value === opt && styles.pillActive]}
          >
            <Text style={[styles.pillText, value === opt && styles.pillTextActive]}>{opt}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 4 },
  label: { fontFamily: FONTS.body, fontSize: 11, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: {
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  pillActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  pillText: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.text, fontWeight: '600' },
  pillTextActive: { color: '#FFFFFF' },
});