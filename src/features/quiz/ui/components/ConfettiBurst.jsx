import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import Confetti from 'react-confetti';

const EMOJIS = ['🎉', '🌸', '✨', '🎊', '⭐'];
const PIECE_COUNT = 220;
const EMOJI_RATIO = 4;

/**
 * @param {boolean} trigger - fire a one-shot 5s burst (ignored if continuous=true)
 * @param {boolean} continuous - loop indefinitely (recycle particles) until unmounted
 *   by the parent. Use this for "stays up until the user dismisses it" screens.
 */
export default function ConfettiBurst({ trigger, continuous = false }) {
  const { width, height } = useWindowDimensions();
  const [show, setShow] = useState(continuous);
  const frameCounterRef = useRef(0);

  useEffect(() => {
    if (continuous) {
      setShow(true);
      return;
    }
    if (!trigger) return;
    setShow(true);
    frameCounterRef.current = 0;
    const hideTimer = setTimeout(() => setShow(false), 5000);
    return () => clearTimeout(hideTimer);
  }, [trigger, continuous]);

  const drawShape = useCallback((ctx) => {
    const index = frameCounterRef.current % PIECE_COUNT;
    frameCounterRef.current += 1;

    if (index % EMOJI_RATIO === 0) {
      const emoji = EMOJIS[Math.floor(index / EMOJI_RATIO) % EMOJIS.length];
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, 0, 0);
      return;
    }

    ctx.beginPath();
    ctx.rect(-6, -4, 12, 8);
    ctx.closePath();
    ctx.fill();
  }, []);

  if (Platform.OS !== 'web' || !show) return null;

  return (
    <Confetti
      width={width}
      height={height}
      numberOfPieces={PIECE_COUNT}
      recycle={continuous}
      gravity={0.28}
      wind={0.01}
      initialVelocityY={{ min: -2, max: 4 }}
      colors={['#FFB7C5', '#BC2934', '#6A9A6A', '#D8A25A', '#F8F7F0']}
      drawShape={drawShape}
      style={{ position: 'fixed', top: 0, left: 0, zIndex: 5, pointerEvents: 'none' }}
    />
  );
}