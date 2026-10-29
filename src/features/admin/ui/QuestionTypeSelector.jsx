import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../dashboard/theme';

const TYPE_OPTIONS = [
  { value: 'dragdrop', label: 'Drag & Drop', icon: 'extension-puzzle-outline' },
  { value: 'multipleChoice', label: 'Multiple Choice', icon: 'chatbubble-ellipses-outline' },
  { value: 'kanjiWrite', label: 'Kanji Writing', icon: 'brush-outline' },
  { value: 'kanaWrite', label: 'Kana Writing', icon: 'create-outline' },
  { value: 'speaking', label: 'Speaking', icon: 'mic-outline' },
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
            <Ionicons
              name={opt.icon}
              size={15}
              color={isSelected ? COLORS.inkBold : COLORS.plum}
            />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
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