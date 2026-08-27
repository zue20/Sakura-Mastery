import React, { useEffect, useCallback, useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Animated } from 'react-native';
import { useAudioRecorder } from '../../../shadowing/hooks/useAudioRecorder';
import { AudioRow } from '../../../shadowing/ui/AudioRow';
import { TTSAudioRow } from '../../../shadowing/ui/TTSAudioRow';
import { LiveWaveform } from '../../../shadowing/ui/LiveWaveform';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { scoreAccuracy } from '../../utils/textSimilarity';
import { warmupReadingEngine } from '../../utils/kanjiReading';
import { COLORS, FONTS } from '../../../dashboard/theme';
import DeviceWarningBanner from '../../../../components/DeviceWarningBanner';
import { isIPad } from '../../../../utils/deviceDetection';

const QUIZ_DURATION = 30; // seconds
const PASS_THRESHOLD = 80; // must match useQuizQuestions.js checkAnswer
const DEFAULT_IMAGE_ASPECT_RATIO = 16 / 9; // used until the real image dimensions load
const MAX_ILLUSTRATION_HEIGHT = 160; // NEW: caps the image so the whole quiz fits without scrolling

const DEVICE_ISSUE_ERRORS = new Set(['recognition-never-captured', 'mic-permission-denied']);

function getSpeechDeviceMessage(errorCode) {
  if (errorCode === 'mic-permission-denied') {
    return "Microphone access was blocked. Check your browser's site settings and allow the microphone, then try again.";
  }
  if (errorCode === 'recognition-never-captured') {
    return isIPad()
      ? 'iPad speech recognition limitation. Please check Settings → General → Keyboard → Dictation Languages for Japanese.'
      : 'Speech recognition limitation on this device. Please check Settings → Siri and Dictation Languages for Japanese.';
  }
  return null;
}

export default function QuizMode({ question, workingAnswer, onChange, disabled }) {
  const data = question.data ?? question;
  const lang = data.audio?.lang ?? 'ja-JP';

  const { status, audioUri, stream, metering, start, stop, reset } = useAudioRecorder();
  const speech = useSpeechRecognition({ lang });

  const skipAudioRecording = speech.isSupported;

  const speechDeviceIssue = DEVICE_ISSUE_ERRORS.has(speech.error);
  const speechEffectivelySupported = speech.isSupported && !speechDeviceIssue;

  const [secondsLeft, setSecondsLeft] = useState(QUIZ_DURATION);
  const [phase, setPhase] = useState('ready'); // ready | recording | processing | scored
  // Box matches each image's real proportions instead of a fixed height, so
  // resizeMode="contain" shows the whole image with no crop. Height is also
  // capped by MAX_ILLUSTRATION_HEIGHT so a tall/portrait image can't push
  // the record button below the fold. Resets to the default per question
  // until Image.getSize resolves the real ratio for that question's image.
  const [imageAspectRatio, setImageAspectRatio] = useState(DEFAULT_IMAGE_ASPECT_RATIO);
  const timerRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const isRecording = status === 'recording' || (skipAudioRecording && phase === 'recording');
  const isRequesting = status === 'requesting';
  const hasScored = phase === 'scored';
  const isProcessing = phase === 'processing';
  const accuracy = workingAnswer?.accuracy ?? null;
  const transcript = workingAnswer?.transcript ?? '';

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    warmupReadingEngine();
  }, []);

  // Looks up this question's real image dimensions so the box can be sized
  // to match — falls back silently to the default ratio on error.
  useEffect(() => {
    if (!data.imageUrl) return undefined;
    let cancelled = false;
    Image.getSize(
      data.imageUrl,
      (width, height) => {
        if (!cancelled && width && height) setImageAspectRatio(width / height);
      },
      () => {} // leave it at the default ratio if dimensions can't be read
    );
    return () => {
      cancelled = true;
    };
  }, [data.imageUrl]);

  useEffect(() => {
    if (phase === 'recording') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 500, useNativeDriver: false }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: false }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
    pulseAnim.setValue(1);
  }, [phase, pulseAnim]);

  useEffect(() => {
    reset();
    speech.reset();
    clearTimer();
    setSecondsLeft(QUIZ_DURATION);
    setPhase('ready');
    setImageAspectRatio(DEFAULT_IMAGE_ASPECT_RATIO); // reset per question, same as the other fields below
    onChange(null);
  }, [question.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => clearTimer, [clearTimer]);

  const finishAndScore = useCallback(
    async (finalTranscript, altList = []) => {
      clearTimer();

      if (!speechEffectivelySupported) {
        setPhase('scored');
        onChange({ attempted: true, transcript: finalTranscript || '', accuracy: null });
        return;
      }

      const candidates = [finalTranscript, ...altList];
      const accuracies = await Promise.all(
        candidates.map((candidate) => scoreAccuracy(candidate, data.targetText))
      );

      let bestIndex = 0;
      for (let i = 1; i < accuracies.length; i++) {
        if (accuracies[i] > accuracies[bestIndex]) bestIndex = i;
      }

      setPhase('scored');
      onChange({
        attempted: true,
        transcript: candidates[bestIndex],
        accuracy: accuracies[bestIndex],
      });
    },
    [clearTimer, data.targetText, onChange, speechEffectivelySupported]
  );

  const handleStop = useCallback(() => {
    setPhase('processing');
    if (!skipAudioRecording) stop();
    speech.stop();
  }, [stop, speech, skipAudioRecording]);

  useEffect(() => {
    if (phase === 'processing' && !speech.isListening && !isRecording && speech.transcript) {
      finishAndScore(speech.transcript, speech.alternatives);
    }
  }, [phase, speech.isListening, speech.transcript, speech.alternatives, isRecording, finishAndScore]);

  useEffect(() => {
    if (phase === 'processing' && !speechEffectivelySupported && !isRecording) {
      finishAndScore('');
    }
  }, [phase, isRecording, speechEffectivelySupported, finishAndScore]);

  useEffect(() => {
    if (phase !== 'processing' || isRecording) return;
    const fallback = setTimeout(() => {
      if (!speech.transcript) finishAndScore('');
    }, 4000);
    return () => clearTimeout(fallback);
  }, [phase, isRecording, speech.transcript, finishAndScore]);

  const handleStart = useCallback(async () => {
    if (isRequesting || hasScored) return;
    setPhase('recording');
    setSecondsLeft(QUIZ_DURATION);

    if (!skipAudioRecording) start();

    if (speech.isSupported) {
      const started = await speech.start();
      if (!started) {
        handleStop();
        return;
      }
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearTimer();
          handleStop();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, [isRequesting, hasScored, start, speech, clearTimer, handleStop, skipAudioRecording]);

  const handleRetry = useCallback(() => {
    reset();
    speech.reset();
    clearTimer();
    setSecondsLeft(QUIZ_DURATION);
    setPhase('ready');
    onChange(null);
  }, [reset, speech, clearTimer, onChange]);

  const isPass = accuracy !== null && accuracy >= PASS_THRESHOLD;
  const isUngraded = hasScored && accuracy === null;

  const recordLabel = isRequesting
    ? 'Requesting mic access…'
    : phase === 'recording'
    ? 'Listening… tap to stop early'
    : isProcessing
    ? 'Processing your answer…'
    : 'Tap to start — you have 30 seconds';

  return (
    <View>
      {!!data.scenario && (
        <View style={styles.scenarioBadge}>
          <Text style={styles.scenarioBadgeText}>{data.scenario}</Text>
        </View>
      )}

      {!!data.imageUrl && (
        <Image
          source={{ uri: data.imageUrl }}
          style={[styles.illustration, { aspectRatio: imageAspectRatio }]}
          resizeMode="contain"
        />
      )}

      {!!data.translation && <Text style={styles.translationBelowImage}>{data.translation}</Text>}

      <TTSAudioRow text={data.audio?.text ?? data.targetText} lang={lang} />

      {phase === 'recording' && (
        <View style={styles.timerWrap}>
          <View style={styles.timerTrack}>
            <View
              style={[
                styles.timerFill,
                { width: `${(secondsLeft / QUIZ_DURATION) * 100}%` },
                secondsLeft <= 5 && styles.timerFillUrgent,
              ]}
            />
          </View>
          <Text style={[styles.timerLabel, secondsLeft <= 5 && styles.timerLabelUrgent]}>
            ⏱ {secondsLeft}s
          </Text>
        </View>
      )}

      {!skipAudioRecording && (
        <View style={styles.waveformWrap}>
          <LiveWaveform stream={stream} metering={metering} isActive={isRecording} />
        </View>
      )}

      {!hasScored && (
        <>
          <Pressable
            onPress={phase === 'recording' ? handleStop : handleStart}
            disabled={isRequesting || isProcessing || disabled}
          >
            <Animated.View
              style={[
                styles.recordBtn,
                phase === 'recording' && styles.recordBtnActive,
                isProcessing && styles.recordBtnProcessing,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Text style={styles.recordIcon}>
                {phase === 'recording' ? '■' : isProcessing ? '…' : '●'}
              </Text>
            </Animated.View>
          </Pressable>
          <Text style={styles.hint}>{recordLabel}</Text>
          {!speech.isSupported && (
            <DeviceWarningBanner
              message={
                speech.unavailableReason === 'insecure-connection'
                  ? 'Speech scoring needs a secure (https) connection on this network — your recording is still saved, just without a score.'
                  : "Speech recognition isn't available on this device — your attempt will still be recorded."
              }
            />
          )}
        </>
      )}

      {hasScored && (
        <View style={styles.resultWrap}>
          {!skipAudioRecording && audioUri && <AudioRow uri={audioUri} label="Your recording" />}

          {speechEffectivelySupported && (
            <Text style={styles.transcriptText}>
              You said: <Text style={styles.transcriptQuoted}>{transcript || '(nothing recognized)'}</Text>
            </Text>
          )}

          {speechDeviceIssue && (
            <DeviceWarningBanner
              message={getSpeechDeviceMessage(speech.error)}
              onPress={handleRetry}
              actionLabel="Try again"
            />
          )}

          {/* TEMP DEBUG — remove once the scoring issue is confirmed fixed */}
          <View style={styles.debugCard}>
            <Text style={styles.debugLabel}>🌸 Debug 🌸</Text>
            <View style={styles.debugRow}>
              <Text style={styles.debugKey}>spoken</Text>
              <Text style={styles.debugValue}>{JSON.stringify(transcript)}</Text>
            </View>
            <View style={styles.debugRow}>
              <Text style={styles.debugKey}>target</Text>
              <Text style={styles.debugValue}>{JSON.stringify(data.targetText)}</Text>
            </View>
            <View style={styles.debugRow}>
              <Text style={styles.debugKey}>accuracy</Text>
              <Text style={[styles.debugValue, styles.debugAccuracy]}>
                {accuracy === null ? 'ungraded' : `${accuracy}%`}
              </Text>
            </View>
            <View style={styles.debugRow}>
              <Text style={styles.debugKey}>speech.error</Text>
              <Text style={styles.debugValue}>{JSON.stringify(speech.error)}</Text>
            </View>
          </View>
          {/* END TEMP DEBUG */}

          <View
            style={[
              styles.scoreBadge,
              isUngraded ? styles.scoreBadgeUngraded : isPass ? styles.scoreBadgePass : styles.scoreBadgeFail,
            ]}
          >
            <Text style={styles.scoreText}>
              {isUngraded ? 'Recorded' : `${accuracy}% Match`}
            </Text>
          </View>

          <Pressable onPress={handleRetry} style={styles.retryBtn} disabled={disabled}>
            <Text style={styles.retryBtnText}>↺ Try again</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scenarioBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(216,162,90,0.16)',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 14,
    marginBottom: 8, // was 12 — a little tighter to help everything fit
  },
  scenarioBadgeText: { fontFamily: FONTS.body, fontSize: 12, fontWeight: '700', color: COLORS.gold, letterSpacing: 0.4 },

  // Height is now capped via maxHeight below, in addition to the inline
  // aspectRatio — so a tall image gets letterboxed by resizeMode="contain"
  // instead of stretching the box to its full natural height.
  illustration: {
    width: '100%',
    maxHeight: MAX_ILLUSTRATION_HEIGHT,
    alignSelf: 'center',
    borderRadius: 16,
    marginBottom: 8, // was 10
    backgroundColor: 'rgba(198,93,123,0.06)',
    overflow: 'hidden',
  },
  translationBelowImage: {
    fontFamily: FONTS.body,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.inkSoft,
    textAlign: 'center',
    marginBottom: 10, // was 16
  },
  timerWrap: { marginTop: 14, marginBottom: 4 },
  timerTrack: { height: 6, borderRadius: 3, backgroundColor: 'rgba(198,93,123,0.12)', overflow: 'hidden' },
  timerFill: { height: '100%', backgroundColor: COLORS.gold, borderRadius: 3 },
  timerFillUrgent: { backgroundColor: COLORS.error },
  timerLabel: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.inkSoft, textAlign: 'right', marginTop: 2 },
  timerLabelUrgent: { color: COLORS.error, fontWeight: '700' },

  waveformWrap: { marginVertical: 12, minHeight: 48 },
  recordBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.error ?? '#C0392B',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordBtnActive: { backgroundColor: '#8E2A20' },
  recordBtnProcessing: { backgroundColor: COLORS.gold ?? '#D8A25A' },
  recordIcon: { fontSize: 22, color: '#fff', fontWeight: '700' },
  hint: { textAlign: 'center', fontFamily: FONTS.body, fontSize: 12, color: COLORS.inkSoft, marginTop: 8 },

  resultWrap: { alignItems: 'center', marginTop: 4 },
  transcriptText: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft, marginTop: 10, textAlign: 'center' },
  transcriptQuoted: { fontWeight: '700', color: COLORS.deep },

  scoreBadge: { marginTop: 14, borderRadius: 14, paddingVertical: 8, paddingHorizontal: 18, alignItems: 'center', minWidth: 130 },
  scoreBadgePass: { backgroundColor: 'rgba(127,169,138,0.18)' },
  scoreBadgeFail: { backgroundColor: 'rgba(192,57,43,0.1)' },
  scoreBadgeUngraded: { backgroundColor: 'rgba(198,93,123,0.08)' },
  scoreText: { fontFamily: FONTS.display, fontSize: 15, fontWeight: '700', color: COLORS.deep },
  scoreVerdict: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft, marginTop: 2 },

  retryBtn: { marginTop: 12, paddingVertical: 6, paddingHorizontal: 14 },
  retryBtnText: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.plum, fontWeight: '700' },
  debugCard: {
    marginTop: 12,
    width: '100%',
    backgroundColor: 'rgba(198,93,123,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.18)',
    borderRadius: 14,
    padding: 12,
  },
  debugLabel: { fontFamily: FONTS.body, fontSize: 11, fontWeight: '700', color: COLORS.pink, marginBottom: 6, letterSpacing: 0.4 },
  debugRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderTopWidth: 1,
    borderTopColor: 'rgba(198,93,123,0.1)',
  },
  debugKey: { fontFamily: FONTS.body, fontSize: 10, color: COLORS.inkSoft, fontWeight: '600', width: 70 },
  debugValue: { fontFamily: FONTS.body, fontSize: 10, color: COLORS.deep, flex: 1, textAlign: 'right' },
  debugAccuracy: { fontWeight: '700', color: COLORS.plum },
});