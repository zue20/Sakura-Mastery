// src/features/dashboard/SakuraWheelDashboard.jsx
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ImageBackground, Platform, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useDashboardState from './hooks/useDashboardState';
import useOfflineStatus from './hooks/useOfflineStatus';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import useAppSettings from '../admin/hooks/useAppSettings';
import LevelSwitcher from './components/LevelSwitcher';
import SakuraWheelCore from './components/SakuraWheelCore';
import SakuraPetalNodes from './components/SakuraPetalNodes';
import OfflineIndicator from './components/OfflineIndicator';
import RecentActivityList from './components/RecentActivityList';
import Footer from './components/Footer';
import FallingSakura from './components/FallingSakura';
import { COLORS, FONTS } from './theme';
import useAuth from '../auth/hooks/useAuth';

export default function SakuraWheelDashboard() {
  const { currentLevel, switchLevel } = useDashboardState('N5');
  const isOnline = useOfflineStatus();
  const { isCompact } = useResponsiveLayout();
  const { logout } = useAuth();
  const navigation = useNavigation();
  const wheelSize = isCompact ? 260 : 460;
  const nodeSize = isCompact ? 70 : 100;

  const { settings } = useAppSettings();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const announcement = settings?.announcement;
  const showAnnouncement = !!announcement?.enabled && !!announcement?.text?.trim() && !bannerDismissed;

 const CATEGORY_TITLES = {
    grammar: 'Grammar Quiz',
    vocabulary: 'Vocabulary Quiz',
    listening: 'Listening Quiz',
    kanji: 'Kanji Quiz',
    speaking: 'Speaking Quiz',
    basic: 'Hiragana & Katakana',
  };

  const STUDY_CHOOSER_CATEGORIES = ['grammar', 'vocabulary'];
  const LISTENING_CHOOSER_CATEGORIES = ['listening'];
  const WRITING_OR_QUIZ_CATEGORIES = ['kanji', 'basic'];

  const handleQuizNavigate = (level, category) => {
    if (!CATEGORY_TITLES[category]) {
      return;
    }

    const title = `${level} ${CATEGORY_TITLES[category]}`;

    if (STUDY_CHOOSER_CATEGORIES.includes(category)) {
      navigation.navigate('StudyModeChooser', { title, moduleType: category, level });
      return;
    }

    if (LISTENING_CHOOSER_CATEGORIES.includes(category)) {
      navigation.navigate('StudyModeChooser', {
        title,
        moduleType: category,
        level,
        practiceRoute: 'ListeningPractice',
        practiceIcon: '🎧',
        practiceLabel: 'Practice',
        practiceDesc: 'Replay audio, toggle transcript — no pressure',
      });
      return;
    }

    if (WRITING_OR_QUIZ_CATEGORIES.includes(category)) {
      navigation.navigate('WritingOrQuizChooser', { title, moduleType: category, level });
      return;
    }

    // Speaking — straight to the quiz, as before.
    navigation.navigate('Quiz', { title, moduleType: category, level });
  };
  return (
    <ImageBackground
      source={COLORS.fujiImage}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.scrim} />

      <FallingSakura count={15} />

      <View style={styles.root}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {showAnnouncement && (
            <View style={styles.announcementBanner}>
              <Text style={styles.announcementText} numberOfLines={2}>
                📣 {announcement.text}
              </Text>
              <Pressable onPress={() => setBannerDismissed(true)} style={styles.announcementDismiss}>
                <Text style={styles.announcementDismissText}>✕</Text>
              </Pressable>
            </View>
          )}

          <View style={[styles.topbar, isCompact && styles.topbarCompact]}>
            <View style={styles.brand}>
              <Text style={styles.brandMark}>🎌🗾</Text>
              <Text style={styles.brandTitleJP}>🌸桜マスタリー</Text>
              <Text style={styles.brandName}>SakuraMastery</Text>
            </View>

            <LevelSwitcher currentLevel={currentLevel} onSwitchLevel={switchLevel} />

            <View style={[styles.topbarActions, isCompact && styles.topbarActionsCompact]}>
              <View style={styles.petalBtnWrap}>
                <View style={styles.petalBtnShape} />
                <View style={styles.petalBtnContent}>
                  <View style={[styles.statusDot, { backgroundColor: isOnline ? '#4C8C6B' : '#B0555F' }]} />
                  <Text style={styles.petalBtnLabel} numberOfLines={1}>
                    {isOnline ? 'Online' : 'Offline'}
                  </Text>
                </View>
              </View>

              <Pressable onPress={() => navigation.navigate('ReviewHub')} style={styles.petalBtnWrap}>
                <View style={styles.petalBtnShape} />
                <View style={styles.petalBtnContent}>
                  <Text style={styles.petalBtnIcon}>🍃</Text>
                  <Text style={styles.petalBtnLabel} numberOfLines={1}>Review</Text>
                </View>
              </Pressable>

              <Pressable onPress={logout} style={styles.petalBtnWrap}>
                <View style={styles.petalBtnShape} />
                <View style={styles.petalBtnContent}>
                  <Text style={styles.petalBtnIcon}>🚪</Text>
                  <Text style={styles.petalBtnLabel} numberOfLines={1}>Log Out</Text>
                </View>
              </Pressable>
            </View>
          </View>

          <View style={[styles.main, isCompact ? styles.mainCompact : styles.mainWide]}>
            <View
              style={[
                styles.wheelWrapper,
                { width: wheelSize, height: wheelSize, marginTop: isCompact ? 28 : 0 },
              ]}
            >
             <SakuraWheelCore currentLevel={currentLevel} />
              <SakuraPetalNodes currentLevel={currentLevel} onQuizNavigate={handleQuizNavigate} nodeSize={nodeSize} />
            </View>

            <View style={isCompact ? styles.sidebarCompact : styles.sidebarWide}>
              <RecentActivityList currentLevel={currentLevel} />
            </View>
          </View>

          <Footer />
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const glassPanel = {
  backgroundColor: COLORS.paper,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: 'rgba(221, 166, 166, 0.22)',
  ...Platform.select({
    web: { backdropFilter: 'blur(14px)' },
    default: {},
  }),
  shadowColor: '#3A2C33',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.12,
  shadowRadius: 16,
  elevation: 4,
};

// Shared petal treatment — same shape language as SakuraPetalNodes'
// petalShape (squared top-left corner, blush fill, matching border and
// shadow), reused here so the brand title and the top-bar action
// buttons visually belong to the same "petal" family as the wheel.
const petalSurface = {
  backgroundColor: '#efc6d7',
  borderWidth: 1,
  borderColor: 'rgba(198,93,123,0.35)',
  shadowColor: '#3A2C33',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.18,
  shadowRadius: 10,
  elevation: 5,
  ...Platform.select({
    web: { backdropFilter: 'blur(8px)' },
    default: {},
  }),
};

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(185, 170, 172, 0)',
  },
  root: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },

  announcementBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(74,21,37,0.88)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 12,
    ...Platform.select({ web: { backdropFilter: 'blur(6px)' } }),
  },
  announcementText: { flex: 1, fontFamily: FONTS.body, fontSize: 13, fontWeight: '600', color: '#FFF3F5' },
  announcementDismiss: { paddingHorizontal: 6, paddingVertical: 2 },
  announcementDismissText: { fontFamily: FONTS.body, fontSize: 14, color: '#FFF3F5', fontWeight: '700' },

  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
  },
  topbarCompact: { justifyContent: 'center' },
  // Now shares the petal shape (squared top-left corner) instead of a
  // plain rounded capsule, so the title reads as part of the same
  // sakura-petal family as the wheel nodes and the action buttons.
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderTopLeftRadius: 0,
    ...petalSurface,
  },
  brandMark: { fontSize: 26 },
  brandTitleJP: {
    fontFamily: FONTS.display,
    fontSize: 13,
    color: '#4A1525',
  },
  brandName: {
    fontFamily: FONTS.display,
    fontSize: 18,
    color: '#4A1525',
    fontWeight: '800',
  },
  topbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    // Pulled further inward from the screen edge (was 18).
    marginRight: 40,
    paddingRight: 0,
  },
  // On phone, the row wraps under the brand/level pills — pull it inward
  // from the screen edge instead of letting it hug the right side.
  topbarActionsCompact: {
    alignSelf: 'center',
    marginRight: 0,
    marginTop: 4,
  },
  main: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // --- Petal-style mini buttons (Online / Review / Log Out) ---
  petalBtnWrap: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petalBtnShape: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 29,
    borderTopLeftRadius: 0,
    ...petalSurface,
  },
  petalBtnContent: { alignItems: 'center', justifyContent: 'center' },
  petalBtnIcon: { fontSize: 19, marginBottom: 2 },
  statusDot: { width: 9, height: 9, borderRadius: 4.5, marginBottom: 3 },
  petalBtnLabel: {
    fontFamily: FONTS.body,
    fontWeight: '800',
    fontSize: 9,
    color: '#4A1525',
    textAlign: 'center',
    maxWidth: 52,
  },
  mainWide: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  mainCompact: { flexDirection: 'column', alignItems: 'center' },
  wheelWrapper: { position: 'relative', alignSelf: 'center' },
  sidebarWide: { width: 320, ...glassPanel, padding: 16 },
  sidebarCompact: { width: '100%', maxWidth: 420, marginTop: 20, ...glassPanel, padding: 16 },
});