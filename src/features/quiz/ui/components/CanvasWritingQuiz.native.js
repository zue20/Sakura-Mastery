import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, PanResponder, Platform } from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { COLORS, FONTS } from '../../../dashboard/theme';
import { useResponsiveLayout } from '../../../../hooks/useResponsiveLayout';
import StrokeOrderReference from './StrokeOrderReference';

const BOX_SIZE_DESKTOP = 240;
const BOX_SIZE_MOBILE = 200;
const MIN_COVERAGE_RATIO = 0.12;

function boundingBoxArea(paths) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  paths.forEach((d) => {
    const points = d.match(/-?\d+(\.\d+)?,-?\d+(\.\d+)?/g) || [];
    points.forEach((pt) => {
      const [x, y] = pt.split(',').map(Number);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    });
  });

  if (!isFinite(minX)) return 0;
  return (maxX - minX) * (maxY - minY);
}


function ReferencePanel({ data, isCompact }) {
  return (
    <View style={[styles.referencePanel, isCompact && styles.referencePanelCompact]}>
      <Text style={styles.referenceChar}>{data.character ?? '?'}</Text>
      <View style={styles.referenceInfo}>
        {!!data.romaji && <Text style={styles.romaji}>{data.romaji}</Text>}
        {!!data.meaning && <Text style={styles.meaning}>{data.meaning}</Text>}
        {!!data.strokeCount && (
          <Text style={styles.strokeCount}>{data.strokeCount} strokes</Text>
        )}
      </View>
      <StrokeOrderReference character={data.character} />
    </View>
  );
}


export default function CanvasWritingQuiz({ question, workingAnswer, onChange, disabled }) {
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const canvasRef = useRef(null);
  const { isCompact } = useResponsiveLayout();

  const data = question.data ?? {};
  const boxSize = isCompact ? BOX_SIZE_MOBILE : BOX_SIZE_DESKTOP;

  const commitStroke = useCallback((pathStr) => {
    if (!pathStr) return;
    setPaths((prevPaths) => {
      const next = [...prevPaths, pathStr];
      const area = boundingBoxArea(next);
      const coverageOk = area / (boxSize * boxSize) >= MIN_COVERAGE_RATIO;

      queueMicrotask(() => {
        onChange({ attempted: coverageOk, strokeCount: next.length });
      });

      return next;
    });
  }, [onChange, boxSize]);

  // --- Native (iOS/Android app) input ---
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: (e) => {
          const { locationX, locationY } = e.nativeEvent;
          setCurrentPath(`M${locationX.toFixed(1)},${locationY.toFixed(1)}`);
        },
        onPanResponderMove: (e) => {
          const { locationX, locationY } = e.nativeEvent;
          setCurrentPath((prev) => `${prev} L${locationX.toFixed(1)},${locationY.toFixed(1)}`);
        },
        onPanResponderRelease: () => {
          setCurrentPath((prev) => {
            commitStroke(prev);
            return '';
          });
        },
      }),
    [disabled, commitStroke]
  );

  // --- Web input: native Pointer Events ---
  const isDrawingRef = useRef(false);

  const getRelativeCoords = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect?.();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handlePointerDown = useCallback((e) => {
    if (disabled) return;
    e.target.setPointerCapture?.(e.pointerId);
    isDrawingRef.current = true;
    const { x, y } = getRelativeCoords(e);
    setCurrentPath(`M${x.toFixed(1)},${y.toFixed(1)}`);
  }, [disabled, getRelativeCoords]);

  const handlePointerMove = useCallback((e) => {
    if (disabled || !isDrawingRef.current) return;
    const { x, y } = getRelativeCoords(e);
    setCurrentPath((prev) => `${prev} L${x.toFixed(1)},${y.toFixed(1)}`);
  }, [disabled, getRelativeCoords]);

  const handlePointerUp = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    setCurrentPath((prev) => {
      commitStroke(prev);
      return '';
    });
  }, [commitStroke]);

  const handleClear = useCallback(() => {
    setPaths([]);
    setCurrentPath('');
    onChange(undefined);
  }, [onChange]);

  const webPointerHandlers = Platform.OS === 'web'
    ? {
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp,
        onPointerLeave: handlePointerUp,
      }
    : {};

  const nativeHandlers = Platform.OS !== 'web' ? panResponder.panHandlers : {};

  return (
    <View style={[styles.workspace, isCompact ? styles.workspaceStacked : styles.workspaceSideBySide]}>
      <ReferencePanel data={data} isCompact={isCompact} />

      <View style={styles.canvasColumn}>
        <View
          ref={canvasRef}
          style={[
            styles.canvasBox,
            { width: boxSize, height: boxSize },
            Platform.OS === 'web' && styles.canvasBoxWeb,
          ]}
          {...nativeHandlers}
          {...webPointerHandlers}
        >
          <Svg width={boxSize} height={boxSize} style={StyleSheet.absoluteFill}>
            <SvgText
              x={boxSize / 2}
              y={boxSize / 2 + (isCompact ? 22 : 30)}
              fontSize={isCompact ? 110 : 140}
              fill="rgba(198,93,123,0.14)"
              textAnchor="middle"
            >
              {data.character ?? '?'}
            </SvgText>

            {paths.map((d, i) => (
              <Path key={i} d={d} stroke={COLORS.plum} strokeWidth={4} fill="none" strokeLinecap="round" />
            ))}
            {currentPath ? (
              <Path d={currentPath} stroke={COLORS.plum} strokeWidth={4} fill="none" strokeLinecap="round" />
            ) : null}
          </Svg>
        </View>

        <Pressable style={styles.clearBtn} onPress={handleClear} disabled={disabled}>
          <Text style={styles.clearBtnText}>↺ Clear</Text>
        </Pressable>

        <Text style={styles.hint}>
          Trace the faint character on the canvas. Checked against the expected stroke count —
          full shape/order accuracy is coming in a future update.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  workspace: { width: '100%', alignItems: 'center' },
  workspaceSideBySide: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: 24 },
  workspaceStacked: { flexDirection: 'column', gap: 14 },

  referencePanel: {
    alignItems: 'center',
    backgroundColor: 'rgba(247, 155, 155, 0.5)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.25)',
    paddingVertical: 20,
    paddingHorizontal: 18,
    minWidth: 120,
  },
  referencePanelCompact: { width: '100%', maxWidth: 240, paddingVertical: 14 },

  referenceChar: { fontFamily: FONTS.display, fontSize: 56, color: COLORS.deep, marginBottom: 8 },
  referenceInfo: { alignItems: 'center', gap: 2 },
  romaji: { fontFamily: FONTS.body, fontSize: 14, fontWeight: '700', color: COLORS.plum },
  meaning: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft },
  strokeCount: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.gold, fontWeight: '700', marginTop: 4 },

  canvasColumn: { alignItems: 'center' },
  canvasBox: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(198,93,123,0.3)',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  canvasBoxWeb: {
    ...Platform.select({ web: { touchAction: 'none', cursor: 'crosshair', userSelect: 'none' } }),
  },

  clearBtn: { marginTop: 12, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10, backgroundColor: COLORS.blush },
  clearBtnText: { fontFamily: FONTS.body, fontSize: 12, fontWeight: '700', color: COLORS.plum },
  hint: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.inkSoft, textAlign: 'center', marginTop: 10, maxWidth: 260 },
});