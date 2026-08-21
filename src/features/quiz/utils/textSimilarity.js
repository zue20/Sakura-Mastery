import { convertKanjiToKana } from './kanaDictionary';

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
  const kanaConverted = convertKanjiToKana((str ?? '').toString());
  return kanaConverted
    .trim()
    .toLowerCase()
    .replace(/[\s。、！？「」『』・\.\,\!\?]/g, '');
}

export function scoreAccuracy(spoken, target) {
  const a = normalize(spoken);
  const b = normalize(target);
  if (!a || !b) return 0;

  const distance = levenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length);
  const similarity = maxLen === 0 ? 1 : 1 - distance / maxLen;

  return Math.max(0, Math.round(similarity * 100));
}