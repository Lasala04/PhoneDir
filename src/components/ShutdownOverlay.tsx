import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import GridBackdrop from '@/components/GridBackdrop';
import { colors, font, radius, space } from '@/constants/instrument';

/**
 * Android-only "power-down" animation, played before the app exits when the
 * user presses back at the home screen. Calls onComplete when finished.
 */
export default function ShutdownOverlay({ onComplete }: { onComplete: () => void }) {
  const progress = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 200 });
    progress.value = withDelay(
      160,
      withTiming(0, { duration: 900, easing: Easing.inOut(Easing.ease) }, (finished) => {
        if (finished) runOnJS(onComplete)();
      })
    );
  }, [progress, opacity, onComplete]);

  const containerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const barStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, containerStyle]}>
      <GridBackdrop />
      <View style={styles.center}>
        <Text style={styles.title}>POWERING DOWN</Text>
        <View style={styles.track}>
          <Animated.View style={[styles.bar, barStyle]} />
        </View>
        <Text style={styles.status}>SAVING SESSION · GOODBYE</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', zIndex: 50 },
  center: { alignItems: 'center', width: '100%', paddingHorizontal: space.xxxl, gap: space.md },
  title: {
    color: colors.text,
    fontFamily: font.extrabold,
    fontSize: 22,
    letterSpacing: 1,
    marginBottom: space.md,
  },
  track: {
    width: '72%',
    maxWidth: 260,
    height: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.surface2,
    overflow: 'hidden',
  },
  bar: { height: 4, borderRadius: radius.sm, backgroundColor: colors.accent, alignSelf: 'flex-start' },
  status: {
    color: colors.textMute,
    fontFamily: font.mono,
    fontSize: 10,
    letterSpacing: 2,
    marginTop: space.sm,
  },
});
