import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  Animated as RNAnimated,
  BackHandler,
  Platform,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone } from '@/types/phone';
import { getPhones } from '@/services/api';
import PhoneCard from '@/components/PhoneCard';
import GridBackdrop from '@/components/GridBackdrop';
import ShutdownOverlay from '@/components/ShutdownOverlay';
import { colors, font, radius, space, pad2 } from '@/constants/instrument';

function SkeletonCard() {
  const opacity = React.useRef(new RNAnimated.Value(0.35)).current;

  React.useEffect(() => {
    const animation = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(opacity, { toValue: 0.9, duration: 750, useNativeDriver: true }),
        RNAnimated.timing(opacity, { toValue: 0.35, duration: 750, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <RNAnimated.View style={[styles.skeletonCard, { opacity }]}>
      <View style={styles.skeletonThumb} />
      <View style={styles.skeletonBody}>
        <View style={styles.skeletonBrand} />
        <View style={styles.skeletonName} />
        <View style={styles.skeletonPrice} />
      </View>
    </RNAnimated.View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyBox}>
        <Text style={styles.emptyGlyph}>⌀</Text>
      </View>
      <Text style={styles.emptyTitle}>NO RECORDS</Text>
      <Text style={styles.emptySubtitle}>
        Catalog is empty. Add the first unit with the + control below.
      </Text>
    </View>
  );
}

export default function PhoneListScreen() {
  const router = useRouter();
  const [phones, setPhones] = useState<Phone[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exiting, setExiting] = useState(false);

  const fetchPhones = useCallback(async () => {
    const data = await getPhones();
    setPhones(data);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPhones();
    }, [fetchPhones])
  );

  // Android: intercept back at the home screen to play a shutdown animation
  // before the app exits. (No equivalent exists on iOS.)
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        setExiting(true);
        return true; // block the default immediate exit
      });
      return () => sub.remove();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPhones();
    setRefreshing(false);
  }, [fetchPhones]);

  const renderItem = useCallback(
    ({ item, index }: { item: Phone; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 55).duration(420)}>
        <PhoneCard
          phone={item}
          index={index}
          onPress={() => router.push(`/phone/${item.id}`)}
        />
      </Animated.View>
    ),
    [router]
  );

  return (
    <View style={styles.root}>
      <GridBackdrop />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.kicker}>◇ PHONE DIRECTORY / REV 1.0</Text>
          <View style={styles.titleRow}>
            <Text style={styles.title}>PHONEDIR</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countNum}>{pad2(phones.length)}</Text>
              <Text style={styles.countLabel}>UNITS</Text>
            </View>
          </View>
          <View style={styles.rule} />
          <View style={styles.subRow}>
            <Text style={styles.subLabel}>PRODUCT CATALOG</Text>
            <Text style={styles.subHint}>PULL ↓ TO SYNC</Text>
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.list}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : (
          <FlatList
            data={phones}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<EmptyState />}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.accent}
                colors={[colors.accent]}
                progressBackgroundColor={colors.surface}
              />
            }
          />
        )}

        {/* Add control */}
        <Pressable
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          onPress={() => router.push('/phone/add')}
        >
          <Text style={styles.fabPlus}>＋</Text>
          <Text style={styles.fabLabel}>NEW</Text>
        </Pressable>
      </SafeAreaView>

      {exiting && <ShutdownOverlay onComplete={() => BackHandler.exitApp()} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safeArea: { flex: 1 },
  header: {
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    paddingBottom: space.lg,
  },
  kicker: {
    color: colors.accent,
    fontFamily: font.monoMed,
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: space.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontFamily: font.black,
    fontSize: 40,
    letterSpacing: -1.5,
  },
  countBadge: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    alignItems: 'center',
  },
  countNum: {
    color: colors.accent,
    fontFamily: font.monoBold,
    fontSize: 18,
    letterSpacing: 1,
  },
  countLabel: {
    color: colors.textMute,
    fontFamily: font.mono,
    fontSize: 8,
    letterSpacing: 2,
  },
  rule: {
    height: 1,
    backgroundColor: colors.line,
    marginTop: space.md,
    marginBottom: space.sm,
  },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subLabel: {
    color: colors.textDim,
    fontFamily: font.monoSemi,
    fontSize: 10,
    letterSpacing: 2,
  },
  subHint: {
    color: colors.textMute,
    fontFamily: font.mono,
    fontSize: 10,
    letterSpacing: 1,
  },
  list: { paddingHorizontal: space.xl, paddingTop: space.xs, gap: space.md },
  listContent: {
    paddingHorizontal: space.xl,
    paddingTop: space.xs,
    paddingBottom: 120,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    height: 52,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
  },
  fabPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  fabPlus: {
    color: colors.onAccent,
    fontFamily: font.bold,
    fontSize: 22,
    marginTop: -2,
  },
  fabLabel: {
    color: colors.onAccent,
    fontFamily: font.monoBold,
    fontSize: 13,
    letterSpacing: 2,
  },
  // Skeleton
  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.md,
    gap: space.md,
  },
  skeletonThumb: {
    width: 88,
    height: 88,
    borderRadius: radius.sm,
    backgroundColor: colors.surface2,
  },
  skeletonBody: { flex: 1, justifyContent: 'space-between', paddingVertical: 4 },
  skeletonBrand: { width: '35%', height: 10, borderRadius: 2, backgroundColor: colors.surface2 },
  skeletonName: { width: '80%', height: 18, borderRadius: 2, backgroundColor: colors.surface2 },
  skeletonPrice: { width: '45%', height: 15, borderRadius: 2, backgroundColor: colors.surface2 },
  // Empty
  emptyContainer: { alignItems: 'center', paddingTop: 90, paddingHorizontal: space.xxxl },
  emptyBox: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.xl,
  },
  emptyGlyph: { color: colors.textMute, fontSize: 40, fontFamily: font.mono },
  emptyTitle: {
    color: colors.text,
    fontFamily: font.extrabold,
    fontSize: 20,
    letterSpacing: 1,
    marginBottom: space.sm,
  },
  emptySubtitle: {
    color: colors.textMute,
    fontFamily: font.mono,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
