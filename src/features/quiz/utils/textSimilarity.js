import { toHiraganaReading } from './kanjiReading';

// Normalized Levenshtein distance -> 0-100 accuracy score.
function levenshteinDistance(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const prev = new Array(n + 1);
  const curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,      // deletion
        curr[j - 1] + 1,  // insertion
        prev[j - 1] + cost // substitution
      );
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }
  return prev[n];
}

function normalize(str) {
  return (str ?? '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s。、！？「」『』・\.\,\!\?]/g, '');
}

// Both spoken and target text are converted to their hiragana READING
// via kuromoji before comparing — so kanji-vs-kana spelling differences
// (e.g. 音楽 vs おんがく) never affect the score, only actual
// pronunciation does.
export async function scoreAccuracy(spoken, target) {
  const [spokenReading, targetReading] = await Promise.all([
    toHiraganaReading(spoken),
    toHiraganaReading(target),
  ]);

  const a = normalize(spokenReading);
  const b = normalize(targetReading);
  if (!a || !b) return 0;

  const distance = levenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length);
  const similarity = maxLen === 0 ? 1 : 1 - distance / maxLen;

  return Math.max(0, Math.round(similarity * 100));
}