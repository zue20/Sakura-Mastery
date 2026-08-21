// src/features/quiz/data/kanaGroups.js
// Traditional gojūon-table ordering, chunked by row, for Practice mode.
// Used to browse Hiragana/Katakana in manageable groups instead of one flat list.

export const KANA_GROUPS = [
  { row: "a", script: "hiragana", items: [{ char: "あ", romaji: "a" }, { char: "い", romaji: "i" }, { char: "う", romaji: "u" }, { char: "え", romaji: "e" }, { char: "お", romaji: "o" }] },
  { row: "ka", script: "hiragana", items: [{ char: "か", romaji: "ka" }, { char: "き", romaji: "ki" }, { char: "く", romaji: "ku" }, { char: "け", romaji: "ke" }, { char: "こ", romaji: "ko" }] },
  { row: "sa", script: "hiragana", items: [{ char: "さ", romaji: "sa" }, { char: "し", romaji: "shi" }, { char: "す", romaji: "su" }, { char: "せ", romaji: "se" }, { char: "そ", romaji: "so" }] },
  { row: "ta", script: "hiragana", items: [{ char: "た", romaji: "ta" }, { char: "ち", romaji: "chi" }, { char: "つ", romaji: "tsu" }, { char: "て", romaji: "te" }, { char: "と", romaji: "to" }] },
  { row: "na", script: "hiragana", items: [{ char: "な", romaji: "na" }, { char: "に", romaji: "ni" }, { char: "ぬ", romaji: "nu" }, { char: "ね", romaji: "ne" }, { char: "の", romaji: "no" }] },
  { row: "ha", script: "hiragana", items: [{ char: "は", romaji: "ha" }, { char: "ひ", romaji: "hi" }, { char: "ふ", romaji: "fu" }, { char: "へ", romaji: "he" }, { char: "ほ", romaji: "ho" }] },
  { row: "ma", script: "hiragana", items: [{ char: "ま", romaji: "ma" }, { char: "み", romaji: "mi" }, { char: "む", romaji: "mu" }, { char: "め", romaji: "me" }, { char: "も", romaji: "mo" }] },
  { row: "ya", script: "hiragana", items: [{ char: "や", romaji: "ya" }, { char: "ゆ", romaji: "yu" }, { char: "よ", romaji: "yo" }] },
  { row: "ra", script: "hiragana", items: [{ char: "ら", romaji: "ra" }, { char: "り", romaji: "ri" }, { char: "る", romaji: "ru" }, { char: "れ", romaji: "re" }, { char: "ろ", romaji: "ro" }] },
  { row: "wa", script: "hiragana", items: [{ char: "わ", romaji: "wa" }, { char: "を", romaji: "wo" }] },
  { row: "n", script: "hiragana", items: [{ char: "ん", romaji: "n" }] },
  { row: "a", script: "katakana", items: [{ char: "ア", romaji: "a" }, { char: "イ", romaji: "i" }, { char: "ウ", romaji: "u" }, { char: "エ", romaji: "e" }, { char: "オ", romaji: "o" }] },
  { row: "ka", script: "katakana", items: [{ char: "カ", romaji: "ka" }, { char: "キ", romaji: "ki" }, { char: "ク", romaji: "ku" }, { char: "ケ", romaji: "ke" }, { char: "コ", romaji: "ko" }] },
  { row: "sa", script: "katakana", items: [{ char: "サ", romaji: "sa" }, { char: "シ", romaji: "shi" }, { char: "ス", romaji: "su" }, { char: "セ", romaji: "se" }, { char: "ソ", romaji: "so" }] },
  { row: "ta", script: "katakana", items: [{ char: "タ", romaji: "ta" }, { char: "チ", romaji: "chi" }, { char: "ツ", romaji: "tsu" }, { char: "テ", romaji: "te" }, { char: "ト", romaji: "to" }] },
  { row: "na", script: "katakana", items: [{ char: "ナ", romaji: "na" }, { char: "ニ", romaji: "ni" }, { char: "ヌ", romaji: "nu" }, { char: "ネ", romaji: "ne" }, { char: "ノ", romaji: "no" }] },
  { row: "ha", script: "katakana", items: [{ char: "ハ", romaji: "ha" }, { char: "ヒ", romaji: "hi" }, { char: "フ", romaji: "fu" }, { char: "ヘ", romaji: "he" }, { char: "ホ", romaji: "ho" }] },
  { row: "ma", script: "katakana", items: [{ char: "マ", romaji: "ma" }, { char: "ミ", romaji: "mi" }, { char: "ム", romaji: "mu" }, { char: "メ", romaji: "me" }, { char: "モ", romaji: "mo" }] },
  { row: "ya", script: "katakana", items: [{ char: "ヤ", romaji: "ya" }, { char: "ユ", romaji: "yu" }, { char: "ヨ", romaji: "yo" }] },
  { row: "ra", script: "katakana", items: [{ char: "ラ", romaji: "ra" }, { char: "リ", romaji: "ri" }, { char: "ル", romaji: "ru" }, { char: "レ", romaji: "re" }, { char: "ロ", romaji: "ro" }] },
  { row: "wa", script: "katakana", items: [{ char: "ワ", romaji: "wa" }, { char: "ヲ", romaji: "wo" }] },
  { row: "n", script: "katakana", items: [{ char: "ン", romaji: "n" }] },
];

export function getGroupsByScript(script) {
  return KANA_GROUPS.filter((g) => g.script === script);
}