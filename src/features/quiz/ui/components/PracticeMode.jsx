import React, { useEffect, useCallback } from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useAudioRecorder } from '../../../shadowing/hooks/useAudioRecorder';
import { AudioRow } from '../../../shadowing/ui/AudioRow';
import { TTSAudioRow } from '../../../shadowing/ui/TTSAudioRow';
import { LiveWaveform } from '../../../shadowing/ui/LiveWaveform';
import { COLORS, FONTS } from '../../../dashboard/theme';
import PronunciationGuide from '../../../../components/PronunciationGuide';

// Free practice — no timer, no grading, unlimited re-recording.
export default function PracticeMode({ question }) {
  const data = question.data ?? question;
  const { status, audioUri, stream, metering, start, stop, reset } = useAudioRecorder();
  const isRecording = status === 'recording';
  const isRequesting = status === 'requesting';
  const isRecorded = status === 'recorded';

  useEffect(() => { reset(); }, [question.id, reset]);

  const handleTap = useCallback(() => {
    if (isRequesting) return;
    if (isRecording) stop();
    else start();
  }, [isRequesting, isRecording, start, stop]);

  const label = isRequesting
    ? 'Requesting mic access…'
    : isRecording
    ? 'Recording… tap to stop'
    : isRecorded
    ? 'Recorded — tap Try again to redo'
    : status === 'error'
    ? 'Mic unavailable — tap to retry'
    : 'Tap to record';

  return (
    <View>
      {!!data.scenario && (
        <View style={styles.scenarioBadge}>
          <Text style={styles.scenarioBadgeText}>{data.scenario}</Text>
        </View>
      )}

      {!!data.imageUrl && (
        <View style={styles.illustrationWrap}>
          <Image source={{ uri: data.imageUrl }} style={styles.illustration} resizeMode="contain" />
        </View>
      )}

      {!!data.translation && <Text style={styles.meaning}>{data.translation}</Text>}

      <TTSAudioRow text={data.audio?.text ?? data.targetText} lang={data.audio?.lang ?? 'ja-JP'} />

{/* Plain romaji line only — TTSAudioRow above already shows the kana
    and has its own Listen button. */}
<PronunciationGuide
  text={data.targetText}
  lang={data.audio?.lang ?? 'ja-JP'}
  variant="compact"
/>

      {isRecorded && <AudioRow uri={audioUri} label="Your recording" />}

      <View style={styles.waveformWrap}>
        <LiveWaveform stream={stream} metering={metering} isActive={isRecording} />
      </View>

      <Pressable
        onPress={handleTap}
        disabled={isRequesting}
        style={[
          styles.recordBtn,
          isRecording && styles.recordBtnActive,
          isRecorded && styles.recordBtnDone,
          status === 'error' && styles.recordBtnError,
        ]}
      >
        <Text style={styles.recordIcon}>
          {isRecording ? '■' : isRecorded ? '✓' : status === 'error' ? '!' : '●'}
        </Text>
      </Pressable>
      <Text style={[styles.hint, isRecording && styles.hintActive]}>{label}</Text>

      {isRecorded && (
        <Pressable onPress={reset} style={styles.retryBtn}>
          <Text style={styles.retryBtnText}>↺ Try again</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scenarioBadge: {
    alignSelf: 'center', backgroundColor: 'rgba(216,162,90,0.16)',
    borderRadius: 999, paddingVertical: 5, paddingHorizontal: 14, marginBottom: 12,
  },
  scenarioBadgeText: { fontFamily: FONTS.body, fontSize: 12, fontWeight: '700', color: COLORS.gold, letterSpacing: 0.4 },

  illustrationWrap: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1.5,
    borderColor: 'rgba(198,93,123,0.2)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  illustration: { width: '100%', height: '100%' },

  meaning: {
    fontFamily: FONTS.display,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.deep,
    textAlign: 'center',
    marginBottom: 18,
  },

  waveformWrap: { marginVertical: 12, minHeight: 48 },
  recordBtn: { width: 68, height: 68, borderRadius: 34, backgroundColor: COLORS.error ?? '#C0392B', alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  recordBtnActive: { backgroundColor: '#8E2A20' },
  recordBtnDone: { backgroundColor: COLORS.success ?? '#3F8F5F' },
  recordBtnError: { backgroundColor: '#9A9A9A' },
  recordIcon: { fontSize: 22, color: '#fff', fontWeight: '700' },
  hint: { textAlign: 'center', fontFamily: FONTS.body, fontSize: 12, color: COLORS.inkSoft, marginTop: 8 },
  hintActive: { color: '#8E2A20', fontWeight: '700' },
  retryBtn: { alignSelf: 'center', marginTop: 10, paddingVertical: 6, paddingHorizontal: 14 },
  retryBtnText: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.plum, fontWeight: '700' },
});