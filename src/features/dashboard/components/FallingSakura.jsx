import React, { useEffect, useRef, useMemo } from 'react';
import { View, Animated, StyleSheet, Dimensions, Easing } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Tweak these to control density / feel
const PETAL_COUNT = 14;
const MIN_DURATION = 9000;
const MAX_DURATION = 16000;
const MIN_SIZE = 14;
const MAX_SIZE = 26;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function Petal({ delay }) {
  const fall = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;

  // Randomize each petal's own path/size/speed once, on mount.
  const config = useMemo(() => ({
    startX: randomBetween(0, SCREEN_WIDTH),
    size: randomBetween(MIN_SIZE, MAX_SIZE),
    duration: randomBetween(MIN_DURATION, MAX_DURATION),
    swayRange: randomBetween(20, 60),
    rotateDir: Math.random() > 0.5 ? 1 : -1,
    opacity: randomBetween(0.45, 0.85),
  }), []);

  useEffect(() => {
    const fallLoop = () => {
      fall.setValue(0);
      Animated.timing(fall, {
        toValue: 1,
        duration: config.duration,
        delay,
        easing: Easing.linear,
        useNativeDriver: false, // animating top/left position, not just transform/opacity
      }).start(() => fallLoop()); // restart from the top once it reaches bottom
    };
    fallLoop();

    const swayLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, {
          toValue: 1,
          duration: randomBetween(1800, 3000),
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(sway, {
          toValue: 0,
          duration: randomBetween(1800, 3000),
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );
    swayLoop.start();

    return () => swayLoop.stop();
  }, []);

  const translateY = fall.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, SCREEN_HEIGHT + 40],
  });

  const translateX = sway.interpolate({
    inputRange: [0, 1],
    outputRange: [-config.swayRange, config.swayRange],
  });

  const rotate = fall.interpolate({
    inputRange: [0, 1],
    outputRange: [`0deg`, `${360 * config.rotateDir}deg`],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.petal,
        {
          width: config.size,
          height: config.size,
          opacity: config.opacity,
          left: config.startX,
          transform: [
            { translateY },
            { translateX },
            { rotate },
          ],
        },
      ]}
    />
  );
}

export default function FallingSakura({ count = PETAL_COUNT }) {
  const petals = useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      id: i,
      delay: randomBetween(0, 6000), // stagger start times so they don't all fall together
    })),
    [count]
  );

  return (
    <View style={styles.container} pointerEvents="none">
      {petals.map((p) => (
        <Petal key={p.id} delay={p.delay} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 5, // above background photo, below interactive UI
  },
  petal: {
    position: 'absolute',
    top: 0,
    backgroundColor: '#e999a5', // COLORS.blush
    borderRadius: 20,
    borderTopLeftRadius: 0, // gives it the asymmetric petal silhouette
  },
});