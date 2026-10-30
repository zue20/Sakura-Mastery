import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ADMIN_COLORS as COLORS, ADMIN_FONTS as FONTS } from '../../theme';

const ROSE = '#C65D7B';

export default function EmptyState({ hasActiveFilters, onClearFilters, onAddNew }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBadge}>
        <Ionicons name={hasActiveFilters ? 'search' : 'flower-outline'} size={28} color={ROSE} />
      </View>
      <Text style={styles.title}>
        {hasActiveFilters ? 'No questions match your search' : 'No questions yet'}
      </Text>
      <Text style={styles.subtitle}>
        {hasActiveFilters
          ? 'Try adjusting your filters or search terms.'
          : 'Get started by adding your first question.'}
      </Text>
      {hasActiveFilters ? (
        <Pressable
          style={({ hovered, pressed }) => [styles.actionBtn, (hovered || pressed) && styles.actionBtnHover]}
          onPress={onClearFilters}
        >
          <Ionicons name="close-circle-outline" size={16} color="#FFFFFF" />
          <Text style={styles.actionText}>Clear filters</Text>
        </Pressable>
      ) : (
        <Pressable
          style={({ hovered, pressed }) => [styles.actionBtn, (hovered || pressed) && styles.actionBtnHover]}
          onPress={onAddNew}
        >
          <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" />
          <Text style={styles.actionText}>Add Question</Text>
        </Pressable>
      )}
    </View>
  );
}

const glass = Platform.select({
  web: { backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' },
  default: {},
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    ...glass,
  },
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(198,93,123,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: { fontFamily: FONTS.body, fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginBottom: 18 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: ROSE,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 20,
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  actionBtnHover: { opacity: 0.9 },
  actionText: { fontFamily: FONTS.body, fontSize: 13, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.2 },
});