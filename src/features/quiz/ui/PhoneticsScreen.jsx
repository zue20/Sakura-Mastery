import React, { useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../dashboard/theme';
import { useTextToSpeech } from '../../../hooks/useTextToSpeech';

const CATEGORIES = [
  {
    id: 'sokuon',
    title: 'Double Consonants (Sokuon — っ / ッ)',
    badgeColor: COLORS.plum,
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
    title: 'Long Vowels (Chouonpu)',
    badgeColor: COLORS.gold,
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
    badgeColor: COLORS.pink,
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
    badgeColor: COLORS.success ?? '#3F8F5F',
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
    badgeColor: '#8E6FB0',
    explanation:
      'Two separate quirks beginners hit early: certain vowels get "whispered" rather than fully voiced — and three particles are written with one kana but pronounced as a different one.',
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

export default function PhoneticsScreen({ navigation }) {
  const { speak } = useTextToSpeech();

  const handleListen = useCallback(
    (kana) => {
      speak(kana, { lang: 'ja-JP' });
    },
    [speak]
  );

  const handleExit = useCallback(() => navigation?.goBack(), [navigation]);

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <Text style={styles.title}>🌸 Phonetics Guide</Text>
      <Text style={styles.subtitle}>N5 Foundational Pronunciation Rules</Text>

      {CATEGORIES.map((cat) => (
        <View key={cat.id} style={styles.categoryCard}>
          <View style={[styles.badge, { backgroundColor: cat.badgeColor }]}>
            <Text style={styles.badgeText}>{cat.title}</Text>
          </View>

          <Text style={styles.explanation}>{cat.explanation}</Text>

          {cat.examples.map((ex) => (
            <View key={ex.kana} style={styles.exampleRow}>
              <Pressable
                onPress={() => handleListen(ex.kana)}
                style={styles.listenBtn}
                accessibilityRole="button"
                accessibilityLabel={`Listen to ${ex.romaji}`}
              >
                <Text style={styles.listenIcon}>🔈</Text>
              </Pressable>
              <View style={styles.exampleTextWrap}>
                <Text style={styles.exampleKana}>{ex.kana}</Text>
                <Text style={styles.exampleRomaji}>{ex.romaji}</Text>
              </View>
              <Text style={styles.exampleMeaning}>{ex.meaning}</Text>
            </View>
          ))}
        </View>
      ))}

      <Pressable style={styles.backLink} onPress={handleExit}>
        <Text style={styles.backLinkText}>← Back</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    paddingBottom: 50,
    backgroundColor: COLORS.bg,
    gap: 16,
  },
  title: { fontFamily: FONTS.display, fontSize: 22, color: COLORS.deep, textAlign: 'center' },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: -8,
  },
  categoryCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: COLORS.paperStrong,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.2)',
    padding: 18,
    gap: 10,
    shadowColor: '#3A2C33',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  badgeText: { fontFamily: FONTS.body, fontSize: 12, fontWeight: '700', color: '#fff' },
  explanation: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft, lineHeight: 19 },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(198,93,123,0.05)',
    borderRadius: 10,
    padding: 10,
  },
  listenBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listenIcon: { fontSize: 13 },
  exampleTextWrap: { flex: 1 },
  exampleKana: { fontFamily: FONTS.display, fontSize: 18, color: COLORS.deep },
  exampleRomaji: { fontFamily: FONTS.body, fontSize: 11, fontWeight: '600', color: COLORS.plum },
  exampleMeaning: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.inkSoft, fontStyle: 'italic' },
  backLink: { marginTop: 4, paddingVertical: 6, paddingHorizontal: 10 },
  backLinkText: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.plum, fontWeight: '600' },
});