import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../dashboard/theme';

export function TTSAudioRow({ text, lang = 'ja-JP', showSpeedToggle = true }) {
  const [rate, setRate] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = () => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = rate;
    utter.onstart = () => setIsPlaying(true);
    utter.onend = () => setIsPlaying(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  const toggleSpeed = () => setRate((r) => (r === 1 ? 0.75 : 1));

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Native audio</Text>
      <View style={styles.row}>
        <Pressable onPress={play} style={styles.playBtn}>
          <Text style={styles.playIcon}>{isPlaying ? '❙❙' : '▶'}</Text>
        </Pressable>
        <Text style={styles.phraseText}>{text}</Text>
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
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface2, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10, gap: 10 },
  playBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.accentLight, alignItems: 'center', justifyContent: 'center' },
  playIcon: { fontSize: 12, color: COLORS.accent },
  phraseText: { flex: 1, fontSize: 15, color: COLORS.text },
  speedBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: COLORS.surface1 },
  speedText: { fontSize: 12, color: COLORS.textSecondary, ...FONTS.medium },
});