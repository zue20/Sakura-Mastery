import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ADMIN_COLORS as COLORS, ADMIN_FONTS as FONTS } from '../../theme';
import { ADMIN_TABS } from '../../constants';

export default function AdminTabs({ activeTab, onChange }) {
  return (
    <View style={styles.row}>
      {ADMIN_TABS.map((tab) => (
        <Pressable
          key={tab.key}
          onPress={() => onChange(tab.key)}
          style={[styles.tab, activeTab === tab.key && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.25)',
  },
  tabActive: { backgroundColor: COLORS.accentSoft, borderColor: COLORS.pink },
  tabText: { fontFamily: FONTS.body, fontSize: 13, fontWeight: '600', color: COLORS.plum },
  tabTextActive: { color: COLORS.inkBold },
});