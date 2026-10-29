import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAdminStats from '../hooks/useAdminStats';
import useActivityFeed from '../hooks/useActivityFeed';
import KpiCard from './components/KpiCard';
import ActivityFeedItem from './components/ActivityFeedItem';
import AdminCard from './components/AdminCard';
import { ADMIN_COLORS, ADMIN_FONTS } from '../theme';

const ROSE = '#C65D7B';

export default function OverviewPanel() {
  const { stats, loading, error } = useAdminStats();
  const { actions, isLoading: activityLoading } = useActivityFeed();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={ADMIN_COLORS.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Couldn't load stats: {error}</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.headingPill}>
        <View style={styles.headingIcon}>
          <Ionicons name="grid" size={14} color="#fff" />
        </View>
        <Text style={styles.heading}>Overview</Text>
      </View>

      <View style={styles.grid}>
        <KpiCard emoji="👻" label="Registered Users" value={stats.totalUsers} />
        <KpiCard emoji="⛅" label="Total Questions" value={stats.totalQuestions} />
        <KpiCard emoji="🍀" label="N5 Questions" value={stats.byLevel.N5 || 0} />
        <KpiCard emoji="🍃" label="N4 Questions" value={stats.byLevel.N4 || 0} />
      </View>

      <View style={[styles.headingPill, styles.sectionPill]}>
        <View style={styles.headingIcon}>
          <Ionicons name="time" size={14} color="#fff" />
        </View>
        <Text style={styles.sectionHeading}>Recent Activity</Text>
      </View>

      <AdminCard style={styles.activityCard}>
        {activityLoading ? (
          <ActivityIndicator color={ADMIN_COLORS.accent} />
        ) : actions.length === 0 ? (
          <Text style={styles.emptyText}>No admin activity logged yet.</Text>
        ) : (
          <ScrollView style={styles.activityScroll} nestedScrollEnabled>
            {actions.map((entry) => <ActivityFeedItem key={entry.id} entry={entry} />)}
          </ScrollView>
        )}
      </AdminCard>
    </View>
  );
}

const glass = Platform.select({
  web: { backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' },
  default: {},
});

const styles = StyleSheet.create({
  headingPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 7,
    paddingLeft: 8,
    paddingRight: 18,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    marginBottom: 16,
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    ...glass,
  },
  headingIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: ROSE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionPill: { marginTop: 32, marginBottom: 14 },
  heading: { fontFamily: ADMIN_FONTS.display, fontSize: 20, fontWeight: '700', color: ADMIN_COLORS.text, letterSpacing: 0.2 },
  sectionHeading: { fontFamily: ADMIN_FONTS.display, fontSize: 16, fontWeight: '700', color: ADMIN_COLORS.text, letterSpacing: 0.2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  centered: { padding: 40, alignItems: 'center' },
  errorText: { fontFamily: ADMIN_FONTS.body, color: ADMIN_COLORS.danger },
  emptyText: { fontFamily: ADMIN_FONTS.body, fontSize: 13, color: ADMIN_COLORS.textMuted },
  activityCard: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    ...glass,
  },
  activityScroll: { maxHeight: 420, padding: 16 },
});