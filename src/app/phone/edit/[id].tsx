import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Phone } from '@/types/phone';
import { getPhone, updatePhone } from '@/services/api';
import { useFocusEffect } from 'expo-router';

export default function EditPhoneScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const fetchData = async () => {
        try {
          const data = await getPhone(Number(id));
          if (isMounted) {
            setName(data.name);
            setBrand(data.brand);
            setModel(data.model);
            setPrice(data.price.toString());
            setDescription(data.description);
            setImageUrl(data.image_url);
          }
        } catch {
          if (isMounted) {
            Alert.alert('Error', 'Failed to load phone data.', [
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

  const handleSubmit = async () => {
    if (!name.trim() || !brand.trim() || !model.trim() || !price.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required fields (Name, Brand, Model, Price).');
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid price.');
      return;
    }

    setSubmitting(true);
    const success = await updatePhone({
      id: Number(id),
      name: name.trim(),
      brand: brand.trim(),
      model: model.trim(),
      price: parsedPrice,
      description: description.trim(),
      image_url: imageUrl.trim(),
    });
    setSubmitting(false);

    if (success) {
      Alert.alert('Success', 'Phone updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('Error', 'Failed to update phone. Please try again.');
    }
  };

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

  return (
    <>
      <Stack.Screen options={{ title: `Edit: ${name}` }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            {/* Name */}
            <View style={styles.field}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Galaxy S24 Ultra"
                placeholderTextColor="#555555"
              />
            </View>

            {/* Brand */}
            <View style={styles.field}>
              <Text style={styles.label}>Brand *</Text>
              <TextInput
                style={styles.input}
                value={brand}
                onChangeText={setBrand}
                placeholder="e.g. Samsung"
                placeholderTextColor="#555555"
              />
            </View>

            {/* Model */}
            <View style={styles.field}>
              <Text style={styles.label}>Model *</Text>
              <TextInput
                style={styles.input}
                value={model}
                onChangeText={setModel}
                placeholder="e.g. SM-S928B"
                placeholderTextColor="#555555"
              />
            </View>

            {/* Price */}
            <View style={styles.field}>
              <Text style={styles.label}>Price (₱) *</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="e.g. 74999.00"
                placeholderTextColor="#555555"
                keyboardType="numeric"
              />
            </View>

            {/* Description */}
            <View style={styles.field}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter product description..."
                placeholderTextColor="#555555"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Image URL */}
            <View style={styles.field}>
              <Text style={styles.label}>Image URL</Text>
              <TextInput
                style={styles.input}
                value={imageUrl}
                onChangeText={setImageUrl}
                placeholder="https://example.com/image.jpg"
                placeholderTextColor="#555555"
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            {/* Image Preview */}
            {imageUrl.trim().length > 0 && (
              <View style={styles.previewContainer}>
                <Text style={styles.previewLabel}>Image Preview</Text>
                <Image
                  source={{ uri: imageUrl.trim() }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  form: {
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 16,
  },
  previewContainer: {
    gap: 8,
  },
  previewLabel: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
  },
  submitButton: {
    backgroundColor: '#2979FF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    elevation: 4,
    shadowColor: '#2979FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
