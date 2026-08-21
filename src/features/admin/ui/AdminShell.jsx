import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import LogoutButton from '../../../components/LogoutButton';
import OverviewPanel from './OverviewPanel';
import QuestionsPanel from './QuestionsPanel';
import UsersPanel from './UsersPanel';
import BulkToolsPanel from './BulkToolsPanel';
import AssetsPanel from './AssetsPanel';
import SettingsPanel from './SettingsPanel';
import { ADMIN_COLORS, ADMIN_FONTS } from '../theme';


const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', emoji: '🍁' },
  { key: 'questions', label: 'Questions', emoji: '🫧' },
  { key: 'users', label: 'Users', emoji: '👻' },
  { key: 'assets', label: 'Assets', emoji: '💖' },
  { key: 'bulk', label: 'Bulk Tools', emoji: '🍱' },
  { key: 'settings', label: 'Settings', emoji: '❄️' },
];

export default function AdminShell() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <View style={styles.root}>
      <View style={styles.sidebar}>
        <View>
          <Text style={styles.logo}>🍀🌷🌻 SakuraMastery</Text>
          <Text style={styles.logoSub}>Admin</Text>
        </View>

        <View style={styles.navList}>
          {NAV_ITEMS.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => setActiveTab(item.key)}
              style={[styles.navItem, activeTab === item.key && styles.navItemActive]}
            >
              <Text style={styles.navEmoji}>{item.emoji}</Text>
              <Text style={[styles.navItemText, activeTab === item.key && styles.navItemTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sidebarFooter}>
          <LogoutButton />
        </View>
      </View>

      <View style={styles.content}>
        {activeTab === 'overview' && <OverviewPanel />}
        {activeTab === 'questions' && <QuestionsPanel />}
        {activeTab === 'users' && <UsersPanel />}
        {activeTab === 'assets' && <AssetsPanel />}
        {activeTab === 'bulk' && <BulkToolsPanel />}
        {activeTab === 'settings' && <SettingsPanel />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: ADMIN_COLORS.bg },
  sidebar: {
    width: 220,
    backgroundColor: ADMIN_COLORS.sidebarBg,
    paddingVertical: 24,
    paddingHorizontal: 14,
    justifyContent: 'space-between',
    borderRightWidth: 1,
    borderRightColor: ADMIN_COLORS.border,
  },
  logo: { fontFamily: ADMIN_FONTS.display, color: ADMIN_COLORS.text, fontSize: 17, fontWeight: '700' },
  logoSub: { fontFamily: ADMIN_FONTS.body, color: ADMIN_COLORS.textMuted, fontSize: 12, marginTop: 2, marginBottom: 28 },
  navList: { gap: 6 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10 },
  navItemActive: { backgroundColor: ADMIN_COLORS.sidebarActiveBg },
  navEmoji: { fontSize: 15 },
  navItemText: { fontFamily: ADMIN_FONTS.body, fontSize: 13, color: ADMIN_COLORS.sidebarText },
  navItemTextActive: { color: ADMIN_COLORS.sidebarActiveText, fontWeight: '700' },
  sidebarFooter: { paddingHorizontal: 4 },
  content: { flex: 1, padding: 24 },
});