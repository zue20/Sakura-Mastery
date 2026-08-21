import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';

const BAR_COUNT = 24;

export function LiveWaveform({ stream, isActive }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!stream || !isActive) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioCtx();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    audioCtx.createMediaStreamSource(stream).connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      analyser.getByteFrequencyData(data);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = canvas.width / BAR_COUNT;
      for (let i = 0; i < BAR_COUNT; i++) {
        const v = data[i] || 0;
        const barHeight = Math.max(3, (v / 255) * canvas.height);
        ctx.fillStyle = '#D4537E';
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 2, barHeight);
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      audioCtx.close();
    };
  }, [stream, isActive]);

  return (
    <View style={{ height: 48, width: '100%' }}>
      <canvas ref={canvasRef} width={280} height={48} style={{ width: '100%', height: '100%' }} />
    </View>
  );
}