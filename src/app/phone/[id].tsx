import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  FadeInDown,
} from 'react-native-reanimated';
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router';
import { Phone } from '@/types/phone';
import { getPhone, deletePhone } from '@/services/api';
import { colors, font, radius, space, formatPrice, pad2 } from '@/constants/instrument';

const HERO_HEIGHT = 300;

export default function PhoneDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [phone, setPhone] = useState<Phone | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [imgError, setImgError] = useState(false);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: scrollY.value * 0.35 },
      {
        scale: interpolate(scrollY.value, [-140, 0], [1.28, 1], Extrapolation.CLAMP),
      },
    ],
  }));

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const fetchData = async () => {
        try {
          setLoading(true);
          const data = await getPhone(Number(id));
          if (isMounted) setPhone(data);
        } catch {
          if (isMounted) {
            Alert.alert('Error', 'Failed to load record.', [
              { text: 'Go Back', onPress: () => router.back() },
            ]);
          }
        } finally {
          if (isMounted) setLoading(false);
        }
      };
      fetchData();
      return () => {
        isMounted = false;
      };
    }, [id, router])
  );

  const handleDelete = () => {
    Alert.alert(
      'Delete Record',
      `Permanently remove "${phone?.name}" from the catalog? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            const success = await deletePhone(Number(id));
            setDeleting(false);
            if (success) {
              router.back();
            } else {
              Alert.alert('Error', 'Failed to delete record. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'LOADING…' }} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.centerText}>FETCHING RECORD</Text>
        </View>
      </>
    );
  }

  if (!phone) {
    return (
      <>
        <Stack.Screen options={{ title: 'NOT FOUND' }} />
        <View style={styles.center}>
          <Text style={styles.centerText}>RECORD NOT FOUND</Text>
        </View>
      </>
    );
  }

  const showImage = !!phone.image_url && !imgError;

  return (
    <>
      <Stack.Screen
        options={{
          title: `#${pad2(phone.id)}`,
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => router.push(`/phone/edit/${id}`)}
                style={styles.headerBtn}
              >
                <Text style={styles.headerBtnText}>EDIT</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                style={[styles.headerBtn, styles.headerBtnDanger]}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color={colors.danger} />
                ) : (
                  <Text style={[styles.headerBtnText, styles.headerBtnTextDanger]}>DEL</Text>
                )}
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Animated.ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* Hero */}
        <View style={styles.heroWrap}>
          {showImage ? (
            <Animated.Image
              source={{ uri: phone.image_url }}
              style={[styles.hero, heroStyle]}
              resizeMode="cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <Animated.View style={[styles.hero, styles.heroFallback, heroStyle]}>
              <Text style={styles.heroFallbackText}>NO IMAGE</Text>
            </Animated.View>
          )}
          <View style={styles.heroCaption}>
            <Text style={styles.heroCaptionText}>FIG.01 — UNIT PREVIEW</Text>
          </View>
        </View>

        <Animated.View entering={FadeInDown.duration(400)} style={styles.content}>
          {/* Identity */}
          <Text style={styles.brand}>{phone.brand.toUpperCase()}</Text>
          <Text style={styles.name}>{phone.name}</Text>

          {/* Price readout */}
          <View style={styles.priceBlock}>
            <View style={styles.priceTick} />
            <View>
              <Text style={styles.priceLabel}>SRP · PHP</Text>
              <Text style={styles.price}>{formatPrice(phone.price)}</Text>
            </View>
          </View>

          {/* Spec sheet */}
          <View style={styles.specCard}>
            <Text style={styles.specHeader}>// SPECIFICATION</Text>
            <SpecRow label="BRAND" value={phone.brand} />
            <SpecRow label="MODEL" value={phone.model} />
            <SpecRow label="UNIT ID" value={`#${pad2(phone.id)}`} />
            <SpecRow label="PRICE" value={formatPrice(phone.price)} accent last />
          </View>

          {/* Description */}
          {phone.description ? (
            <View style={styles.descCard}>
              <Text style={styles.specHeader}>// DESCRIPTION</Text>
              <Text style={styles.descText}>{phone.description}</Text>
            </View>
          ) : null}

          <Text style={styles.footer}>— END OF RECORD —</Text>
        </Animated.View>
      </Animated.ScrollView>
    </>
  );
}

function SpecRow({
  label,
  value,
  accent = false,
  last = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.specRow, !last && styles.specRowBorder]}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={[styles.specValue, accent && styles.specValueAccent]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { paddingBottom: 48 },
  center: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.lg,
  },
  centerText: {
    color: colors.textMute,
    fontFamily: font.monoMed,
    fontSize: 12,
    letterSpacing: 2,
  },
  headerActions: { flexDirection: 'row', gap: space.sm },
  headerBtn: {
    borderWidth: 1,
    borderColor: colors.accentLine,
    borderRadius: radius.sm,
    paddingHorizontal: space.sm,
    paddingVertical: 4,
  },
  headerBtnDanger: { borderColor: colors.danger },
  headerBtnText: {
    color: colors.accent,
    fontFamily: font.monoBold,
    fontSize: 11,
    letterSpacing: 1,
  },
  headerBtnTextDanger: { color: colors.danger },
  heroWrap: {
    height: HERO_HEIGHT,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  hero: { width: '100%', height: HERO_HEIGHT },
  heroFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  heroFallbackText: {
    color: colors.textMute,
    fontFamily: font.monoMed,
    fontSize: 13,
    letterSpacing: 3,
  },
  heroCaption: {
    position: 'absolute',
    left: space.xl,
    bottom: space.md,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: space.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  heroCaptionText: {
    color: colors.textDim,
    fontFamily: font.mono,
    fontSize: 9,
    letterSpacing: 1.5,
  },
  content: { paddingHorizontal: space.xl, paddingTop: space.xl },
  brand: {
    color: colors.accent,
    fontFamily: font.monoSemi,
    fontSize: 11,
    letterSpacing: 3,
  },
  name: {
    color: colors.text,
    fontFamily: font.black,
    fontSize: 30,
    letterSpacing: -1,
    lineHeight: 34,
    marginTop: space.sm,
  },
  priceBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginTop: space.xl,
  },
  priceTick: { width: 4, height: 42, backgroundColor: colors.accent },
  priceLabel: {
    color: colors.textMute,
    fontFamily: font.mono,
    fontSize: 9,
    letterSpacing: 2,
    marginBottom: 2,
  },
  price: {
    color: colors.text,
    fontFamily: font.monoBold,
    fontSize: 26,
    letterSpacing: 0.5,
  },
  specCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: space.lg,
    marginTop: space.xxl,
  },
  specHeader: {
    color: colors.textMute,
    fontFamily: font.monoSemi,
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: space.md,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: space.md,
  },
  specRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
  specLabel: {
    color: colors.textDim,
    fontFamily: font.mono,
    fontSize: 12,
    letterSpacing: 1.5,
  },
  specValue: {
    color: colors.text,
    fontFamily: font.monoMed,
    fontSize: 13,
    letterSpacing: 0.5,
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: space.md,
  },
  specValueAccent: { color: colors.accent, fontFamily: font.monoBold },
  descCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: space.lg,
    marginTop: space.lg,
  },
  descText: {
    color: colors.textDim,
    fontFamily: font.mono,
    fontSize: 13,
    lineHeight: 22,
  },
  footer: {
    color: colors.textMute,
    fontFamily: font.mono,
    fontSize: 10,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: space.xxl,
  },
});
