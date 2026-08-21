// src/features/dashboard/components/Footer.jsx
import React from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS } from '../theme';

function HankoStamp({ character }) {
  return (
    <View style={styles.hanko}>
      <Text style={styles.hankoChar}>{character}</Text>
    </View>
  );
}

export default function Footer() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const year = new Date().getFullYear();

  const isWide = width >= 700;

  return (
    <View style={styles.wrap}>
      <View style={[styles.petalTip, isWide && styles.petalTipWide]} />

      <View style={[styles.footer, isWide && styles.footerWide]}>
        <View style={styles.kickerRow}>
          <HankoStamp character="桜" />
          <Text style={styles.kicker}>SAKURA MASTERY</Text>
          <Text style={styles.kickerPetal}> ⛩️ 🗻</Text>
        </View>

        <Text style={styles.footerText}>
          Keep up the great work!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginTop: 20,
  },
  // Tip color now matches the shared petal fill instead of its own red,
  // so it reads as part of the same petal family as the card below it.
  petalTip: {
    width: 16,
    height: 16,
    backgroundColor: '#e074a1',
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.35)',
    transform: [{ rotate: '45deg' }],
    borderTopLeftRadius: 5,
    marginBottom: -9,
    zIndex: 1,
  },
  petalTipWide: {
    width: 18,
    height: 18,
    marginBottom: -10,
  },
  // Squared top-left corner + shared fill/border/shadow recipe used by
  // SakuraPetalNodes, the brand title, LevelSwitcher, and the top-bar
  // action buttons — same petal shape language, just bigger and flatter.
  footer: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    maxWidth: 260,
    width: '100%',
    backgroundColor: '#efc6d7',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 34,
    borderBottomRightRadius: 34,
    borderBottomLeftRadius: 34,
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.35)',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#3A2C33',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
    ...Platform.select({
      web: { backdropFilter: 'blur(8px)' },
      default: {},
    }),
  },
  footerWide: {
    maxWidth: 300,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  kicker: {
    fontFamily: FONTS.body,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#4A1525',
  },
  kickerPetal: { fontSize: 20 },
  footerText: {
    fontFamily: FONTS.display,
    fontSize: 13,
    color: '#4A1525',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  hanko: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#A13B4A',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-6deg' }],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  hankoChar: {
    fontSize: 9,
    color: '#FFF',
    fontWeight: '700',
    lineHeight: 10,
  },
});