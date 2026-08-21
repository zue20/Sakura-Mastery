import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ADMIN_COLORS as COLORS, ADMIN_FONTS as FONTS } from '../../theme';
import LevelProgressRow from './LevelProgressRow';

export default function ProgressTracker({ progressByLevel, expanded, onToggle }) {
  return (
    <View style={styles.card}>
      <Pressable style={styles.header} onPress={onToggle}>
        <Text style={styles.title}>📊 N5 / N4 Content Progress</Text>
        <Text style={styles.toggle}>{expanded ? '▲' : '▼'}</Text>
      </Pressable>

      {expanded && (
        <View style={styles.body}>
          <LevelProgressRow label="N5" data={progressByLevel.N5} />
          <LevelProgressRow label="N4" data={progressByLevel.N4} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  title: { fontFamily: FONTS.body, fontSize: 14, fontWeight: '700', color: COLORS.text },
  toggle: { fontSize: 12, color: COLORS.accent },
  body: { paddingHorizontal: 16, paddingBottom: 16, gap: 16 },
});