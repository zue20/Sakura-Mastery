import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { useFetchQuestions } from '../hooks/useFetchQuestions';
import PracticeCompleteScreen from './components/PracticeCompleteScreen';
import { COLORS, FONTS } from '../../dashboard/theme';

const CANCEL_SPEAK_GAP_MS = 50; // Safari drops speak() if it fires in the same tick as cancel()

function HankoStamp({ character }) {
  return (
    <View style={styles.hanko}>
      <Text style={styles.hankoChar}>{character}</Text>
    </View>
  );
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getSentencePieces(question) {
  if (Array.isArray(question?.words) && question.words.length > 0) {
    return { pieces: question.words, joinChar: ' ' };
  }

  const source = (question?.audio?.text || question?.prompt || '').trim();
  if (!source) return { pieces: [], joinChar: '' };

  const bySpace = source.split(/\s+/).filter(Boolean);
  if (bySpace.length > 1) {
    return { pieces: bySpace, joinChar: ' ' };
  }
  return { pieces: Array.from(source), joinChar: '' };
}
export default function ListeningPracticeScreen({ route, navigation }) {
  const [sessionKey, setSessionKey] = useState(0);
  const handleRestart = useCallback(() => setSessionKey((k) => k + 1), []);
  return (
    <ListeningPracticeScreenInner
      key={sessionKey}
      route={route}
      navigation={navigation}
      onRestart={handleRestart}
    />
  );
}
function ListeningPracticeScreenInner({ route, navigation, onRestart }) {
  const { title, moduleType, level } = route?.params ?? {};
  const { questions } = useFetchQuestions({ moduleType, level });

  const [index, setIndex] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [slots, setSlots] = useState([]);
  const [bank, setBank] = useState([]);
  const [checked, setChecked] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const nextBlockId = useRef(0);
  const gapTimeoutRef = useRef(null);
  const [showComplete, setShowComplete] = useState(false);
  const current = Array.isArray(questions) ? questions[index] : null;
  const total = Array.isArray(questions) ? questions.length : 0;
  const isLast = index === total - 1;
  const isFirst = index === 0;

  const { pieces, joinChar } = useMemo(() => getSentencePieces(current), [current]);
  const targetText = useMemo(() => pieces.join(joinChar), [pieces, joinChar]);

  useEffect(() => {
    setShowTranscript(false);
    setChecked(false);
    setAudioError(null);
    setSlots(new Array(pieces.length).fill(null));
    setBank(
      shuffle(pieces).map((text) => ({ id: `blk-${nextBlockId.current++}`, text }))
    );
  }, [index, pieces]);

  useEffect(() => {
    return () => {
      if (gapTimeoutRef.current) clearTimeout(gapTimeoutRef.current);
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
      } else {
        Speech.stop();
      }
    };
  }, []);

  // Direct user gesture (onPress={playAudio} on the button below) — this
  // part was already correct. What's new: Safari-safe cancel/speak gap,
  // web-specific speechSynthesis path, and error surfaced to the UI
  // instead of failing silently on repeat taps (a likely trigger for
  // Safari's stuck-queue bug, since "replay" is core to this screen).
  const playAudio = useCallback(() => {
    if (!current?.audio?.text) return;
    setAudioError(null);

    const text = current.audio.text;
    const lang = current.audio.lang ?? 'ja-JP';

    if (Platform.OS === 'web') {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        setAudioError('Audio is not supported in this browser.');
        return;
      }

      window.speechSynthesis.cancel();
      if (gapTimeoutRef.current) clearTimeout(gapTimeoutRef.current);

      gapTimeoutRef.current = setTimeout(() => {
        const utterance = new window.SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.85;
        utterance.onerror = (event) => {
          if (event.error !== 'interrupted' && event.error !== 'canceled') {
            setAudioError(
              event.error === 'not-allowed'
                ? 'Tap Play Audio again to enable sound.'
                : 'Audio playback failed. Please try again.'
            );
          }
        };
        window.speechSynthesis.speak(utterance);
      }, CANCEL_SPEAK_GAP_MS);
      return;
    }

    Speech.stop();
    Speech.speak(text, {
      language: lang,
      rate: 0.85,
      onError: () => setAudioError('Audio playback failed. Please try again.'),
    });
  }, [current]);

  const placeBlock = useCallback((block) => {
    setSlots((prev) => {
      const emptyIndex = prev.findIndex((s) => s === null);
      if (emptyIndex === -1) return prev;
      const next = [...prev];
      next[emptyIndex] = block;
      return next;
    });
    setBank((prev) => prev.filter((b) => b.id !== block.id));
    setChecked(false);
  }, []);

  const removeFromSlot = useCallback((slotIndex) => {
    setSlots((prev) => {
      const block = prev[slotIndex];
      if (!block) return prev;
      setBank((prevBank) => [...prevBank, block]);
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
    setChecked(false);
  }, []);

  const handleReset = useCallback(() => {
    setBank(shuffle(pieces).map((text) => ({ id: `blk-${nextBlockId.current++}`, text })));
    setSlots(new Array(pieces.length).fill(null));
    setChecked(false);
  }, [pieces]);

  const allSlotsFilled = slots.length > 0 && slots.every((s) => s !== null);
  const answerText = slots.map((s) => (s ? s.text : '')).join(joinChar);
  const isMatch = checked && answerText === targetText;

  const handleCheck = useCallback(() => {
    setChecked(true);
  }, []);

 const goNext = useCallback(() => {
  if (isLast) {
    setShowComplete(true);
    return;
  }
  setIndex((i) => Math.min(i + 1, total - 1));
}, [isLast, total]);
  const goPrevious = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);
  const handleExit = useCallback(() => navigation?.goBack(), [navigation]);

  if (questions === undefined) {
    return (
      <View style={styles.root}>
        <ActivityIndicator size="large" color={COLORS.pink} />
        <Text style={styles.progress}>Loading listening practice…</Text>
      </View>
    );
  }

  if (total === 0) {
    return (
      <View style={styles.root}>
        <Text style={styles.title}>{title} — Practice</Text>
        <Text style={styles.progress}>No listening practice available yet.</Text>
        <Pressable style={styles.backLink} onPress={handleExit}>
          <Text style={styles.backLinkText}>← Back</Text>
        </Pressable>
      </View>
    );
  }
    if (showComplete) {
  return (
    <PracticeCompleteScreen
      total={total}
      description={`You've gone through all ${total} listening exercises.`}
      onRestart={onRestart}
      onExit={handleExit}
    />
  );
}
  return (
    <ScrollView contentContainerStyle={styles.root}>
      <View style={styles.headerRow}>
        <HankoStamp character="聴" />
        <View>
          <Text style={styles.title}>{title} — Practice</Text>
          <Text style={styles.progress}>{index + 1} / {total}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cornerPetal}>🌸🌸</Text>

        <Pressable style={styles.playBtn} onPress={playAudio}>
          <Text style={styles.playBtnText}>🎶 Play Audio</Text>
        </Pressable>
        <Text style={styles.playHint}>Tap again anytime to replay</Text>
        {!!audioError && <Text style={styles.audioErrorText}>{audioError}</Text>}

        <View style={styles.divider} />

        <Text style={styles.builderLabel}>✒️ Build the sentence you heard</Text>

        <View style={styles.slotsRow}>
          {slots.map((block, i) => (
            <Pressable
              key={i}
              style={[styles.slot, block && styles.slotFilled]}
              onPress={() => block && removeFromSlot(i)}
            >
              {block && <Text style={styles.slotText}>{block.text}</Text>}
            </Pressable>
          ))}
        </View>

        <View style={styles.bankRow}>
          {bank.map((block) => (
            <Pressable key={block.id} style={styles.bankBlock} onPress={() => placeBlock(block)}>
              <Text style={styles.bankBlockText}>{block.text}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.builderActions}>
          <Pressable style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetBtnText}>↺ Reset</Text>
          </Pressable>
          <Pressable
            style={[styles.checkBtn, !allSlotsFilled && styles.checkBtnDisabled]}
            onPress={handleCheck}
            disabled={!allSlotsFilled}
          >
            <Text style={styles.checkBtnText}>Check</Text>
          </Pressable>
        </View>

        {checked && (
          <View style={styles.feedbackBox}>
            <Text style={[styles.feedbackText, isMatch ? styles.feedbackGood : styles.feedbackTryAgain]}>
              {isMatch ? '🌟 That matches — nicely done!' : '💭 Not quite '}
            </Text>
            {!isMatch && <Text style={styles.correctSentence}>{targetText}</Text>}
          </View>
        )}

        <View style={styles.divider} />

        <Pressable style={styles.transcriptToggle} onPress={() => setShowTranscript((v) => !v)}>
          <Text style={styles.transcriptToggleText}>
            {showTranscript ? '🙈 Hide Transcript' : '📜 Show Transcript'}
          </Text>
        </Pressable>

        {showTranscript && (
          <View style={styles.transcriptBox}>
            <Text style={styles.transcriptSectionLabel}>日本語 Japanese</Text>
            <Text style={styles.transcriptScript}>
              {current?.audio?.text || current?.prompt || '—'}
            </Text>

            <View style={styles.transcriptDivider} />

            <Text style={styles.transcriptSectionLabel}>English Meaning</Text>
            <Text style={styles.transcriptMeaning}>
              {current?.translation || 'No English meaning added for this question yet.'}
            </Text>

            {!!current?.explanation && (
              <>
                <View style={styles.transcriptDivider} />
                <Text style={styles.transcriptExplanation}>{current.explanation}</Text>
              </>
            )}
          </View>
        )}
      </View>

      <View style={styles.navRow}>
        <Pressable style={styles.navBtn} onPress={goPrevious} disabled={isFirst}>
          <Text style={styles.navBtnText}>← Previous</Text>
        </Pressable>
        <Pressable style={styles.navBtn} onPress={goNext}>
          <Text style={styles.navBtnText}>{isLast ? 'Finish' : 'Next →'}</Text>
        </Pressable>
      </View>

      <Pressable style={styles.backLink} onPress={handleExit}>
        <Text style={styles.backLinkText}>← Back to Dashboard</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    paddingBottom: 60,
    backgroundColor: COLORS.bg,
    gap: 16,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontFamily: FONTS.display, fontSize: 18, color: COLORS.deep },
  progress: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.inkSoft, marginTop: 2 },
  hanko: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e7c8cd',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-6deg' }],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  hankoChar: { fontSize: 16, color: '#FFF', fontWeight: '700' },
  card: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: COLORS.paperStrong,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 34,
    borderBottomLeftRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.3)',
    padding: 22,
    gap: 6,
    overflow: 'hidden',
    shadowColor: '#3A2C33',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 5,
  },
  cornerPetal: {
    position: 'absolute',
    top: -10,
    right: -8,
    fontSize: 40,
    opacity: 0.08,
    transform: [{ rotate: '20deg' }],
  },
  playBtnText: { fontFamily: FONTS.body, fontSize: 15, fontWeight: '700', color: '#FFF' },
  playHint: {
    alignSelf: 'center',
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.inkSoft,
    marginTop: 4,
    marginBottom: 4,
  },
  audioErrorText: {
    alignSelf: 'center',
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.error,
    marginBottom: 4,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(198,93,123,0.18)',
    marginVertical: 12,
  },
  builderLabel: {
    fontFamily: FONTS.body,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.plum,
    textAlign: 'center',
    marginBottom: 10,
  },
  slotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  slot: {
    minWidth: 44,
    height: 44,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(198,93,123,0.35)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  slotFilled: {
    borderStyle: 'solid',
    borderColor: COLORS.plum,
    backgroundColor: '#f2d4d4',
  },
  slotText: { fontFamily: FONTS.display, fontSize: 18, color: COLORS.deep },
  bankRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  bankBlock: {
    minWidth: 44,
    height: 44,
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.3)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    backgroundColor: COLORS.blush,
  },
  bankBlockText: { fontFamily: FONTS.display, fontSize: 18, color: COLORS.plum },
  builderActions: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  resetBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(198,93,123,0.3)',
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 20,
  },
  resetBtnText: { fontFamily: FONTS.body, fontSize: 13, fontWeight: '600', color: COLORS.plum },
  checkBtn: {
    backgroundColor: COLORS.plum,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 24,
  },
  checkBtnDisabled: { backgroundColor: 'rgba(198,93,123,0.25)' },
  checkBtnText: { fontFamily: FONTS.body, fontSize: 13, fontWeight: '700', color: '#f59b9b' },
  feedbackBox: { marginTop: 14, alignItems: 'center', gap: 4 },
  feedbackText: { fontFamily: FONTS.body, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  feedbackGood: { color: '#3F8F5F' },
  feedbackTryAgain: { color: COLORS.plum },
  correctSentence: {
    fontFamily: FONTS.display,
    fontSize: 18,
    color: COLORS.deep,
    textAlign: 'center',
  },
  transcriptToggle: { alignSelf: 'center' },
  transcriptToggleText: { fontFamily: FONTS.body, fontSize: 12, fontWeight: '600', color: COLORS.plum },
  transcriptBox: {
    backgroundColor: COLORS.blush,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  transcriptSectionLabel: {
    fontFamily: FONTS.body,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: COLORS.plum,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 4,
  },
  transcriptScript: {
    fontFamily: FONTS.display,
    fontSize: 17,
    color: COLORS.deep,
    textAlign: 'center',
  },
  transcriptMeaning: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.ink,
    textAlign: 'center',
  },
  transcriptDivider: {
    height: 1,
    backgroundColor: 'rgba(198,93,123,0.2)',
    marginVertical: 10,
  },
  transcriptExplanation: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.inkSoft,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  navRow: { flexDirection: 'row', gap: 12 },
  navBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(198,93,123,0.3)',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  navBtnText: { fontFamily: FONTS.body, fontSize: 13, fontWeight: '600', color: COLORS.plum },
  backLink: { marginTop: 4, paddingVertical: 6, paddingHorizontal: 10 },
  backLinkText: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.plum, fontWeight: '600' },
});