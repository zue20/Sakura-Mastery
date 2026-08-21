import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useFetchQuestions } from '../hooks/useFetchQuestions';
import PracticeMode from './components/PracticeMode';
import PracticeCompleteScreen from './components/PracticeCompleteScreen';
import { COLORS, FONTS } from '../../dashboard/theme';

export default function SpeakingPracticeScreen({ route, navigation }) {
  const [sessionKey, setSessionKey] = useState(0);
  const handleRestart = useCallback(() => setSessionKey((k) => k + 1), []);
  return (
    <SpeakingPracticeScreenInner
      key={sessionKey}
      route={route}
      navigation={navigation}
      onRestart={handleRestart}
    />
  );
}

function SpeakingPracticeScreenInner({ route, navigation, onRestart }) {
  const { title, moduleType, level } = route?.params ?? {};
  const { questions } = useFetchQuestions({ moduleType, level });

  const [index, setIndex] = useState(0);
  const [showComplete, setShowComplete] = useState(false);

  const current = Array.isArray(questions) ? questions[index] : null;
  const total = Array.isArray(questions) ? questions.length : 0;
  const isFirst = index === 0;
  const isLast = index === total - 1;

  useEffect(() => {
    setIndex(0);
  }, [moduleType, level]);

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
        <Text style={styles.progress}>Loading speaking practice…</Text>
      </View>
    );
  }

  if (total === 0) {
    return (
      <View style={styles.root}>
        <Text style={styles.title}>Speak Out Loud</Text>
        <Text style={styles.progress}>No speaking practice available yet.</Text>
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
        description={`You've gone through all ${total} speaking phrases.`}
        onRestart={onRestart}
        onExit={handleExit}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <View style={styles.headerRow}>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeIcon}>🗣️</Text>
        </View>
        <Text style={styles.title}>Speak Out Loud</Text>
        <Text style={styles.progress}>{index + 1} / {total}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cornerPetal}>🌸🌸</Text>

        <PracticeMode question={current} />
      </View>

      <View style={styles.navRow}>
        <Pressable style={[styles.navBtn, isFirst && styles.navBtnDisabled]} onPress={goPrevious} disabled={isFirst}>
          <Text style={[styles.navBtnText, isFirst && styles.navBtnTextDisabled]}>← Previous</Text>
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
  root: { flexGrow: 1, alignItems: 'center', padding: 24, paddingTop: 32, backgroundColor: COLORS.bg },
  headerRow: { alignItems: 'center', marginBottom: 20 },
  headerBadge: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(198,93,123,0.12)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  headerBadgeIcon: { fontSize: 20 },
  title: { fontFamily: FONTS.display, fontSize: 24, fontWeight: '700', color: COLORS.deep, textAlign: 'center' },
  progress: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.inkSoft, textAlign: 'center', marginTop: 4 },
  card: {
    width: '100%', maxWidth: 480, backgroundColor: COLORS.paperStrong,
    borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)',
    padding: 26, position: 'relative',
    shadowColor: '#3A2C33',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 5,
  },
  navRow: { flexDirection: 'row', gap: 24, marginTop: 24, alignItems: 'center' },
  navBtn: {
    paddingVertical: 10, paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1, borderColor: 'rgba(198,93,123,0.2)',
  },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { fontFamily: FONTS.body, fontSize: 13, fontWeight: '700', color: COLORS.plum },
  navBtnTextDisabled: { color: COLORS.inkSoft },
  backLink: { marginTop: 18, paddingVertical: 6, paddingHorizontal: 10 },
  backLinkText: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.plum, fontWeight: '600' },
});