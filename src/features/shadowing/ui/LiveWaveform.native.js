import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const BAR_COUNT = 12;

export function LiveWaveform({ metering, isActive }) {
  const heights = useRef([...Array(BAR_COUNT)].map(() => new Animated.Value(4))).current;

  useEffect(() => {
    if (!isActive) return;
    const normalized = Math.min(1, Math.max(0, (metering + 60) / 60)); // -60dB..0dB → 0..1
    heights.forEach((h) => {
      const jitter = 0.6 + Math.random() * 0.4;
      Animated.timing(h, {
        toValue: 4 + normalized * 40 * jitter,
        duration: 100,
        useNativeDriver: false,
      }).start();
    });
  }, [metering, isActive]);

  return (
    <View style={styles.row}>
      {heights.map((h, i) => (
        <Animated.View key={i} style={[styles.bar, { height: h }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', height: 48, gap: 4, justifyContent: 'center' },
  bar: { width: 6, backgroundColor: '#D4537E', borderRadius: 3 },
});