import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ADMIN_COLORS, ADMIN_FONTS } from '../../theme';

const ROSE = '#C65D7B';
const RED = '#D9534F';
const GREEN = '#3E8E5A';

// Icon + tint per action type
const ACTION_META = {
  question_created: { icon: 'add-circle', color: GREEN },
  question_updated: { icon: 'create', color: ROSE },
  question_deleted: { icon: 'trash', color: RED },
  role_changed: { icon: 'shield-checkmark', color: ROSE },
  asset_uploaded: { icon: 'cloud-upload', color: GREEN },
  asset_deleted: { icon: 'trash', color: RED },
  setting_changed: { icon: 'settings', color: ROSE },
};

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function ActivityFeedItem({ entry }) {
  const meta = ACTION_META[entry.action] || { icon: 'ellipse', color: ADMIN_COLORS.textMuted };

  return (
    <View style={styles.row}>
      <View style={[styles.iconCircle, { backgroundColor: `${meta.color}1F` }]}>
        <Ionicons name={meta.icon} size={15} color={meta.color} />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.line}>
          <Text style={styles.admin}>{entry.admin_email}</Text> {formatAction(entry)}
        </Text>
        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={11} color={ADMIN_COLORS.textMuted} />
          <Text style={styles.time}>{timeAgo(entry.created_at)}</Text>
        </View>
      </View>
    </View>
  );
}

function formatAction(entry) {
  switch (entry.action) {
    case 'question_created': return `added a question${entry.target_label ? ` (${entry.target_label})` : ''}`;
    case 'question_updated': return `edited a question${entry.target_label ? ` (${entry.target_label})` : ''}`;
    case 'question_deleted': return `deleted a question${entry.target_label ? ` (${entry.target_label})` : ''}`;
    case 'role_changed': return entry.target_label || 'changed a user role';
    case 'asset_uploaded': return `uploaded ${entry.target_label || 'an image'}`;
    case 'asset_deleted': return `deleted ${entry.target_label || 'an image'}`;
    case 'setting_changed': return entry.target_label || 'changed a setting';
    default: return entry.action;
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(198,93,123,0.14)',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1 },
  line: { fontFamily: ADMIN_FONTS.body, fontSize: 13, lineHeight: 19, color: ADMIN_COLORS.text },
  admin: { fontWeight: '700' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  time: { fontFamily: ADMIN_FONTS.body, fontSize: 11, color: ADMIN_COLORS.textMuted },
});