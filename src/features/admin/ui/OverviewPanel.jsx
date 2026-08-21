import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import useAdminStats from '../hooks/useAdminStats';
import useActivityFeed from '../hooks/useActivityFeed';
import KpiCard from './components/KpiCard';
import ActivityFeedItem from './components/ActivityFeedItem';
import AdminCard from './components/AdminCard';
import { ADMIN_COLORS, ADMIN_FONTS } from '../theme';

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
      <Text style={styles.heading}>🍁🌸🍂 Overview</Text>
      <View style={styles.grid}>
        <KpiCard emoji="👻" label="Registered Users" value={stats.totalUsers} />
        <KpiCard emoji="⛅" label="Total Questions" value={stats.totalQuestions} />
        <KpiCard emoji="🍀" label="N5 Questions" value={stats.byLevel.N5 || 0} />
        <KpiCard emoji="🍃" label="N4 Questions" value={stats.byLevel.N4 || 0} />
      </View>

      <Text style={styles.sectionHeading}>Recent Activity</Text>
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

const styles = StyleSheet.create({
  heading: { fontFamily: ADMIN_FONTS.display, fontSize: 20, color: ADMIN_COLORS.text, marginBottom: 16 },
  sectionHeading: { fontFamily: ADMIN_FONTS.display, fontSize: 16, color: ADMIN_COLORS.text, marginTop: 28, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  centered: { padding: 40, alignItems: 'center' },
  errorText: { fontFamily: ADMIN_FONTS.body, color: ADMIN_COLORS.danger },
  emptyText: { fontFamily: ADMIN_FONTS.body, fontSize: 13, color: ADMIN_COLORS.textMuted },
  activityCard: { padding: 0, overflow: 'hidden' },
  activityScroll: { maxHeight: 420, padding: 16 },
});