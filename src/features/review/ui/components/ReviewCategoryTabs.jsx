import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../../dashboard/theme';
import { ReviewCategory, REVIEW_CATEGORY_LABELS } from '../../utils/categorizeQuestion';

const TABS = [
  ReviewCategory.VOCAB_GRAMMAR,
  ReviewCategory.LISTENING,
  ReviewCategory.KANJI_KANA,
  ReviewCategory.SPEAKING,
];

export default function ReviewCategoryTabs({ activeCategory, onChange, counts = {} }) {
  return (
    <View style={styles.grid}>
      {TABS.map((cat) => {
        const isActive = cat === activeCategory;
        const count = counts[cat] ?? 0;
        return (
          <TouchableOpacity
            key={cat}
            style={[styles.tab, isActive ? styles.tabActive : null]}
            onPress={() => onChange(cat)}
            activeOpacity={0.85}
          >
            <Text style={[styles.tabText, isActive ? styles.tabTextActive : null]}>
              {REVIEW_CATEGORY_LABELS[cat] ?? cat}
            </Text>
            <View style={[styles.badge, isActive ? styles.badgeActive : null]}>
              <Text style={[styles.badgeText, isActive ? styles.badgeTextActive : null]}>
                {count}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  tab: {
    flexBasis: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f0acc6',
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#A13B4A',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.plum,
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#fff',
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(161,59,74,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.plum,
  },
  badgeTextActive: {
    color: '#fff',
  },
});