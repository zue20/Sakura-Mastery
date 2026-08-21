import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../features/dashboard/theme';

const FREE_REFILL_WAIT_SECONDS = 5 * 60; // 5 minutes

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function OutOfHeartsModal({
  visible,
  xpCost,
  isSpending,
  onSpendXp,
  onFreeRefill,
  onExit,
}) {
  const [secondsLeft, setSecondsLeft] = useState(FREE_REFILL_WAIT_SECONDS);
  const intervalRef = useRef(null);

  // Start/reset the countdown each time the modal opens; stop it when it closes.
  useEffect(() => {
    if (!visible) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    setSecondsLeft(FREE_REFILL_WAIT_SECONDS);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [visible]);

  const timerReady = secondsLeft <= 0;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.corner}>🌸🌸</Text>
          <Text style={styles.emoji}>💔</Text>
          <Text style={styles.title}>ハート切れ</Text>
          <Text style={styles.subtitle}>Out of Hearts!</Text>
          <Text style={styles.body}>
            You're out of hearts for this session. Spend XP for an instant
            refill, or wait a bit for a free one — がんばって！
          </Text>

          <TouchableOpacity
            style={[styles.primaryBtn, isSpending && styles.primaryBtnDisabled]}
            onPress={onSpendXp}
            disabled={isSpending}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryText}>
              {isSpending ? 'Refilling…' : `💠 Spend ${xpCost} XP to Refill Hearts`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.freeBtn, !timerReady && styles.freeBtnDisabled]}
            onPress={timerReady ? onFreeRefill : undefined}
            disabled={!timerReady}
            activeOpacity={0.85}
          >
            <Text style={styles.freeText}>
              {timerReady ? '🎁 Free Refill Ready!' : `⏳ Free Refill in ${formatTime(secondsLeft)}`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={onExit} activeOpacity={0.85}>
            <Text style={styles.secondaryText}>🏠 Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(58, 44, 51, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#fdf1f5',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(221,166,166,0.5)',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    top: -8,
    right: -8,
    fontSize: 42,
    opacity: 0.35,
    transform: [{ rotate: '15deg' }],
  },
  emoji: { fontSize: 44, marginBottom: 6 },
  title: { fontFamily: FONTS.display, fontSize: 20, color: COLORS.plum, marginBottom: 2 },
  subtitle: { fontSize: 13, color: COLORS.inkSoft, marginBottom: 14 },
  body: {
    fontSize: 13,
    color: COLORS.ink,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 22,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: '#A13B4A',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  freeBtn: {
    width: '100%',
    backgroundColor: COLORS.bambooGreen ?? '#4C8C6B',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  freeBtnDisabled: { backgroundColor: '#cfd8d2' },
  freeText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  secondaryBtn: {
    width: '100%',
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(161,59,74,0.3)',
  },
  secondaryText: { color: COLORS.plum, fontWeight: '600', fontSize: 13 },
});