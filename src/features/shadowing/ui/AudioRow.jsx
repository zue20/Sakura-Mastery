import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { COLORS, FONTS } from '../../dashboard/theme';

export function AudioRow({ uri, label, showSpeedToggle = false }) {
  const { isPlaying, progress, rate, play, pause, setPlaybackRate } = useAudioPlayer(uri);

  const toggleSpeed = () => setPlaybackRate(rate === 1 ? 0.75 : 1);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Pressable
          onPress={isPlaying ? pause : play}
          disabled={!uri}
          style={[styles.playBtn, !uri && styles.playBtnDisabled]}
        >
          <Text style={styles.playIcon}>{isPlaying ? '🔊' : '📢'}</Text>
        </Pressable>

        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>

        {showSpeedToggle && (
          <Pressable onPress={toggleSpeed} style={styles.speedBtn}>
            <Text style={styles.speedText}>{rate === 1 ? '1.0x' : '0.75x'}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontSize: 12, color: COLORS.textMuted, marginBottom: 6, ...FONTS.medium },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface2, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 8, gap: 10,
  },
  playBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.accentLight, alignItems: 'center', justifyContent: 'center',
  },
  playBtnDisabled: { opacity: 0.4 },
  playIcon: { fontSize: 12, color: COLORS.accent },
  track: { flex: 1, height: 4, borderRadius: 2, backgroundColor: COLORS.border, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: COLORS.accent },
  speedBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: COLORS.surface1 },
  speedText: { fontSize: 12, color: COLORS.textSecondary, ...FONTS.medium },
});