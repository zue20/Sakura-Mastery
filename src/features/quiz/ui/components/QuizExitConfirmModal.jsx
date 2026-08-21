import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../../dashboard/theme';

export default function QuizExitConfirmModal({ visible, onConfirm, onCancel }) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>Exit quiz?</Text>
       <Text style={styles.text}>Are you sure you want to quit? Your progress for this session will be lost.</Text>
        <View style={styles.actions}>
          <Pressable style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable style={styles.leaveBtn} onPress={onConfirm}>
            <Text style={styles.leaveText}>Exit</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(58,44,51,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: COLORS.paperStrong,
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    gap: 8,
  },
  title: { fontFamily: FONTS.display, fontSize: 18, fontWeight: '700', color: COLORS.deep },
  text: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft, textAlign: 'center', marginBottom: 8 },
  actions: { flexDirection: 'row', gap: 10, width: '100%' },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(198,93,123,0.3)',
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelText: { fontFamily: FONTS.body, fontSize: 13, fontWeight: '600', color: COLORS.plum },
  leaveBtn: {
    flex: 1,
    backgroundColor: COLORS.error,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  leaveText: { fontFamily: FONTS.body, fontSize: 13, fontWeight: '700', color: '#fff' },
});