import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import GridBackdrop from '@/components/GridBackdrop';
import { colors, font, radius, space } from '@/constants/instrument';

const TRACK = 190;
const BAR = 58;

/** Full-screen "fancy" loading state for the instrument theme:
 *  a scanning readout bar + a blinking status label. */
export default function InstrumentLoader({ label = 'LOADING' }: { label?: string }) {
  const x = useSharedValue(0);
  const blink = useSharedValue(0.25);

  useEffect(() => {
    x.value = withRepeat(withTiming(1, { duration: 850, easing: Easing.inOut(Easing.ease) }), -1, true);
    blink.value = withRepeat(withTiming(1, { duration: 550, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [x, blink]);

  const barStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value * (TRACK - BAR) }],
  }));
  const dotStyle = useAnimatedStyle(() => ({ opacity: blink.value }));

  return (
    <View style={styles.root}>
      <GridBackdrop />
      <View style={styles.center}>
        <View style={styles.track}>
          <Animated.View style={[styles.bar, barStyle]} />
        </View>
        <View style={styles.labelRow}>
          <Animated.Text style={[styles.dot, dotStyle]}>◇</Animated.Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg },
  track: {
    width: TRACK,
    height: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.surface2,
    overflow: 'hidden',
  },
  bar: {
    width: BAR,
    height: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  dot: { color: colors.accent, fontFamily: font.mono, fontSize: 12 },
  label: {
    color: colors.textDim,
    fontFamily: font.monoSemi,
    fontSize: 12,
    letterSpacing: 3,
  },
});
