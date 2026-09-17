import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/instrument';

const CELL = 46;
const GRID_COLOR = 'rgba(245, 243, 238, 0.022)';

/**
 * Full-bleed atmosphere for the "instrument" theme:
 * a faint measurement grid, a warm signal-glow anchored top-right,
 * and hairline registration ticks in the corners.
 */
function GridBackdrop() {
  const { width, height } = useWindowDimensions();
  const cols = Math.ceil(width / CELL);
  const rows = Math.ceil(height / CELL);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Vertical rules */}
      {Array.from({ length: cols }).map((_, i) => (
        <View
          key={`v${i}`}
          style={[styles.vLine, { left: i * CELL }]}
        />
      ))}
      {/* Horizontal rules */}
      {Array.from({ length: rows }).map((_, i) => (
        <View
          key={`h${i}`}
          style={[styles.hLine, { top: i * CELL }]}
        />
      ))}

      {/* Signal glow, top-right */}
      <LinearGradient
        colors={[colors.accentSoft, 'transparent']}
        start={{ x: 0.9, y: 0 }}
        end={{ x: 0.2, y: 0.55 }}
        style={styles.glow}
      />

      {/* Corner registration ticks */}
      <View style={[styles.tickH, styles.tlH]} />
      <View style={[styles.tickV, styles.tlV]} />
      <View style={[styles.tickH, styles.trH]} />
      <View style={[styles.tickV, styles.trV]} />
    </View>
  );
}

const TICK = 14;

const styles = StyleSheet.create({
  vLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: GRID_COLOR,
  },
  hLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: GRID_COLOR,
  },
  glow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '85%',
    height: 260,
  },
  tickH: {
    position: 'absolute',
    height: 1.5,
    width: TICK,
    backgroundColor: colors.accentLine,
  },
  tickV: {
    position: 'absolute',
    width: 1.5,
    height: TICK,
    backgroundColor: colors.accentLine,
  },
  tlH: { top: 0, left: 0 },
  tlV: { top: 0, left: 0 },
  trH: { top: 0, right: 0 },
  trV: { top: 0, right: 0 },
});

export default React.memo(GridBackdrop);
