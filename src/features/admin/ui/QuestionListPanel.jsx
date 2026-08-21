import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { COLORS, FONTS } from '../../dashboard/theme';

const TYPE_LABELS = {
  dragdrop: '🧩 Drag & Drop',
  multipleChoice: '☑️ Multiple Choice',
};

export default function QuestionListPanel({ questions, onEdit, onDelete }) {
  if (questions.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>No questions yet. Add one to get started.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
      {questions.map((q) => (
        <View key={q.id} style={styles.row}>
          <View style={styles.rowMain}>
            <Text style={styles.rowType}>{TYPE_LABELS[q.type] ?? q.type}</Text>
            <Text style={styles.rowPrompt} numberOfLines={2}>{q.prompt}</Text>
            <Text style={styles.rowMeta}>
              {q.moduleType ?? '—'} · {q.level ?? '—'} · id: {q.id}
            </Text>
          </View>
          <View style={styles.rowActions}>
            <Pressable style={styles.actionBtn} onPress={() => onEdit(q)}>
              <Text style={styles.actionText}>Edit</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, styles.deleteBtn]} onPress={() => onDelete(q)}>
              <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  listContent: { gap: 10, paddingBottom: 20 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.2)',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  rowMain: { flex: 1, gap: 4 },
  rowType: { fontFamily: FONTS.body, fontSize: 12, fontWeight: '700', color: COLORS.plum },
  rowPrompt: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink },
  rowMeta: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.inkSoft },

  rowActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: COLORS.blush,
  },
  actionText: { fontFamily: FONTS.body, fontSize: 12, fontWeight: '700', color: COLORS.plum },
  deleteBtn: { backgroundColor: 'rgba(192,57,43,0.12)' },
  deleteText: { color: COLORS.error },

  emptyWrap: { padding: 32, alignItems: 'center' },
  emptyText: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft, textAlign: 'center' },
});