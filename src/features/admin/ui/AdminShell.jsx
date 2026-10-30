import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LogoutButton from '../../../components/LogoutButton';
import OverviewPanel from './OverviewPanel';
import QuestionsPanel from './QuestionsPanel';
import UsersPanel from './UsersPanel';
import BulkToolsPanel from './BulkToolsPanel';
import AssetsPanel from './AssetsPanel';
import SettingsPanel from './SettingsPanel';
import { ADMIN_COLORS, ADMIN_FONTS } from '../theme';

const adminBackground = require('../../../../assets/cherry-blossoms.jpg');

const ROSE = '#C65D7B';

const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', icon: 'grid-outline', iconActive: 'grid' },
  { key: 'questions', label: 'Questions', icon: 'help-circle-outline', iconActive: 'help-circle' },
  { key: 'users', label: 'Users', icon: 'people-outline', iconActive: 'people' },
  { key: 'assets', label: 'Assets', icon: 'images-outline', iconActive: 'images' },
  { key: 'bulk', label: 'Bulk Tools', icon: 'layers-outline', iconActive: 'layers' },
  { key: 'settings', label: 'Settings', icon: 'settings-outline', iconActive: 'settings' },
];

export default function AdminShell() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <View style={styles.root}>
      {/* Full-window background layer — independent of content size */}
      <View style={styles.bgLayer} pointerEvents="none">
        <Image source={adminBackground} style={styles.bgImage} resizeMode="cover" />
        <View style={styles.scrim} />
      </View>

      <View style={styles.sidebar}>
        <View>
          {/* Brand */}
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Ionicons name="flower-outline" size={20} color="#fff" />
            </View>
            <View>
              <Text style={styles.logo}>SakuraMastery</Text>
              <Text style={styles.logoSub}>ADMIN CONSOLE</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Navigation */}
          <Text style={styles.navLabel}>MENU</Text>
          <View style={styles.navList}>
            {NAV_ITEMS.map((item) => {
              const active = activeTab === item.key;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => setActiveTab(item.key)}
                  style={({ hovered, pressed }) => [
                    styles.navItem,
                    (hovered || pressed) && !active && styles.navItemHover,
                    active && styles.navItemActive,
                  ]}
                >
                  <View style={[styles.activeBar, active && styles.activeBarOn]} />
                  <Ionicons
                    name={active ? item.iconActive : item.icon}
                    size={18}
                    color={active ? ROSE : ADMIN_COLORS.textMuted}
                  />
                  <Text style={[styles.navItemText, active && styles.navItemTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.sidebarFooter}>
          <View style={styles.divider} />
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

const glass = Platform.select({
  web: { backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' },
  default: {},
});

// Fixed to the browser window on web so it always covers the whole screen,
// even when the page content is taller/wider than the root container.
const bgLayerPosition = Platform.select({
  web: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh' },
  default: { ...StyleSheet.absoluteFillObject },
});

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: ADMIN_COLORS.bg },

  bgLayer: {
    ...bgLayerPosition,
    zIndex: 0,
  },
  bgImage: { width: '100%', height: '100%' },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },

  sidebar: {
    width: 248,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.78)',
    paddingTop: 26,
    paddingBottom: 20,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.9)',
    shadowColor: ROSE,
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    ...glass,
  },

  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 4 },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: ROSE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  logo: { fontFamily: ADMIN_FONTS.display, color: ADMIN_COLORS.text, fontSize: 17, fontWeight: '700', letterSpacing: 0.2 },
  logoSub: { fontFamily: ADMIN_FONTS.body, color: ADMIN_COLORS.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1.6, marginTop: 2 },

  divider: { height: 1, backgroundColor: 'rgba(198,93,123,0.16)', marginVertical: 20 },

  navLabel: {
    fontFamily: ADMIN_FONTS.body,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: ADMIN_COLORS.textMuted,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  navList: { gap: 4 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingRight: 12,
    paddingLeft: 6,
    borderRadius: 12,
  },
  navItemHover: { backgroundColor: 'rgba(198,93,123,0.07)' },
  navItemActive: { backgroundColor: 'rgba(198,93,123,0.14)' },
  activeBar: { width: 3, height: 18, borderRadius: 2, backgroundColor: 'transparent' },
  activeBarOn: { backgroundColor: ROSE },
  navItemText: { fontFamily: ADMIN_FONTS.body, fontSize: 14, fontWeight: '500', color: ADMIN_COLORS.sidebarText },
  navItemTextActive: { color: ROSE, fontWeight: '700' },

  sidebarFooter: { paddingHorizontal: 4 },
  content: { flex: 1, padding: 28, zIndex: 1 },
});