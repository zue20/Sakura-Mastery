import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, Modal, ScrollView, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../features/dashboard/theme';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

const CATEGORIES = [
  {
    id: 'sokuon',
    title: 'Double Consonants (っ / ッ — Sokuon)',
    explanation:
      'A small っ or ッ before a consonant means: pause briefly, then hit that consonant harder — like the double "t" in "hot tea" said quickly.',
    examples: [
      { kana: 'がっこう', romaji: 'gakkou', note: '"school"' },
      { kana: 'きって', romaji: 'kitte', note: '"stamp"' },
      { kana: 'ざっし', romaji: 'zasshi', note: '"magazine"' },
      { kana: 'いっぱい', romaji: 'ippai', note: '"a lot / full"' },
      { kana: 'けっこん', romaji: 'kekkon', note: '"marriage"' },
      { kana: 'ちょっと', romaji: 'chotto', note: '"a little"' },
      { kana: 'やっぱり', romaji: 'yappari', note: '"as expected"' },
      { kana: 'せっけん', romaji: 'sekken', note: '"soap"' },
      { kana: 'しゅっぱつ', romaji: 'shuppatsu', note: '"departure"' },
      { kana: 'きっぷ', romaji: 'kippu', note: '"ticket"' },
    ],
  },
  {
    id: 'choonpu',
    title: 'Long Vowels (長音 — Chouonpu)',
    explanation:
      'Some vowels are held for twice as long. In hiragana this is usually an extra vowel letter; in katakana, a dash ー does the same job. Holding the vowel the right length can change the word entirely.',
    examples: [
      { kana: 'おばあさん', romaji: 'obaasan', note: '"grandmother"' },
      { kana: 'おじいさん', romaji: 'ojiisan', note: '"grandfather"' },
      { kana: 'こうこう', romaji: 'koukou', note: '"high school"' },
      { kana: 'せいと', romaji: 'seito', note: '"student"' },
      { kana: 'コーヒー', romaji: 'koohii', note: '"coffee"' },
      { kana: 'とうきょう', romaji: 'toukyou', note: '"Tokyo"' },
      { kana: 'おおきい', romaji: 'ookii', note: '"big"' },
      { kana: 'くうこう', romaji: 'kuukou', note: '"airport"' },
      { kana: 'びょういん', romaji: 'byouin', note: '"hospital"' },
      { kana: 'ゆうめい', romaji: 'yuumei', note: '"famous"' },
    ],
  },
  {
    id: 'syllabicn',
    title: 'The Syllabic ん (N)',
    explanation:
      'ん is a full syllable on its own, not silent and not attached to the sound before it. It always takes up its own beat, even though its exact sound shifts slightly depending on what follows.',
    examples: [
      { kana: 'ほん', romaji: 'hon', note: '"book"' },
      { kana: 'にほん', romaji: 'nihon', note: '"Japan"' },
      { kana: 'てんき', romaji: 'tenki', note: '"weather"' },
      { kana: 'せんせい', romaji: 'sensei', note: '"teacher"' },
      { kana: 'きょうと', romaji: 'kyouto', note: '"Kyoto"' },
      { kana: 'せんぱい', romaji: 'senpai', note: '"senior/upperclassman"' },
      { kana: 'ほんとう', romaji: 'hontou', note: '"really / true"' },
      { kana: 'えんぴつ', romaji: 'enpitsu', note: '"pencil"' },
      { kana: 'しんぶん', romaji: 'shinbun', note: '"newspaper"' },
      { kana: 'べんきょう', romaji: 'benkyou', note: '"studying"' },
    ],
  },
  {
    id: 'dakuon',
    title: 'Dakuon & Handakuon (Voiced / Semi-Voiced)',
    explanation:
      'Two small marks change a consonant\'s sound: ﾞ (dakuten) voices it — か "ka" becomes が "ga" — and ﾟ (handakuten) softens h-row sounds into a p sound — は "ha" becomes ぱ "pa".',
    examples: [
      { kana: 'でんわ', romaji: 'denwa', note: '"telephone"' },
      { kana: 'ぎんこう', romaji: 'ginkou', note: '"bank"' },
      { kana: 'パン', romaji: 'pan', note: '"bread"' },
      { kana: 'ペン', romaji: 'pen', note: '"pen"' },
      { kana: 'ポスト', romaji: 'posuto', note: '"mailbox"' },
      { kana: 'がいこく', romaji: 'gaikoku', note: '"foreign country"' },
      { kana: 'じどうしゃ', romaji: 'jidousha', note: '"automobile"' },
      { kana: 'びじゅつかん', romaji: 'bijutsukan', note: '"art museum"' },
      { kana: 'パソコン', romaji: 'pasokon', note: '"computer"' },
      { kana: 'てんぷら', romaji: 'tenpura', note: '"tempura"' },
    ],
  },
  {
    id: 'devoicing',
    title: 'Unvoiced Vowels & Particle Shifts',
    explanation:
      'Two separate quirks beginners hit early: certain vowels (often i/u between voiceless consonants, or at the end of a word) get "whispered" rather than fully voiced — and three particles are written with one kana but pronounced as a different one.',
    examples: [
      { kana: 'です', romaji: 'desu', note: 'final "u" is barely voiced' },
      { kana: 'たべます', romaji: 'tabemasu', note: 'final "u" is barely voiced' },
      { kana: 'すき', romaji: 'suki', note: '"i" softens between s/k' },
      { kana: 'ですか', romaji: 'desu ka', note: 'final "u" stays soft' },
      { kana: 'だいすき', romaji: 'daisuki', note: '"i" softens between s/k' },
      { kana: 'こんにちは', romaji: "kon'nichiwa", note: 'は here is read "wa," not "ha"' },
      { kana: 'せんせいは', romaji: 'sensei wa', note: 'は as topic marker = "wa"' },
      { kana: 'がっこうへ', romaji: 'gakkou e', note: 'へ as direction marker = "e," not "he"' },
      { kana: 'とうきょうへ', romaji: 'toukyou e', note: 'へ as direction marker = "e"' },
      { kana: 'みずをのみます', romaji: 'mizu o nomimasu', note: 'を as object marker = "o," not "wo"' },
    ],
  },
];

export default function PronunciationRulesButton({ level }) {
  const [visible, setVisible] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const { speak } = useTextToSpeech();

  const handleListen = useCallback(
    (kana) => {
      speak(kana, { lang: 'ja-JP' });
    },
    [speak]
  );

  // Gate stays local to this component so no other file needs an if-check.
  if (level !== 'N5') return null;

  return (
    <View style={styles.overlayRoot} pointerEvents="box-none">
      <Pressable
        style={styles.fab}
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Beginner Phonetics guide"
      >
        <Text style={styles.fabIcon}>?</Text>
      </Pressable>

      <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>🌸 Beginner Phonetics</Text>
                <Text style={styles.modalSubtitle}>N5 Pronunciation Guide</Text>
              </View>
              <Pressable onPress={() => setVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              {CATEGORIES.map((cat) => {
                const isOpen = expandedId === cat.id;
                return (
                  <View key={cat.id} style={styles.categoryBlock}>
                    <Pressable
                      style={styles.categoryHeader}
                      onPress={() => setExpandedId(isOpen ? null : cat.id)}
                    >
                      <Text style={styles.categoryTitle}>{cat.title}</Text>
                      <Text style={styles.categoryChevron}>{isOpen ? '▲' : '▼'}</Text>
                    </Pressable>

                    {isOpen && (
                      <View style={styles.categoryContent}>
                        <Text style={styles.categoryExplanation}>{cat.explanation}</Text>
                        {cat.examples.map((ex) => (
                          <View key={ex.kana} style={styles.exampleRow}>
                            <Pressable
                              onPress={() => handleListen(ex.kana)}
                              style={styles.listenIconBtn}
                              accessibilityRole="button"
                              accessibilityLabel={`Listen to ${ex.romaji}`}
                            >
                              <Text style={styles.listenIcon}>🔈</Text>
                            </Pressable>
                            <View style={styles.exampleTextWrap}>
                              <Text style={styles.exampleKana}>{ex.kana}</Text>
                              <Text style={styles.exampleRomaji}>{ex.romaji}</Text>
                              <Text style={styles.exampleNote}>{ex.note}</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayRoot: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.plum,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3A2C33',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: { color: '#fff', fontSize: 20, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.paperStrong ?? '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    maxWidth: 480,        // new — caps it on wide screens
    width: '100%',        // new — still fills narrow (phone) screens
    alignSelf: 'center',  // new — centers the capped card on wide screens
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalTitle: { fontFamily: FONTS.display, fontSize: 18, color: COLORS.deep },
  modalSubtitle: {
    fontFamily: FONTS.body,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  closeBtn: { padding: 6 },
  closeBtnText: { fontSize: 18, color: COLORS.inkSoft },
  modalBody: { paddingBottom: 20, gap: 12 },

  categoryBlock: {
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.18)',
    borderRadius: 14,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(198,93,123,0.06)',
  },
  categoryTitle: { fontFamily: FONTS.body, fontSize: 14, fontWeight: '700', color: COLORS.plum, flex: 1, marginRight: 8 },
  categoryChevron: { fontSize: 12, color: COLORS.inkSoft },
  categoryContent: { padding: 14, gap: 8 },
  categoryExplanation: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.inkSoft, lineHeight: 18, marginBottom: 6 },

  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(198,93,123,0.04)',
    borderRadius: 10,
    padding: 8,
  },
  listenIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listenIcon: { fontSize: 12 },
  exampleTextWrap: { flex: 1 },
  exampleKana: { fontFamily: FONTS.display, fontSize: 16, color: COLORS.deep },
  exampleRomaji: { fontFamily: FONTS.body, fontSize: 11, fontWeight: '600', color: COLORS.plum },
  exampleNote: { fontFamily: FONTS.body, fontSize: 10, color: COLORS.inkSoft, fontStyle: 'italic' },
});