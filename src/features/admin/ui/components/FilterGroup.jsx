import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ADMIN_COLORS as COLORS, ADMIN_FONTS as FONTS } from '../../theme';

const ROSE = '#C65D7B';

export default function FilterGroup({ label, options, value, onChange }) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pills}>
        {options.map((opt) => {
          const active = value === opt;
          return (
            <Pressable
              key={opt}
              onPress={() => onChange(opt)}
              style={({ hovered, pressed }) => [
                styles.pill,
                (hovered || pressed) && !active && styles.pillHover,
                active && styles.pillActive,
              ]}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 6 },
  label: {
    fontFamily: FONTS.body,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 13,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.25)',
  },
  pillHover: { backgroundColor: 'rgba(198,93,123,0.1)' },
  pillActive: {
    backgroundColor: ROSE,
    borderColor: ROSE,
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  pillText: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.text, fontWeight: '600' },
  pillTextActive: { color: '#FFFFFF' },
});