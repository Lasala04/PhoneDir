import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Phone } from '@/types/phone';
import { getPhone, deletePhone } from '@/services/api';
import { useFocusEffect } from 'expo-router';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/600x400.png?text=No+Image';

export default function PhoneDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [phone, setPhone] = useState<Phone | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const fetchData = async () => {
        try {
          setLoading(true);
          const data = await getPhone(Number(id));
          if (isMounted) {
            setPhone(data);
          }
        } catch {
          if (isMounted) {
            Alert.alert('Error', 'Failed to load phone details.', [
              { text: 'Go Back', onPress: () => router.back() },
            ]);
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
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
      'Delete Phone',
      `Are you sure you want to delete "${phone?.name}"? This action cannot be undone.`,
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
              Alert.alert('Deleted', 'Phone has been deleted.', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } else {
              Alert.alert('Error', 'Failed to delete phone. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formattedPrice = phone
    ? `₱${phone.price.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : '';

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2979FF" />
        </View>
      </>
    );
  }

  if (!phone) {
    return (
      <>
        <Stack.Screen options={{ title: 'Not Found' }} />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Phone not found</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: phone.name,
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => router.push(`/phone/edit/${id}`)}
                style={styles.headerButton}
              >
                <Text style={styles.headerButtonText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                style={styles.headerButton}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#FF5252" />
                ) : (
                  <Text style={styles.headerButtonText}>🗑️</Text>
                )}
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <Image
          source={{ uri: phone.image_url || PLACEHOLDER_IMAGE }}
          style={styles.heroImage}
          resizeMode="cover"
        />

        {/* Content */}
        <View style={styles.content}>
          {/* Price Badge */}
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>{formattedPrice}</Text>
          </View>

          {/* Name */}
          <Text style={styles.phoneName}>{phone.name}</Text>

          {/* Details Grid */}
          <View style={styles.detailsCard}>
            <DetailRow label="Brand" value={phone.brand} />
            <View style={styles.divider} />
            <DetailRow label="Model" value={phone.model} />
            <View style={styles.divider} />
            <DetailRow label="Price" value={formattedPrice} accent />
          </View>

          {/* Description */}
          {phone.description ? (
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionLabel}>Description</Text>
              <Text style={styles.descriptionText}>{phone.description}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}

function DetailRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, accent && styles.detailValueAccent]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#999999',
    fontSize: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 6,
  },
  headerButtonText: {
    fontSize: 20,
  },
  heroImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#1A1A1A',
  },
  content: {
    padding: 20,
    gap: 20,
  },
  priceBadge: {
    backgroundColor: '#2979FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  phoneName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  detailsCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    color: '#888888',
    fontSize: 15,
    fontWeight: '500',
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  detailValueAccent: {
    color: '#2979FF',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#2A2A2A',
    marginVertical: 12,
  },
  descriptionCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  descriptionLabel: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  descriptionText: {
    color: '#CCCCCC',
    fontSize: 15,
    lineHeight: 24,
  },
});
