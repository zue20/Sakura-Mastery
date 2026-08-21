import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS } from '../theme';
import { getRecentAttempts } from '../../../api/quizAttemptsService';
import useAuth from '../../auth/hooks/useAuth';

const VISIBLE_LIMIT = 4;

function HankoStamp({ character }) {
  return (
    <View style={styles.hanko}>
      <Text style={styles.hankoChar}>{character}</Text>
    </View>
  );
}

function timeAgo(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export default function RecentActivityList({ currentLevel }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getRecentAttempts({ userId: user.id, level: currentLevel, limit: VISIBLE_LIMIT });
      setEntries(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, currentLevel]);

  // Refetches every time this screen regains focus — same reasoning as
  // SakuraWheelCore: a plain useEffect only fires on mount and would keep
  // showing stale activity after returning from a quiz.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const renderItem = (entry, i) => (
    <View
      key={entry.id}
      style={[
        styles.item,
        i % 2 === 1 && styles.itemAlt,
        i === entries.length - 1 && styles.itemLast,
      ]}
    >
      <Text style={styles.petalEmoji}>🌸🌸</Text>
      <View style={styles.itemBody}>
        <Text style={styles.itemTitle}>
          {entry.title ?? entry.module_type}
        </Text>
        <View style={styles.itemMeta}>
          <Text style={styles.score}>{entry.score_correct}/{entry.score_total}</Text>
          <Text style={styles.time}>{timeAgo(entry.created_at)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.card}>
      <Text style={styles.cornerPetal}>🌸🌸</Text>

      <View style={styles.titleRow}>
        <HankoStamp character="活" />
        <Text style={styles.title}>Recent Activity</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={COLORS.plum} />
      ) : error ? (
        <Text style={styles.empty}>Couldn't load activity — {error}</Text>
      ) : entries.length === 0 ? (
        <Text style={styles.empty}>No sessions logged for {currentLevel} yet.</Text>
      ) : (
        <ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {entries.map(renderItem)}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#efc6d7',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 40,
    borderBottomLeftRadius: 14,
    padding: 20,
    paddingTop: 22,
    borderWidth: 1,
    borderColor: 'rgba(91,58,76,0.1)',
    overflow: 'hidden',
  },
  cornerPetal: {
    position: 'absolute',
    top: -10,
    right: -5,
    fontSize: 40,
    opacity: 0.5,
    transform: [{ rotate: '20deg' }],
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  title: { fontFamily: FONTS.display, fontSize: 15, color: COLORS.plum },
  empty: { fontSize: 13, color: COLORS.inkSoft },
  scrollArea: { maxHeight: 260 },
  hanko: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: '#A13B4A',
    alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-6deg' }],
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
  },
  hankoChar: { fontSize: 14, color: '#FFF', fontWeight: '800', lineHeight: 15 },
  petalEmoji: { fontSize: 14, marginTop: 1 },
  item: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 10,
    paddingHorizontal: 12, marginBottom: 8, borderTopLeftRadius: 18, borderTopRightRadius: 6,
    borderBottomRightRadius: 18, borderBottomLeftRadius: 6, backgroundColor: 'rgba(215, 82, 120, 0.31)',
  },
  itemAlt: {
    backgroundColor: 'rgba(234, 97, 172, 0.32)', borderTopLeftRadius: 6, borderTopRightRadius: 18,
    borderBottomRightRadius: 6, borderBottomLeftRadius: 18,
  },
  itemLast: { marginBottom: 0 },
  itemBody: { flex: 1 },
  itemTitle: { fontSize: 13, color: COLORS.ink, marginBottom: 3, fontWeight: '600' },
  itemMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  score: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.deep },
  time: { fontSize: 11, color: COLORS.inkSoft },
});