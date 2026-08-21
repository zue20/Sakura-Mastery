import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ADMIN_COLORS, ADMIN_FONTS } from '../../theme';

const ACTION_EMOJI = {
  question_created: '💮',
  question_updated: '🪄',
  question_deleted: '🗑️',
  role_changed: '💫',
  asset_uploaded: '🖼️',
  asset_deleted: '🗑️',
  setting_changed: '🏞️',
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
  return (
    <View style={styles.row}>
      <Text style={styles.emoji}>{ACTION_EMOJI[entry.action] || '•'}</Text>
      <View style={styles.textCol}>
        <Text style={styles.line}>
          <Text style={styles.admin}>{entry.admin_email}</Text> {formatAction(entry)}
        </Text>
        <Text style={styles.time}>{timeAgo(entry.created_at)}</Text>
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
  row: { flexDirection: 'row', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: ADMIN_COLORS.border },
  emoji: { fontSize: 16 },
  textCol: { flex: 1 },
  line: { fontFamily: ADMIN_FONTS.body, fontSize: 13, color: ADMIN_COLORS.text },
  admin: { fontWeight: '700' },
  time: { fontFamily: ADMIN_FONTS.body, fontSize: 11, color: ADMIN_COLORS.textMuted, marginTop: 2 },
});