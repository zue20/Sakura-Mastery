import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../dashboard/theme';

const ROSE = '#C65D7B';

const TYPE_META = {
  dragdrop: { label: 'Drag & Drop', icon: 'extension-puzzle-outline' },
  multipleChoice: { label: 'Multiple Choice', icon: 'checkbox-outline' },
  kanjiWrite: { label: 'Kanji Writing', icon: 'brush-outline' },
  kanaWrite: { label: 'Kana Writing', icon: 'create-outline' },
  speaking: { label: 'Speaking', icon: 'mic-outline' },
};

export default function QuestionListPanel({ questions, onEdit, onDelete }) {
  if (questions.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Ionicons name="albums-outline" size={22} color={COLORS.inkSoft} />
        <Text style={styles.emptyText}>No questions yet. Add one to get started.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
      {questions.map((q) => {
        const meta = TYPE_META[q.type];
        return (
          <View key={q.id} style={styles.row}>
            <View style={styles.rowMain}>
              <View style={styles.typeBadge}>
                <Ionicons name={meta?.icon ?? 'help-circle-outline'} size={12} color={ROSE} />
                <Text style={styles.rowType}>{meta?.label ?? q.type}</Text>
              </View>
              <Text style={styles.rowPrompt} numberOfLines={2}>{q.prompt}</Text>
              <Text style={styles.rowMeta}>
                {q.moduleType ?? '—'} · {q.level ?? '—'} · id: {q.id}
              </Text>
            </View>
            <View style={styles.rowActions}>
              <Pressable
                style={({ hovered, pressed }) => [styles.actionBtn, (hovered || pressed) && styles.actionBtnHover]}
                onPress={() => onEdit(q)}
              >
                <Ionicons name="create-outline" size={14} color={ROSE} />
                <Text style={styles.actionText}>Edit</Text>
              </Pressable>
              <Pressable
                style={({ hovered, pressed }) => [
                  styles.actionBtn,
                  styles.deleteBtn,
                  (hovered || pressed) && styles.deleteBtnHover,
                ]}
                onPress={() => onDelete(q)}
              >
                <Ionicons name="trash-outline" size={14} color={COLORS.error} />
                <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const glass = Platform.select({
  web: { backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' },
  default: {},
});

const styles = StyleSheet.create({
  list: { flex: 1 },
  listContent: { gap: 10, paddingBottom: 20 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    borderRadius: 18,
    padding: 14,
    gap: 12,
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    ...glass,
  },
  rowMain: { flex: 1, gap: 5 },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(198,93,123,0.12)',
  },
  rowType: { fontFamily: FONTS.body, fontSize: 11, fontWeight: '700', color: ROSE },
  rowPrompt: { fontFamily: FONTS.body, fontSize: 14, lineHeight: 20, color: COLORS.ink },
  rowMeta: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.inkSoft },

  rowActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.35)',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  actionBtnHover: { backgroundColor: 'rgba(198,93,123,0.12)' },
  actionText: { fontFamily: FONTS.body, fontSize: 12, fontWeight: '700', color: ROSE },
  deleteBtn: { borderColor: 'rgba(192,57,43,0.35)' },
  deleteBtnHover: { backgroundColor: 'rgba(192,57,43,0.12)' },
  deleteText: { color: COLORS.error },

  emptyWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    ...glass,
  },
  emptyText: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft, textAlign: 'center' },
});