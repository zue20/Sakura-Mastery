import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Easing, ActivityIndicator } from 'react-native';
import { COLORS, FONTS } from '../theme';
import { getCurrentStreak, getTotalXp } from '../../../api/dailyProgressService';
import useAuth from '../../auth/hooks/useAuth';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export default function SakuraWheelCore({ currentLevel }) {
  const { user } = useAuth();
  const pulse = useRef(new Animated.Value(0)).current;
  const [coreWidth, setCoreWidth] = useState(180); // sensible default before first layout pass

  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const [streakValue, xpValue] = await Promise.all([
        getCurrentStreak(user.id),
        getTotalXp(user.id),
      ]);
      setStreak(streakValue);
      setXp(xpValue);
    } catch (err) {
      console.warn('Failed to load wheel stats:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleLayout = useCallback((e) => {
    const { width } = e.nativeEvent.layout;
    if (width && Math.abs(width - coreWidth) > 1) {
      setCoreWidth(width);
    }
  }, [coreWidth]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  // Font sizes scale with the circle's ACTUAL rendered width (measured via
  // onLayout), so text never overflows on any screen size — no more
  // separate mobile/desktop font values to keep in sync.
  const levelFontSize = clamp(coreWidth * 0.22, 14, 26);
  const statValueFontSize = clamp(coreWidth * 0.11, 9, 15);
  const statLabelFontSize = clamp(coreWidth * 0.065, 7, 9);
  const statIconFontSize = clamp(coreWidth * 0.1, 10, 13);

  return (
    <View style={styles.core} onLayout={handleLayout} accessibilityLiveRegion="polite">
      <Animated.View style={[styles.ring, styles.ringOuter, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
      <Animated.View style={[styles.ring, styles.ringInner, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
      <View style={styles.content}>
        <Text
          style={[styles.levelBadge, { fontSize: levelFontSize }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {currentLevel}
        </Text>
        {isLoading ? (
          <ActivityIndicator color={COLORS.plum} size="small" />
        ) : (
          <>
            <View style={styles.statRow}>
              <Text style={[styles.statIcon, { fontSize: statIconFontSize }]}>🔥</Text>
              <Text style={[styles.statValue, { fontSize: statValueFontSize }]} numberOfLines={1}>
                {streak}
              </Text>
              <Text style={[styles.statLabel, { fontSize: statLabelFontSize }]} numberOfLines={1}>
                day streak
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statValue, { fontSize: statValueFontSize }]} numberOfLines={1}>
                {xp.toLocaleString()}
              </Text>
              <Text style={[styles.statLabel, { fontSize: statLabelFontSize }]} numberOfLines={1}>
                total XP
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  core: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '42%',
    aspectRatio: 1,
    marginLeft: '-21%',
    marginTop: '-21%',
    borderRadius: 999,
   backgroundColor: '#f7b9d4ea',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.plum,
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    overflow: 'hidden',
    paddingHorizontal: 6,
  },
  ring: { position: 'absolute', borderRadius: 999, borderWidth: 1, borderColor: 'rgba(198,93,123,0.25)' },
  ringOuter: { top: -18, bottom: -18, left: -18, right: -18 },
  ringInner: { top: -8, bottom: -8, left: -8, right: -8, borderColor: 'rgba(216,162,90,0.3)' },
  content: { alignItems: 'center', gap: 4, padding: 4, maxWidth: '100%' },
  levelBadge: { fontFamily: FONTS.display, color: COLORS.deep },
  statRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, maxWidth: '100%' },
  statIcon: {},
  statValue: { fontFamily: FONTS.mono, fontWeight: '700', color: COLORS.plum },
  statLabel: { color: COLORS.ink, textTransform: 'uppercase', letterSpacing: 0.3 },
});