import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../features/dashboard/theme';
import ConfettiBurst from '../features/quiz/ui/components/ConfettiBurst';

export default function HeartsRefillCelebration({ visible, onContinue }) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <ConfettiBurst continuous />
      <View style={styles.content} pointerEvents="box-none">
        <Text style={styles.emoji}>💗🌸✨</Text>
        <Text style={styles.title}>Hearts Refilled!</Text>
        <Text style={styles.subtitle}>Back into the lesson you go — がんばって！</Text>
        <TouchableOpacity style={styles.btn} onPress={onContinue} activeOpacity={0.85}>
          <Text style={styles.btnText}>🔥 Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(253, 241, 245, 0.97)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 10,
  },
  content: { alignItems: 'center', zIndex: 11 },
  emoji: { fontSize: 44, marginBottom: 10 },
  title: { fontFamily: FONTS.display, fontSize: 22, color: COLORS.plum, marginBottom: 8 },
  subtitle: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft, marginBottom: 24 },
  btn: { backgroundColor: '#A13B4A', paddingVertical: 13, paddingHorizontal: 32, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});