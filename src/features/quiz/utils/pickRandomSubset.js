

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Returns a random subset of `items`, sized randomly between min and max
 * (inclusive), clamped to the pool size. Order is shuffled.
 */
export function pickRandomSubset(items = [], min = 10, max = 15) {
  if (!Array.isArray(items) || items.length === 0) return [];
  const size = Math.min(items.length, min + Math.floor(Math.random() * (max - min + 1)));
  return shuffle(items).slice(0, size);
}