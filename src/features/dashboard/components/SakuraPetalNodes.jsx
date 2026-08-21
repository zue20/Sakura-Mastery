import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { COLORS, FONTS } from '../theme';

const NODE_CONFIG = {
  basic: { label: 'Basic', icon: '🏮', category: 'basic' },
  kanji: { label: 'Kanji', icon: '漢', category: 'kanji' },
  grammar: { label: 'Grammar', icon: '文', category: 'grammar' },
  vocabulary: { label: 'Vocabulary', icon: '🎴', category: 'vocabulary' },
  listening: { label: 'Listening', icon: '📻', category: 'listening' },
  speaking: { label: 'Speaking', icon: '🎤', category: 'speaking' },
};

const LEVEL_NODE_ORDER = {
  N5: ['basic', 'kanji', 'grammar', 'vocabulary', 'listening', 'speaking'],
  N4: ['kanji', 'grammar', 'vocabulary', 'listening', 'speaking'],
};

const RADIUS_PERCENT = 42;
const DEFAULT_NODE_SIZE = 88;

export default function SakuraPetalNodes({ currentLevel, onQuizNavigate, nodeSize = DEFAULT_NODE_SIZE }) {
  const nodeKeys = LEVEL_NODE_ORDER[currentLevel] || LEVEL_NODE_ORDER.N5;

  const positionedNodes = useMemo(() => {
    const count = nodeKeys.length;
    return nodeKeys.map((key, index) => {
      const angleDeg = (360 / count) * index - 90;
      const angleRad = (angleDeg * Math.PI) / 180;
      const left = 50 + RADIUS_PERCENT * Math.cos(angleRad);
      const top = 50 + RADIUS_PERCENT * Math.sin(angleRad);
      return { ...NODE_CONFIG[key], key, left, top, index };
    });
  }, [currentLevel]);

  return (
    <View style={styles.ring} pointerEvents="box-none">
      {positionedNodes.map((node) => (
        <PetalNode
          key={`${currentLevel}-${node.key}`}
          node={node}
          nodeSize={nodeSize}
          onPress={() => onQuizNavigate(currentLevel, node.category)}
        />
      ))}
    </View>
  );
}

function PetalNode({ node, nodeSize, onPress }) {
  const entrance = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;
  const loopRef = useRef(null);

  useEffect(() => {
    const entranceAnim = Animated.timing(entrance, {
      toValue: 1,
      duration: 700,
      delay: node.index * 100,
      useNativeDriver: false,
    });

    entranceAnim.start(() => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(sway, { toValue: 1, duration: 1800 + node.index * 120, useNativeDriver: false }),
          Animated.timing(sway, { toValue: 0, duration: 1800 + node.index * 120, useNativeDriver: false }),
        ])
      );
      loop.start();
      loopRef.current = loop;
    });

    return () => {
      entranceAnim.stop();
      if (loopRef.current) loopRef.current.stop();
    };
  }, []);

  const entranceScale = entrance.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const entranceTranslateY = entrance.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] });
  const swayTranslateY = sway.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  const swayRotate = sway.interpolate({ inputRange: [0, 1], outputRange: ['-2deg', '2deg'] });

  const iconFontSize = clamp(nodeSize * 0.2, 14, 18);
  const labelFontSize = clamp(nodeSize * 0.11, 9, 10);

  return (
    <Animated.View
      style={[
        styles.nodeWrap,
        {
          width: nodeSize,
          height: nodeSize,
          left: `${node.left}%`,
          top: `${node.top}%`,
          opacity: entrance,
          transform: [
            { translateX: -nodeSize / 2 },
            { translateY: -nodeSize / 2 },
            { scale: entranceScale },
            { translateY: entranceTranslateY },
            { translateY: swayTranslateY },
            { rotate: swayRotate },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.touchArea}
        activeOpacity={0.85}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${node.label} quiz`}
      >
        <View
          style={[
            styles.petalShape,
            { transform: [{ rotate: `${45 + node.index * 12}deg` }] },
          ]}
        />
        <Text style={[styles.petalIcon, { fontSize: iconFontSize }]}>{node.icon}</Text>
        <Text style={[styles.petalLabel, { fontSize: labelFontSize, maxWidth: nodeSize * 0.85 }]} numberOfLines={1}>
          {node.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

const styles = StyleSheet.create({
  ring: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeWrap: {
    position: 'absolute',
  },
  touchArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petalShape: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    borderRadius: 44,
    borderTopLeftRadius: 0,
   backgroundColor: '#efc6d7', // ပန်းရောင်နုနု
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.35)',
    shadowColor: '#3A2C33',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
    ...Platform.select({
      web: { backdropFilter: 'blur(8px)' },
      default: {},
    }),
  },
  petalIcon: { marginBottom: 2 },
  petalLabel: {
    fontFamily: FONTS.body,
    fontWeight: '800',
    color: '#4A1525',
    textAlign: 'center',
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});