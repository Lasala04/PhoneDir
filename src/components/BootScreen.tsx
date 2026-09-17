import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import GridBackdrop from '@/components/GridBackdrop';
import { colors, font, radius, space } from '@/constants/instrument';

/** Animated startup sequence shown once when the app opens, then fades out. */
export default function BootScreen({ onDone }: { onDone: () => void }) {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) });
    opacity.value = withDelay(
      1750,
      withTiming(0, { duration: 350 }, (finished) => {
        if (finished) runOnJS(onDone)();
      })
    );
  }, [progress, opacity, onDone]);

  const containerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const barStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, containerStyle]}>
      <GridBackdrop />
      <View style={styles.center}>
        <Animated.Text entering={FadeInDown.duration(500)} style={styles.kicker}>
          ◇ PHONE DIRECTORY
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(120).duration(650)} style={styles.title}>
          PHONEDIR
        </Animated.Text>
        <View style={styles.track}>
          <Animated.View style={[styles.bar, barStyle]} />
        </View>
        <Animated.Text entering={FadeInDown.delay(320).duration(650)} style={styles.status}>
          INITIALIZING CATALOG…
        </Animated.Text>
      </View>
      <Text style={styles.rev}>SYSTEM · REV 1.0</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', paddingHorizontal: space.xxxl, gap: space.md, width: '100%' },
  kicker: {
    color: colors.accent,
    fontFamily: font.monoMed,
    fontSize: 11,
    letterSpacing: 3,
    marginBottom: space.xs,
  },
  title: {
    color: colors.text,
    fontFamily: font.black,
    fontSize: 44,
    letterSpacing: -1.5,
    marginBottom: space.lg,
  },
  track: {
    width: '72%',
    maxWidth: 260,
    height: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.surface2,
    overflow: 'hidden',
  },
  bar: { height: 4, borderRadius: radius.sm, backgroundColor: colors.accent },
  status: {
    color: colors.textMute,
    fontFamily: font.mono,
    fontSize: 11,
    letterSpacing: 2,
    marginTop: space.sm,
  },
  rev: {
    position: 'absolute',
    bottom: space.xxl,
    color: colors.textMute,
    fontFamily: font.mono,
    fontSize: 10,
    letterSpacing: 2,
  },
});
