import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { AudioRow } from './ui/AudioRow';
import { LiveWaveform } from './ui/LiveWaveform';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { COLORS, FONTS } from '../dashboard/theme';

export default function ShadowingScreen({ phrase }) {
  const { status, audioUri, stream, metering, start, stop, reset } = useAudioRecorder();
  const isRecording = status === 'recording';

  const handlePressIn = () => {
    reset();
    start();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.kanji}>{phrase.kanji}</Text>
      <Text style={styles.romaji}>{phrase.romaji}</Text>
      <Text style={styles.meaning}>{phrase.meaning}</Text>

      <AudioRow uri={phrase.audioUrl} label="Native audio" showSpeedToggle />
      <AudioRow uri={audioUri} label="Your recording" />

      <View style={styles.waveformWrap}>
        <LiveWaveform stream={stream} metering={metering} isActive={isRecording} />
      </View>

      <Pressable
        onPressIn={handlePressIn}
        onPressOut={stop}
        style={[styles.recordBtn, isRecording && styles.recordBtnActive]}
      >
        <Text style={styles.recordIcon}>{isRecording ? '🎤' : '●'}</Text>
      </Pressable>
      <Text style={styles.hint}>
        {status === 'error' ? 'Mic access denied — check browser permissions' : 'Hold to record, release to stop'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, backgroundColor: COLORS.surface1, borderRadius: 16 },
  kanji: { fontSize: 28, textAlign: 'center', marginBottom: 4, ...FONTS.regular },
  romaji: { fontSize: 15, textAlign: 'center', ...FONTS.medium },
  meaning: { fontSize: 13, textAlign: 'center', color: COLORS.textSecondary, marginBottom: 20 },
  waveformWrap: { marginVertical: 12 },
  recordBtn: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.danger,
    alignSelf: 'center', alignItems: 'center', justifyContent: 'center',
  },
  recordBtnActive: { backgroundColor: COLORS.dangerDark },
  recordIcon: { fontSize: 20, color: '#fff' },
  hint: { textAlign: 'center', fontSize: 12, color: COLORS.textMuted, marginTop: 8 },
});