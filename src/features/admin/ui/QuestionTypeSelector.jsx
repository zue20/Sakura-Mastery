import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../dashboard/theme';
const TYPE_OPTIONS = [
  { value: 'dragdrop', label: '🧩 Drag & Drop' },
  { value: 'multipleChoice', label: '💭 Multiple Choice' },
  { value: 'kanjiWrite', label: '🖋️ Kanji Writing' },
  { value: 'kanaWrite', label: '🖋️ Kana Writing' },
  { value: 'speaking', label: '🎙️ Speaking' },
];

export default function QuestionTypeSelector({ value, onChange, disabled }) {
  return (
    <View style={styles.row}>
      {TYPE_OPTIONS.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => !disabled && onChange(opt.value)}
            disabled={disabled}
            style={[
              styles.pill,
              isSelected && styles.pillSelected,
              disabled && styles.pillDisabled,
            ]}
          >
            <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.25)',
  },
  pillSelected: { backgroundColor: COLORS.pink, borderColor: COLORS.pink },
  pillDisabled: { opacity: 0.5 },
  pillText: { fontFamily: FONTS.body, fontSize: 13, fontWeight: '600', color: COLORS.plum },
  pillTextSelected: { color: COLORS.inkBold },
});