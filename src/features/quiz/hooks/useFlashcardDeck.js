import { useState, useCallback, useMemo } from 'react';

/**
 * Manages a simple flashcard deck: current index, flip state, next/prev.
 * @param {Array<{front: string, back: string}>} cards
 */
export function useFlashcardDeck(cards = []) {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = cards[index] ?? null;
  const isFirst = index === 0;
  const isLast = index === cards.length - 1;

  const flip = useCallback((value) => setIsFlipped(value), []);

  const next = useCallback(() => {
    setIndex((i) => Math.min(i + 1, cards.length - 1));
    setIsFlipped(false); // always start the next card front-facing
  }, [cards.length]);

  const previous = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
    setIsFlipped(false);
  }, []);

  const reset = useCallback(() => {
    setIndex(0);
    setIsFlipped(false);
  }, []);

  const progress = useMemo(() => ({
    current: index + 1,
    total: cards.length,
    percent: cards.length ? Math.round(((index + 1) / cards.length) * 100) : 0,
  }), [index, cards.length]);

  return { currentCard, isFlipped, isFirst, isLast, progress, flip, next, previous, reset };
}