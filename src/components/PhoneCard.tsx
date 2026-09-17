import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Phone } from '@/types/phone';
import { colors, font, radius, space, formatPrice, pad2 } from '@/constants/instrument';

interface PhoneCardProps {
  phone: Phone;
  index: number;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PhoneCard({ phone, index, onPress }: PhoneCardProps) {
  const [imgError, setImgError] = useState(false);
  const scale = useSharedValue(1);
  const border = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: border.value ? colors.accentLine : colors.line,
  }));

  const showImage = !!phone.image_url && !imgError;

  return (
    <AnimatedPressable
      style={[styles.card, animatedStyle]}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.975, { duration: 120 });
        border.value = withTiming(1, { duration: 120 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 160 });
        border.value = withTiming(0, { duration: 220 });
      }}
    >
      {/* Thumbnail frame */}
      <View style={styles.thumbFrame}>
        {showImage ? (
          <Image
            source={{ uri: phone.image_url }}
            style={styles.thumb}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <View style={styles.thumbFallback}>
            <Text style={styles.thumbFallbackText}>NO{'\n'}IMG</Text>
          </View>
        )}
      </View>

      {/* Body */}
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.brand}>{phone.brand.toUpperCase()}</Text>
          <Text style={styles.index}>{pad2(index + 1)}</Text>
        </View>

        <Text style={styles.name} numberOfLines={2}>
          {phone.name}
        </Text>

        <View style={styles.bottomRow}>
          <View style={styles.priceWrap}>
            <View style={styles.priceTick} />
            <Text style={styles.price}>{formatPrice(phone.price)}</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.md,
    gap: space.md,
    marginBottom: space.md,
  },
  thumbFrame: {
    width: 88,
    height: 88,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbFallbackText: {
    color: colors.textMute,
    fontFamily: font.monoMed,
    fontSize: 11,
    letterSpacing: 2,
    textAlign: 'center',
    lineHeight: 14,
  },
  body: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    color: colors.textDim,
    fontFamily: font.monoSemi,
    fontSize: 10,
    letterSpacing: 2,
  },
  index: {
    color: colors.textMute,
    fontFamily: font.mono,
    fontSize: 10,
    letterSpacing: 1,
  },
  name: {
    color: colors.text,
    fontFamily: font.bold,
    fontSize: 17,
    lineHeight: 21,
    marginTop: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: space.sm,
  },
  priceWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  priceTick: {
    width: 3,
    height: 14,
    backgroundColor: colors.accent,
  },
  price: {
    color: colors.text,
    fontFamily: font.monoBold,
    fontSize: 15,
    letterSpacing: 0.5,
  },
  arrow: {
    color: colors.accent,
    fontFamily: font.monoBold,
    fontSize: 16,
  },
});

export default React.memo(PhoneCard);
