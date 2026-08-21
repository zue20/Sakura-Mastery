
const KANJI_TO_KANA = {
  '行きません': 'いきません',
  '食べます': 'たべます',
  '飲みます': 'のみます',
  '行きます': 'いきます',
  '見ます': 'みます',
  '家族': 'かぞく',
  '写真': 'しゃしん',
  '日本': 'にほん',
  '学校': 'がっこう',
  '先生': 'せんせい',
  '友達': 'ともだち',
  '時間': 'じかん',
  '仕事': 'しごと',
  '会社': 'かいしゃ',
  '電話': 'でんわ',
  '何時': 'なんじ',
  '行き': 'いき',
  '今': 'いま',
  '疲れました': 'つかれました',
  '疲れ': 'つかれ',
  '美味しい': 'おいしい',
  '家': 'いえ',
  '全て': 'すべて',
};

// Longest keys first, so multi-character words are matched before any
// shorter substring that happens to appear inside them
// (e.g. "行きます" must be checked before "行き").
const SORTED_KEYS = Object.keys(KANJI_TO_KANA).sort((a, b) => b.length - a.length);

export function convertKanjiToKana(text) {
  if (!text) return text;
  let result = text;
  for (const kanji of SORTED_KEYS) {
    if (result.includes(kanji)) {
      result = result.split(kanji).join(KANJI_TO_KANA[kanji]);
    }
  }
  return result;
}