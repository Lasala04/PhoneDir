import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Phone } from '@/types/phone';

interface PhoneCardProps {
  phone: Phone;
  onPress: () => void;
}

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300x300.png?text=No+Image';

export default function PhoneCard({ phone, onPress }: PhoneCardProps) {
  const formattedPrice = `₱${phone.price.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: phone.image_url || PLACEHOLDER_IMAGE }}
        style={styles.image}
        resizeMode="cover"
        defaultSource={{ uri: PLACEHOLDER_IMAGE }}
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {phone.name}
        </Text>
        <Text style={styles.brand} numberOfLines={1}>
          {phone.brand}
        </Text>
        <Text style={styles.price}>{formattedPrice}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#262626',
  },
  info: {
    padding: 16,
    gap: 4,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  brand: {
    color: '#9E9E9E',
    fontSize: 14,
    fontWeight: '400',
  },
  price: {
    color: '#2979FF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
});
