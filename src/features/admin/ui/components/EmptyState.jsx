import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ADMIN_COLORS as COLORS, ADMIN_FONTS as FONTS } from '../../theme';

export default function EmptyState({ hasActiveFilters, onClearFilters, onAddNew }) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{hasActiveFilters ? '🔍' : '🌸'}</Text>
      <Text style={styles.title}>
        {hasActiveFilters ? 'No questions match your search' : 'No questions yet'}
      </Text>
      <Text style={styles.subtitle}>
        {hasActiveFilters
          ? 'Try adjusting your filters or search terms.'
          : 'Get started by adding your first question.'}
      </Text>
      {hasActiveFilters ? (
        <Pressable style={styles.actionBtn} onPress={onClearFilters}>
          <Text style={styles.actionText}>Clear filters</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.actionBtn} onPress={onAddNew}>
          <Text style={styles.actionText}>+ Add Question</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  emoji: { fontSize: 40, marginBottom: 12 },
  title: { fontFamily: FONTS.body, fontSize: 16, fontWeight: '700', color: COLORS.deep, marginBottom: 4 },
  subtitle: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft, textAlign: 'center', marginBottom: 16 },
  actionBtn: { backgroundColor: COLORS.pink, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 },
  actionText: { fontFamily: FONTS.body, fontSize: 13, fontWeight: '700', color: COLORS.inkBold },
});