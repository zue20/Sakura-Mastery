// src/features/dashboard/components/LevelSwitcher.jsx
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { COLORS, FONTS } from '../theme';
import { getTotalXpByLevel } from '../../../api/dailyProgressService';
import useAuth from '../../auth/hooks/useAuth';

const LEVELS = [
  { id: 'N5', sub: 'Beginner' },
  { id: 'N4', sub: 'Elementary' },
];

const CROWN_XP_THRESHOLD = 1000;

function useLevelXp(userId, level) {
  const [xp, setXp] = useState(0);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    getTotalXpByLevel(userId, level)
      .then((value) => {
        if (!cancelled) setXp(value);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [userId, level]);

  return xp;
}

export default function LevelSwitcher({ currentLevel, onSwitchLevel }) {
  const { user } = useAuth();
  const thumbAnim = useRef(new Animated.Value(currentLevel === 'N5' ? 0 : 1)).current;
  const [trackWidth, setTrackWidth] = useState(0);

  const n5Xp = useLevelXp(user?.id, 'N5');
  const n4Xp = useLevelXp(user?.id, 'N4');
  const xpByLevel = { N5: n5Xp, N4: n4Xp };

  useEffect(() => {
    Animated.timing(thumbAnim, {
      toValue: currentLevel === 'N5' ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentLevel]);

  const thumbTranslateX = thumbAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, trackWidth / 2],
  });

  return (
    <View
      style={styles.track}
      onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width - 6)}
      accessibilityRole="tablist"
    >
      <Animated.View
        style={[
          styles.thumb,
          { width: trackWidth ? trackWidth / 2 : 0, transform: [{ translateX: thumbTranslateX }] },
        ]}
      />
      {LEVELS.map(({ id, sub }) => (
        <TouchableOpacity
          key={id}
          style={styles.btn}
          activeOpacity={0.85}
          onPress={() => onSwitchLevel(id)}
          accessibilityRole="tab"
          accessibilityState={{ selected: currentLevel === id }}
        >
          {xpByLevel[id] >= CROWN_XP_THRESHOLD && (
            <Text style={styles.crown}>👑</Text>
          )}
          <Text style={[styles.label, currentLevel === id && styles.labelActive]}>{id}</Text>
          <Text style={[styles.sub, currentLevel === id && styles.labelActive]}>{sub}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // Now uses the same petal shape language as SakuraPetalNodes and the
  // top-bar buttons: squared top-left corner instead of a full pill,
  // matching border weight/opacity and drop shadow. Sized up slightly
  // (minWidth 190 -> 220, taller buttons) to match the bigger buttons.
  track: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 30,
    borderTopLeftRadius: 0,
    backgroundColor: '#efc6d7',
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.35)',
    position: 'relative',
    overflow: 'hidden',
    minWidth: 220,
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
  thumb: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: 26,
    borderTopLeftRadius: 0,
    backgroundColor: COLORS.deep,
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 52,
    position: 'relative',
  },
  crown: {
    position: 'absolute',
    top: -6,
    right: 6,
    fontSize: 15,
    transform: [{ rotate: '-15deg' }],
    zIndex: 3,
  },
  label: { fontFamily: FONTS.display, fontSize: 17, fontWeight: '700', color: '#de5c83' },
  sub: { fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase', color: '#e57d9c' },
  labelActive: { color: '#fff' },
});